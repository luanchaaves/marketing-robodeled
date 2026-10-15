import { prisma } from '../../database/prisma.js';
import { metaMarketingApiAdapter } from './meta-ads.adapter.js';
import { encryptCredentials, decryptCredentials } from '../../utils/encryption.js';
import { logAuditEvent } from '../../middleware/auditLogger.js';
import { logger } from '../../utils/logger.js';
import { Request } from 'express';

interface MetaCredentials {
  accessToken: string;
  appId?: string;
  appSecret?: string;
}

export class MetaAdsService {
  /**
   * Get current Meta Ads integration connection status
   */
  async getConnectionStatus() {
    const integration = await prisma.integration.findUnique({
      where: { provider: 'META_ADS' },
      include: {
        adAccounts: {
          include: {
            adCampaigns: {
              select: { id: true, name: true, status: true },
            },
          },
        },
        syncRuns: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!integration) {
      return {
        isConnected: false,
        status: 'DISCONNECTED',
        lastSyncAt: null,
        adAccounts: [],
        syncRuns: [],
      };
    }

    return {
      isConnected: integration.status === 'CONNECTED',
      status: integration.status,
      lastSyncAt: integration.lastSyncAt,
      errorDetails: integration.errorDetails,
      adAccounts: integration.adAccounts,
      syncRuns: integration.syncRuns,
    };
  }

  /**
   * Connect Meta Ads with an authorized Access Token
   */
  async connectIntegration(credentials: MetaCredentials, userId?: string, req?: Request) {
    try {
      // Validate token by fetching accessible ad accounts
      const adAccounts = await metaMarketingApiAdapter.getAdAccounts(credentials.accessToken);

      const encrypted = encryptCredentials(credentials);

      const integration = await prisma.integration.upsert({
        where: { provider: 'META_ADS' },
        create: {
          provider: 'META_ADS',
          status: 'CONNECTED',
          encryptedCredentials: encrypted,
          lastSyncAt: new Date(),
        },
        update: {
          status: 'CONNECTED',
          encryptedCredentials: encrypted,
          errorDetails: null,
          lastSyncAt: new Date(),
        },
      });

      // Upsert retrieved Ad Accounts
      for (const acc of adAccounts) {
        await prisma.adAccount.upsert({
          where: { externalAccountId: acc.id },
          create: {
            integrationId: integration.id,
            externalAccountId: acc.id,
            accountName: acc.name,
            currency: acc.currency,
            timezone: acc.timezone_name,
            status: acc.account_status === 1 ? 'ACTIVE' : 'INACTIVE',
          },
          update: {
            accountName: acc.name,
            currency: acc.currency,
            timezone: acc.timezone_name,
            status: acc.account_status === 1 ? 'ACTIVE' : 'INACTIVE',
          },
        });
      }

      await logAuditEvent({
        action: 'INTEGRATION_CONNECTED',
        entityType: 'Integration',
        entityId: integration.id,
        userId,
        req,
        details: { provider: 'META_ADS', accountsFound: adAccounts.length },
      });

      return {
        success: true,
        accountsFound: adAccounts.length,
        accounts: adAccounts,
      };
    } catch (err: unknown) {
      const msg = (err as Error).message;
      logger.error({ err }, 'Falha ao conectar Meta Ads');

      await prisma.integration.upsert({
        where: { provider: 'META_ADS' },
        create: {
          provider: 'META_ADS',
          status: 'ERROR',
          errorDetails: msg,
        },
        update: {
          status: 'ERROR',
          errorDetails: msg,
        },
      });

      throw new Error(`Falha na validação do token Meta: ${msg}`);
    }
  }

  /**
   * Disconnect Meta Ads integration and purge stored credentials
   */
  async disconnectIntegration(userId?: string, req?: Request) {
    const integration = await prisma.integration.findUnique({
      where: { provider: 'META_ADS' },
    });

    if (integration) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          status: 'DISCONNECTED',
          encryptedCredentials: null,
          errorDetails: null,
        },
      });

