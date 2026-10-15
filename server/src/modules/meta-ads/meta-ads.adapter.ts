import axios, { AxiosInstance } from 'axios';
import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { calculateMarketingKPIs } from '../../utils/metrics.js';

export interface MetaAdAccountData {
  id: string;
  name: string;
  currency: string;
  timezone_name: string;
  account_status: number;
}

export interface MetaCampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
}

export interface MetaInsightData {
  date_start: string;
  date_stop: string;
  impressions: string;
  reach: string;
  clicks: string;
  spend: string;
  cpc?: string;
  cpm?: string;
  ctr?: string;
  actions?: Array<{ action_type: string; value: string }>;
}

export class MetaMarketingApiAdapter {
  private apiVersion: string;
  private client: AxiosInstance;

  constructor(apiVersion = env.META_GRAPH_API_VERSION) {
    this.apiVersion = apiVersion;
    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      timeout: 20000,
    });
  }

  /**
   * Exponential backoff retry wrapper for Graph API requests
   */
  private async executeWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        return await fn();
      } catch (error: unknown) {
        attempt++;
        const axiosErr = error as { response?: { status?: number; data?: { error?: { code?: number; message?: string } } } };
        const status = axiosErr.response?.status;
        const errCode = axiosErr.response?.data?.error?.code;

        // Rate limit hit (code 17, 32, 613) or 5xx server error
        const isRateLimit = errCode === 17 || errCode === 32 || errCode === 613 || status === 429;
        const isTransient = status && status >= 500 && status < 600;

        if ((isRateLimit || isTransient) && attempt < maxRetries) {
          const delayMs = Math.pow(2, attempt) * 1000;
          logger.warn(`Meta API backoff retry ${attempt}/${maxRetries} after ${delayMs}ms. Err: ${axiosErr.response?.data?.error?.message}`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        throw error;
      }
    }
    throw new Error('Meta API retry limit exceeded.');
  }

  /**
   * Fetch accessible Ad Accounts for an access token
   */
  async getAdAccounts(accessToken: string): Promise<MetaAdAccountData[]> {
    return this.executeWithRetry(async () => {
      const response = await this.client.get('/me/adaccounts', {
        params: {
          access_token: accessToken,
          fields: 'id,name,currency,timezone_name,account_status',
          limit: 50,
        },
      });
      return response.data?.data || [];
    });
  }

  /**
   * Fetch campaigns for a given Ad Account
   */
  async getCampaigns(adAccountId: string, accessToken: string): Promise<MetaCampaignData[]> {
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    return this.executeWithRetry(async () => {
      const response = await this.client.get(`/${formattedId}/campaigns`, {
        params: {
          access_token: accessToken,
          fields: 'id,name,status,objective,daily_budget,lifetime_budget',
          limit: 100,
        },
      });
      return response.data?.data || [];
    });
  }

  /**
   * Fetch daily insights metrics for a campaign
   */
  async getCampaignDailyInsights(
    campaignId: string,
    accessToken: string,
    datePreset: string = 'last_30d'
  ): Promise<MetaInsightData[]> {
    return this.executeWithRetry(async () => {
      const response = await this.client.get(`/${campaignId}/insights`, {
        params: {
          access_token: accessToken,
          date_preset: datePreset,
          time_increment: 1, // Daily breakdown
          fields: 'date_start,date_stop,impressions,reach,clicks,spend,cpc,cpm,ctr,actions',
          limit: 100,
        },
      });
      return response.data?.data || [];
    });
  }

  /**
   * Helper to parse and calculate standard KPIs from raw Meta insights
   */
  normalizeInsight(insight: MetaInsightData) {
    const spend = parseFloat(insight.spend || '0');
    const impressions = parseInt(insight.impressions || '0', 10);
    const reach = parseInt(insight.reach || '0', 10);
    const clicks = parseInt(insight.clicks || '0', 10);

    // Extract leads / conversions from actions array
    let conversions = 0;
    if (insight.actions && Array.isArray(insight.actions)) {
      const leadAction = insight.actions.find(
        (a) =>
          a.action_type === 'lead' ||
          a.action_type === 'onsite_conversion.lead_grouped' ||
          a.action_type === 'contact' ||
          a.action_type === 'submit_application'
      );
      if (leadAction) {
        conversions = parseInt(leadAction.value || '0', 10);
      }
    }

    const kpis = calculateMarketingKPIs({
      spend,
      impressions,
      clicks,
      leadsCount: conversions,
      qualifiedLeadsCount: 0,
      wonDealsCount: 0,
      attributedRevenue: 0,
    });

    return {
      date: new Date(insight.date_start),
      spend: kpis.spend,
      impressions: kpis.impressions,
      reach,
      clicks: kpis.clicks,
      ctr: kpis.ctr,
      cpc: kpis.cpc,
      cpm: kpis.cpm,
      conversions,
      cpl: kpis.cpl,
      rawData: insight,
    };
  }
}

export const metaMarketingApiAdapter = new MetaMarketingApiAdapter();
