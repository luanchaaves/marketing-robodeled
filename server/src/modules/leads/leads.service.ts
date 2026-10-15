import { prisma } from '../../database/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import { logAuditEvent } from '../../middleware/auditLogger.js';
import { LeadStatus, SourceChannel, Prisma } from '@prisma/client';
import { Request } from 'express';
import { stringify } from 'csv-stringify/sync';

export interface ListLeadsFilters {
  search?: string;
  status?: LeadStatus;
  sourceChannel?: SourceChannel;
  campaignName?: string;
  assignedToUserId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

export class LeadsService {
  /**
   * Find existing lead by phone number or create new lead
   */
  async findOrCreateByPhone(data: {
    phone: string;
    name?: string;
    email?: string;
    sourceChannel?: SourceChannel;
    notes?: string;
    estimatedValue?: number;
    eventCity?: string;
    eventDate?: Date;
  }) {
    const existing = await prisma.lead.findFirst({
      where: { phone: data.phone },
    });

    if (existing) {
      return existing;
    }

    return prisma.lead.create({
      data: {
        phone: data.phone,
        name: data.name || 'Lead Sem Nome',
        email: data.email || null,
        sourceChannel: data.sourceChannel || 'MANUAL',
        notes: data.notes || null,
        estimatedValue: data.estimatedValue || 0,
        eventCity: data.eventCity || null,
        eventDate: data.eventDate || null,
      },
    });
  }