      await logAuditEvent({
        action: 'INTEGRATION_DISCONNECTED',
        entityType: 'Integration',
        entityId: integration.id,
        userId,
        req,
        details: { provider: 'META_ADS' },
      });
    }

    return { success: true };
  }

  /**
   * Synchronize Ad Accounts, Campaigns, and Daily Metrics
   */
  async syncMetaMetrics(trigger = 'MANUAL') {
    const integration = await prisma.integration.findUnique({
      where: { provider: 'META_ADS' },
      include: { adAccounts: true },
    });

    if (!integration || integration.status !== 'CONNECTED' || !integration.encryptedCredentials) {
      return { success: false, message: 'Integração Meta Ads não está conectada.' };
    }

    const creds = decryptCredentials<MetaCredentials>(integration.encryptedCredentials);
    if (!creds?.accessToken) {
      return { success: false, message: 'Credenciais inválidas.' };
    }

    const syncRun = await prisma.integrationSyncRun.create({
      data: {
        integrationId: integration.id,
        status: 'RUNNING',
        trigger,
        startedAt: new Date(),
      },
    });

    let recordsProcessed = 0;

    try {
      for (const account of integration.adAccounts) {
        const campaigns = await metaMarketingApiAdapter.getCampaigns(
          account.externalAccountId,
          creds.accessToken
        );

        for (const metaCamp of campaigns) {
          const adCampaign = await prisma.adCampaign.upsert({
            where: { externalCampaignId: metaCamp.id },
            create: {
              adAccountId: account.id,
              externalCampaignId: metaCamp.id,
              name: metaCamp.name,
              status: metaCamp.status,
              objective: metaCamp.objective,
              dailyBudget: metaCamp.daily_budget ? parseFloat(metaCamp.daily_budget) / 100 : null,
              lifetimeBudget: metaCamp.lifetime_budget
                ? parseFloat(metaCamp.lifetime_budget) / 100
                : null,
            },
            update: {
              name: metaCamp.name,
              status: metaCamp.status,
              objective: metaCamp.objective,
              dailyBudget: metaCamp.daily_budget ? parseFloat(metaCamp.daily_budget) / 100 : null,
              lifetimeBudget: metaCamp.lifetime_budget
                ? parseFloat(metaCamp.lifetime_budget) / 100
                : null,
            },
          });

          // Fetch daily insights
          const insights = await metaMarketingApiAdapter.getCampaignDailyInsights(
            metaCamp.id,
            creds.accessToken,
            'last_30d'
          );

          for (const rawInsight of insights) {
            const normalized = metaMarketingApiAdapter.normalizeInsight(rawInsight);

            await prisma.adMetricDaily.upsert({
              where: {
                adCampaignId_date: {
                  adCampaignId: adCampaign.id,
                  date: normalized.date,
                },
              },
              create: {
                adCampaignId: adCampaign.id,
                date: normalized.date,
                impressions: normalized.impressions,
                reach: normalized.reach,
                clicks: normalized.clicks,
                spend: normalized.spend,
                cpc: normalized.cpc,
                cpm: normalized.cpm,
                ctr: normalized.ctr,
                conversions: normalized.conversions,
                cpl: normalized.cpl,
                rawData: normalized.rawData as any,
              },
              update: {
                impressions: normalized.impressions,
                reach: normalized.reach,
                clicks: normalized.clicks,
                spend: normalized.spend,
                cpc: normalized.cpc,
                cpm: normalized.cpm,
                ctr: normalized.ctr,
                conversions: normalized.conversions,
                cpl: normalized.cpl,
                rawData: normalized.rawData as any,
              },
            });

            recordsProcessed++;
          }
        }
      }

      await prisma.integrationSyncRun.update({
        where: { id: syncRun.id },
        data: {
          status: 'SUCCESS',
          recordsProcessed,
          completedAt: new Date(),
        },
      });

      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          lastSyncAt: new Date(),
          errorDetails: null,
        },
      });

      return {
        success: true,
        recordsProcessed,
        syncRunId: syncRun.id,
      };
    } catch (err: unknown) {
      const errorMsg = (err as Error).message;
      logger.error({ err }, 'Erro durante sincronização de métricas da Meta');

      await prisma.integrationSyncRun.update({
        where: { id: syncRun.id },
        data: {
          status: 'FAILED',
          errorLog: errorMsg,
          completedAt: new Date(),
        },
      });

      await prisma.integration.update({
        where: { id: integration.id },
        data: {
          errorDetails: errorMsg,
        },
      });

      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Get aggregated traffic metrics from synced AdCampaigns
   */
  async getAggregatedPaidTrafficMetrics() {
    const campaigns = await prisma.adCampaign.findMany({
      include: {
        adAccount: true,
        metricsDaily: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    });

    return campaigns.map((camp) => {
      const totalSpend = camp.metricsDaily.reduce((sum, m) => sum + Number(m.spend), 0);
      const totalImpressions = camp.metricsDaily.reduce((sum, m) => sum + m.impressions, 0);
      const totalClicks = camp.metricsDaily.reduce((sum, m) => sum + m.clicks, 0);
      const totalConversions = camp.metricsDaily.reduce((sum, m) => sum + m.conversions, 0);

      const ctr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
      const cpc = totalClicks > 0 ? Number((totalSpend / totalClicks).toFixed(2)) : 0;
      const cpm = totalImpressions > 0 ? Number(((totalSpend / totalImpressions) * 1000).toFixed(2)) : 0;
      const cpl = totalConversions > 0 ? Number((totalSpend / totalConversions).toFixed(2)) : 0;

      return {
        id: camp.id,
        externalId: camp.externalCampaignId,
        name: camp.name,
        status: camp.status,
        objective: camp.objective,
        accountName: camp.adAccount.accountName,
        metrics: {
          spend: Number(totalSpend.toFixed(2)),
          impressions: totalImpressions,
          clicks: totalClicks,
          conversions: totalConversions,
          ctr,
          cpc,
          cpm,
          cpl,
        },
        dailyBreakdown: camp.metricsDaily,
      };
    });
  }
}

export const metaAdsService = new MetaAdsService();
