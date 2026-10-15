import { prisma } from '../../database/prisma.js';
import { calculateMarketingKPIs } from '../../utils/metrics.js';
import { Prisma } from '@prisma/client';

export type DashboardPeriod = 'today' | '7d' | '30d' | 'this_month' | 'last_month' | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

export class DashboardService {
  /**
   * Resolve date boundaries for dashboard filters in America/Sao_Paulo timezone
   */
  resolveDateRange(period: DashboardPeriod = '30d', customStart?: string, customEnd?: string): DateRange {
    const now = new Date();
    let start: Date;
    let end: Date = new Date();

    if (period === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === '7d') {
      start = new Date();
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (period === '30d') {
      start = new Date();
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (period === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    } else if (period === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    } else if (period === 'custom' && customStart && customEnd) {
      start = new Date(customStart);
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date();
      start.setDate(now.getDate() - 30);
    }

    return { start, end };
  }

  /**
   * Get full executive dashboard data
   */
  async getExecutiveDashboard(params: {
    period?: DashboardPeriod;
    startDate?: string;
    endDate?: string;
  }) {
    const { start, end } = this.resolveDateRange(params.period, params.startDate, params.endDate);

    const leadWhere: Prisma.LeadWhereInput = {
      isArchived: false,
      createdAt: { gte: start, lte: end },
    };

    // 1. Fetch leads within window
    const leads = await prisma.lead.findMany({
      where: leadWhere,
      select: {
        id: true,
        status: true,
        sourceChannel: true,
        estimatedValue: true,
        actualValue: true,
        createdAt: true,
        lossReason: true,
      },
    });

    // 2. Fetch ad metrics daily within window
    const adMetrics = await prisma.adMetricDaily.findMany({
      where: {
        date: { gte: start, lte: end },
      },
    });

    // 3. Fetch manual campaign expenses
    const manualCampaigns = await prisma.campaign.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      select: { actualSpent: true },
    });

    // Aggregate Ad Traffic KPIs
    let totalAdSpend = adMetrics.reduce((sum, m) => sum + Number(m.spend), 0);
    // Add manual campaign spend if no duplicate
    const manualSpend = manualCampaigns.reduce((sum, c) => sum + Number(c.actualSpent), 0);
    if (totalAdSpend === 0 && manualSpend > 0) {
      totalAdSpend = manualSpend;
    }

    const totalImpressions = adMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const totalReach = adMetrics.reduce((sum, m) => sum + m.reach, 0);
    const totalClicks = adMetrics.reduce((sum, m) => sum + m.clicks, 0);

    // Aggregate CRM Funnel KPIs
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(
      (l) => l.status === 'QUALIFIED' || l.status === 'QUOTE_SENT' || l.status === 'NEGOTIATING' || l.status === 'WON'
    ).length;
    const quotesSent = leads.filter(
      (l) => l.status === 'QUOTE_SENT' || l.status === 'NEGOTIATING' || l.status === 'WON'
    ).length;
    const wonLeads = leads.filter((l) => l.status === 'WON').length;
    const lostLeads = leads.filter((l) => l.status === 'LOST').length;

    const estimatedRevenue = leads.reduce((sum, l) => sum + Number(l.estimatedValue), 0);
    const attributedRevenue = leads
      .filter((l) => l.status === 'WON')
      .reduce((sum, l) => sum + Number(l.actualValue), 0);

    // Calculate guaranteed KPIs
    const kpis = calculateMarketingKPIs({
      spend: totalAdSpend,
      impressions: totalImpressions,
      clicks: totalClicks,
      leadsCount: totalLeads,
      qualifiedLeadsCount: qualifiedLeads,
      wonDealsCount: wonLeads,
      attributedRevenue,
      operationalCosts: 0,
    });

    // 4. Group by channel
    const channelMap: Record<string, { leads: number; won: number; revenue: number }> = {};
    leads.forEach((l) => {
      if (!channelMap[l.sourceChannel]) {
        channelMap[l.sourceChannel] = { leads: 0, won: 0, revenue: 0 };
      }
      channelMap[l.sourceChannel].leads++;
      if (l.status === 'WON') {
        channelMap[l.sourceChannel].won++;
        channelMap[l.sourceChannel].revenue += Number(l.actualValue);
      }
    });

    const channelBreakdown = Object.entries(channelMap).map(([channel, data]) => ({
      channel,
      leads: data.leads,
      won: data.won,
      revenue: data.revenue,
      conversionRate: data.leads > 0 ? Number(((data.won / data.leads) * 100).toFixed(1)) : 0,
    }));

    // 5. Funnel stages count
    const funnel = [
      { stage: 'Novos Leads', count: leads.filter((l) => l.status === 'NEW_LEAD').length, total: totalLeads },
      { stage: 'Em Atendimento', count: leads.filter((l) => l.status === 'IN_SERVICE').length },
      { stage: 'Qualificados', count: qualifiedLeads },
      { stage: 'Orçamentos Enviados', count: quotesSent },
      { stage: 'Em Negociação', count: leads.filter((l) => l.status === 'NEGOTIATING').length },
      { stage: 'Contratos Fechados', count: wonLeads },
      { stage: 'Perdidos', count: lostLeads },
    ];

    // 6. Overdue tasks count
    const overdueTasksCount = await prisma.leadTask.count({
      where: {
        isCompleted: false,
        dueDate: { lt: new Date() },
      },
    });

    return {
      period: params.period || '30d',
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      kpis: {
        ...kpis,
        reach: totalReach,
        quotesSent,
        lostLeads,
        estimatedRevenue,
      },
      funnel,
      channelBreakdown,
      overdueTasksCount,
      lastUpdatedAt: new Date().toISOString(),
    };
  }
}

export const dashboardService = new DashboardService();
