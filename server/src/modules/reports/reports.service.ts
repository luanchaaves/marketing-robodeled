import { prisma } from '../../database/prisma.js';
import { dashboardService, DashboardPeriod } from '../dashboard/dashboard.service.js';
import { stringify } from 'csv-stringify/sync';
import { logAuditEvent } from '../../middleware/auditLogger.js';
import { Request } from 'express';

export class ReportsService {
  async getDetailedReport(params: {
    period?: DashboardPeriod;
    startDate?: string;
    endDate?: string;
  }) {
    const { start, end } = dashboardService.resolveDateRange(params.period, params.startDate, params.endDate);

    const leads = await prisma.lead.findMany({
      where: {
        isArchived: false,
        createdAt: { gte: start, lte: end },
      },
      include: {
        assignedUser: { select: { id: true, name: true } },
      },
    });

    // 1. Loss Reasons Analysis
    const lossReasonsMap: Record<string, number> = {};
    leads
      .filter((l) => l.status === 'LOST')
      .forEach((l) => {
        const reason = l.lossReason || 'Não informado';
        lossReasonsMap[reason] = (lossReasonsMap[reason] || 0) + 1;
      });

    const lossReasons = Object.entries(lossReasonsMap).map(([reason, count]) => ({
      reason,
      count,
    }));

    // 2. Performance by Event Type
    const eventTypeMap: Record<string, { leads: number; won: number; revenue: number }> = {};
    leads.forEach((l) => {
      const type = l.eventType || 'Não especificado';
      if (!eventTypeMap[type]) eventTypeMap[type] = { leads: 0, won: 0, revenue: 0 };
      eventTypeMap[type].leads++;
      if (l.status === 'WON') {
        eventTypeMap[type].won++;
        eventTypeMap[type].revenue += Number(l.actualValue);
      }
    });

    const eventTypes = Object.entries(eventTypeMap).map(([type, d]) => ({
      eventType: type,
      leads: d.leads,
      won: d.won,
      revenue: d.revenue,
      conversionRate: d.leads > 0 ? Number(((d.won / d.leads) * 100).toFixed(1)) : 0,
    }));

    // 3. Performance by Team Member
    const userMap: Record<string, { name: string; leads: number; won: number; revenue: number }> = {};
    leads.forEach((l) => {
      const userId = l.assignedUser?.id || 'unassigned';
      const userName = l.assignedUser?.name || 'Não atribuído';
      if (!userMap[userId]) userMap[userId] = { name: userName, leads: 0, won: 0, revenue: 0 };
      userMap[userId].leads++;
      if (l.status === 'WON') {
        userMap[userId].won++;
        userMap[userId].revenue += Number(l.actualValue);
      }
    });

    const teamPerformance = Object.values(userMap);

    return {
      period: params.period || '30d',
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      totalLeads: leads.length,
      wonCount: leads.filter((l) => l.status === 'WON').length,
      lossReasons,
      eventTypes,
      teamPerformance,
    };
  }

  async exportReportCSV(params: { period?: DashboardPeriod; startDate?: string; endDate?: string }, userId?: string, req?: Request) {
    const report = await this.getDetailedReport(params);

    const rows = report.eventTypes.map((et) => ({
      'Tipo de Evento': et.eventType,
      'Total de Leads': et.leads,
      'Contratos Fechados': et.won,
      'Taxa de Conversão (%)': et.conversionRate,
      'Receita Total (R$)': et.revenue.toFixed(2),
    }));

    const csvOutput = stringify(rows, { header: true, delimiter: ';' });

    await logAuditEvent({
      action: 'EXECUTIVE_REPORT_EXPORTED_CSV',
      entityType: 'Report',
      userId,
      req,
      details: { totalRows: rows.length },
    });

    return csvOutput;
  }
}

export const reportsService = new ReportsService();