  /**
   * List leads with comprehensive filtering and backend pagination
   */
  async listLeads(filters: ListLeadsFilters) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 25));
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      isArchived: false,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.sourceChannel) {
      where.sourceChannel = filters.sourceChannel;
    }

    if (filters.campaignName) {
      where.campaignName = { contains: filters.campaignName, mode: 'insensitive' };
    }

    if (filters.assignedToUserId) {
      where.assignedToUserId = filters.assignedToUserId;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    if (filters.search) {
      const search = filters.search.trim();
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { eventCity: { contains: search, mode: 'insensitive' } },
        { attractionInterest: { contains: search, mode: 'insensitive' } },
      ];
    }

    const sortField = filters.orderBy || 'createdAt';
    const sortDir = filters.orderDir || 'desc';

    const [total, leads] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortDir },
        include: {
          assignedUser: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { activities: true, tasks: true, deals: true },
          },
        },
      }),
    ]);

    return {
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get Kanban board data grouped by funnel stage
   */
  async getKanbanBoard() {
    const leads = await prisma.lead.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
      include: {
        assignedUser: { select: { id: true, name: true } },
        _count: { select: { tasks: true, activities: true } },
      },
    });

    const stages: Record<LeadStatus, typeof leads> = {
      NEW_LEAD: [],
      IN_SERVICE: [],
      QUALIFIED: [],
      QUOTE_SENT: [],
      NEGOTIATING: [],
      WON: [],
      LOST: [],
    };

    leads.forEach((lead) => {
      if (stages[lead.status]) {
        stages[lead.status].push(lead);
      }
    });

    return stages;
  }

  /**
   * Get single lead by ID with complete relations
   */
  async getLeadById(id: string) {
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        assignedUser: { select: { id: true, name: true, email: true } },
        activities: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          include: { assignedUser: { select: { id: true, name: true } } },
          orderBy: { dueDate: 'asc' },
        },
        deals: {
          include: { events: { orderBy: { eventDate: 'desc' } } },
          orderBy: { createdAt: 'desc' },
        },
        attributionTouches: {
          orderBy: { touchedAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead não encontrado.');
    }

    return lead;
  }

  /**
   * Duplicate detection by phone, email or name
   */
  async checkDuplicates(params: { phone?: string; email?: string; name?: string }) {
    const cleanPhone = params.phone ? params.phone.replace(/\D/g, '') : undefined;
    const conditions: Prisma.LeadWhereInput[] = [];

    if (cleanPhone && cleanPhone.length >= 8) {
      conditions.push({ phone: { contains: cleanPhone.slice(-8) } });
    }

    if (params.email && params.email.trim()) {
      conditions.push({ email: { equals: params.email.trim(), mode: 'insensitive' } });
    }

    if (params.name && params.name.trim().length >= 4) {
      conditions.push({ name: { contains: params.name.trim(), mode: 'insensitive' } });
    }

    if (conditions.length === 0) {
      return { hasDuplicates: false, matches: [] };
    }

    const matches = await prisma.lead.findMany({
      where: {
        OR: conditions,
        isArchived: false,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        status: true,
        createdAt: true,
        sourceChannel: true,
      },
      take: 5,
    });

    return {
      hasDuplicates: matches.length > 0,
      matches,
    };
  }

  /**
   * Create lead with automatic activity logging
   */
  async createLead(
    data: Prisma.LeadUncheckedCreateInput,
    userId?: string,
    req?: Request
  ) {
    const lead = await prisma.lead.create({
      data: {
        ...data,
        whatsapp: data.whatsapp || data.phone,
      },
    });

    // Record initial activity
    await prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        userId: userId || null,
        type: 'SYSTEM',
        title: 'Lead Criado',
        description: `Lead cadastrado via canal ${lead.sourceChannel}.`,
      },
    });

    await logAuditEvent({
      action: 'LEAD_CREATED',
      entityType: 'Lead',
      entityId: lead.id,
      userId,
      req,
      details: { name: lead.name, channel: lead.sourceChannel },
    });

    return lead;
  }

  /**
   * Update lead details
   */
  async updateLead(
    id: string,
    data: Prisma.LeadUncheckedUpdateInput,
    userId?: string,
    req?: Request
  ) {
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Lead não encontrado.');
    }

    const updated = await prisma.lead.update({
      where: { id },
      data,
    });

    await logAuditEvent({
      action: 'LEAD_UPDATED',
      entityType: 'Lead',
      entityId: id,
      userId,
      req,
    });

    return updated;
  }

  /**
   * Change lead funnel status with automatic activity entry
   */
  async updateLeadStatus(
    id: string,
    newStatus: LeadStatus,
    lossReason?: string,
    note?: string,
    userId?: string,
    req?: Request
  ) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundError('Lead não encontrado.');
    }

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: newStatus,
        lossReason: newStatus === 'LOST' ? lossReason : null,
        lastContactAt: new Date(),
      },
    });

    // Log status transition activity
    await prisma.leadActivity.create({
      data: {
        leadId: id,
        userId: userId || null,
        type: 'STATUS_CHANGE',
        title: `Etapa alterada para: ${newStatus}`,
        description:
          newStatus === 'LOST'
            ? `Motivo de perda: ${lossReason || 'Não informado'}. ${note ? `Nota: ${note}` : ''}`
            : note || `Status alterado de ${lead.status} para ${newStatus}`,
      },
    });

    await logAuditEvent({
      action: 'LEAD_STATUS_CHANGED',
      entityType: 'Lead',
      entityId: id,
      userId,
      req,
      details: { previousStatus: lead.status, newStatus, lossReason },
    });

    return updated;
  }

  /**
   * Delete lead (or archive)
   */
  async deleteLead(id: string, userId?: string, req?: Request) {
    const lead = await prisma.lead.findUnique({ where: { id } });
    if (!lead) {
      throw new NotFoundError('Lead não encontrado.');
    }

    await prisma.lead.delete({ where: { id } });

    await logAuditEvent({
      action: 'LEAD_DELETED',
      entityType: 'Lead',
      entityId: id,
      userId,
      req,
      details: { name: lead.name, email: lead.email },
    });
  }

  /**
   * Add activity note / communication log to lead
   */
  async addActivity(
    leadId: string,
    data: { type: string; title: string; description?: string; metadata?: Prisma.InputJsonValue },
    userId?: string
  ) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundError('Lead não encontrado.');

    const activity = await prisma.leadActivity.create({
      data: {
        leadId,
        userId: userId || null,
        type: data.type,
        title: data.title,
        description: data.description,
        metadata: data.metadata || undefined,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Update lastContactAt
    await prisma.lead.update({
      where: { id: leadId },
      data: { lastContactAt: new Date() },
    });

    return activity;
  }

  /**
   * Create follow-up task for a lead
   */
  async createTask(
    leadId: string,
    data: {
      title: string;
      description?: string;
      dueDate: string;
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      assignedToUserId?: string | null;
    }
  ) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundError('Lead não encontrado.');

    return prisma.leadTask.create({
      data: {
        leadId,
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        priority: data.priority || 'MEDIUM',
        assignedToUserId: data.assignedToUserId,
      },
      include: {
        assignedUser: { select: { id: true, name: true } },
      },
    });
  }

  /**
   * Mark task complete/incomplete
   */
  async toggleTask(taskId: string, isCompleted: boolean) {
    const task = await prisma.leadTask.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundError('Tarefa não encontrada.');

    return prisma.leadTask.update({
      where: { id: taskId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });
  }

  /**
   * Export leads to CSV with security & audit logging
   */
  async exportLeadsCSV(filters: ListLeadsFilters, userId?: string, req?: Request) {
    const result = await this.listLeads({ ...filters, limit: 10000, page: 1 });

    const records = result.data.map((lead) => ({
      ID: lead.id,
      Nome: lead.name,
      Telefone: lead.phone,
      WhatsApp: lead.whatsapp || '',
      Email: lead.email || '',
      Status: lead.status,
      'Canal de Origem': lead.sourceChannel,
      Campanha: lead.campaignName || '',
      'Tipo de Evento': lead.eventType || '',
      'Data do Evento': lead.eventDate ? lead.eventDate.toISOString().slice(0, 10) : '',
      Cidade: lead.eventCity || '',
      'Atração de Interesse': lead.attractionInterest || '',
      'Valor Estimado': Number(lead.estimatedValue).toFixed(2),
      'Valor Fechado': Number(lead.actualValue).toFixed(2),
      'Motivo de Perda': lead.lossReason || '',
      Responsável: lead.assignedUser?.name || 'Não atribuído',
      'Data de Entrada': lead.createdAt.toISOString(),
    }));

    const csvOutput = stringify(records, { header: true, delimiter: ';' });

    await logAuditEvent({
      action: 'LEADS_EXPORTED_CSV',
      entityType: 'Lead',
      userId,
      req,
      details: { count: records.length },
    });

    return csvOutput;
  }

  /**
   * Import multiple leads from verified CSV rows with duplication validation
   */
  async importLeads(
    leadsData: Array<Prisma.LeadUncheckedCreateInput>,
    userId?: string,
    req?: Request
  ) {
    const results = {
      imported: 0,
      duplicatesDetected: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < leadsData.length; i++) {
      const row = leadsData[i];
      try {
        if (!row.name || !row.phone) {
          results.errors.push(`Linha ${i + 1}: Nome e Telefone são obrigatórios.`);
          continue;
        }

        const dupCheck = await this.checkDuplicates({ phone: row.phone, email: row.email || undefined });
        if (dupCheck.hasDuplicates) {
          results.duplicatesDetected++;
        }

        await this.createLead({
          ...row,
          sourceChannel: row.sourceChannel || 'CSV_IMPORT',
        }, userId);

        results.imported++;
      } catch (err: unknown) {
        results.errors.push(`Linha ${i + 1}: ${(err as Error).message}`);
      }
    }

    await logAuditEvent({
      action: 'LEADS_IMPORTED_CSV',
      entityType: 'Lead',
      userId,
      req,
      details: results,
    });

    return results;
  }
}

export const leadsService = new LeadsService();
