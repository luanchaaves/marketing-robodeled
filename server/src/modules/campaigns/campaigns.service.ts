import { prisma } from '../../database/prisma.js';
import { NotFoundError } from '../../utils/errors.js';
import { logAuditEvent } from '../../middleware/auditLogger.js';
import { calculateMarketingKPIs } from '../../utils/metrics.js';
import { Prisma } from '@prisma/client';
import { Request } from 'express';

export class CampaignsService {
  async listCampaigns() {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { adCampaigns: true, socialPosts: true },
        },
      },
    });

    // Compute attribution stats for each campaign
    const enriched = await Promise.all(
      campaigns.map(async (campaign) => {
        // Find leads with this campaign name or utmCampaign
        const leads = await prisma.lead.findMany({
          where: {
            OR: [
              { campaignName: { equals: campaign.name, mode: 'insensitive' } },
              { campaignName: { equals: campaign.utmCampaign || '', mode: 'insensitive' } },
            ],
            isArchived: false,
          },
          select: {
            id: true,
            status: true,
            actualValue: true,
          },
        });

        const totalLeads = leads.length;
        const qualifiedLeads = leads.filter((l) => l.status === 'QUALIFIED' || l.status === 'QUOTE_SENT' || l.status === 'NEGOTIATING' || l.status === 'WON').length;
        const wonLeads = leads.filter((l) => l.status === 'WON').length;
        const attributedRevenue = leads
          .filter((l) => l.status === 'WON')
          .reduce((sum, l) => sum + Number(l.actualValue), 0);

        const spent = Number(campaign.actualSpent);
        const kpis = calculateMarketingKPIs({
          spend: spent,
          impressions: 0,
          clicks: 0,
          leadsCount: totalLeads,
          qualifiedLeadsCount: qualifiedLeads,
          wonDealsCount: wonLeads,
          attributedRevenue,
        });

        return {
          ...campaign,
          stats: {
            leadsCount: totalLeads,
            wonDealsCount: wonLeads,
            attributedRevenue,
            cpl: kpis.cpl,
            cac: kpis.cac,
            roas: kpis.roas,
            conversionRate: kpis.conversionRateLeadToWon,
          },
        };
      })
    );

    return enriched;
  }

  async getCampaignById(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        adCampaigns: {
          include: {
            metricsDaily: {
              orderBy: { date: 'desc' },
              take: 30,
            },
          },
        },
        socialPosts: {
          orderBy: { scheduledAt: 'desc' },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundError('Campanha não encontrada.');
    }

    return campaign;
  }

  async createCampaign(
    data: Prisma.CampaignUncheckedCreateInput,
    userId?: string,
    req?: Request
  ) {
    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        utmCampaign: data.utmCampaign || data.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      },
    });

    await logAuditEvent({
      action: 'CAMPAIGN_CREATED',
      entityType: 'Campaign',
      entityId: campaign.id,
      userId,
      req,
      details: { name: campaign.name, platform: campaign.platform },
    });

    return campaign;
  }

  async updateCampaign(
    id: string,
    data: Prisma.CampaignUncheckedUpdateInput,
    userId?: string,
    req?: Request
  ) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundError('Campanha não encontrada.');

    const updated = await prisma.campaign.update({
      where: { id },
      data,
    });

    await logAuditEvent({
      action: 'CAMPAIGN_UPDATED',
      entityType: 'Campaign',
      entityId: id,
      userId,
      req,
    });

    return updated;
  }

  async logExpense(
    id: string,
    amount: number,
    userId?: string,
    req?: Request
  ) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundError('Campanha não encontrada.');

    const newSpent = Number(campaign.actualSpent) + amount;

    const updated = await prisma.campaign.update({
      where: { id },
      data: { actualSpent: newSpent },
    });

    await logAuditEvent({
      action: 'CAMPAIGN_EXPENSE_LOGGED',
      entityType: 'Campaign',
      entityId: id,
      userId,
      req,
      details: { addedAmount: amount, totalSpent: newSpent },
    });

    return updated;
  }

  async deleteCampaign(id: string, userId?: string, req?: Request) {
    const campaign = await prisma.campaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundError('Campanha não encontrada.');

    await prisma.campaign.delete({ where: { id } });

    await logAuditEvent({
      action: 'CAMPAIGN_DELETED',
      entityType: 'Campaign',
      entityId: id,
      userId,
      req,
      details: { name: campaign.name },
    });
  }
}

export const campaignsService = new CampaignsService();
