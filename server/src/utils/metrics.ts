/**
 * Marketing & Financial Calculation Engine for Robô LED Partner
 * Strictly handles zero-division and provides rounded mathematical guarantees.
 */

export function calculateCPL(spend: number, leadsCount: number): number {
  if (spend <= 0 || leadsCount <= 0) return 0;
  return Number((spend / leadsCount).toFixed(2));
}

export function calculateCAC(spend: number, customersCount: number): number {
  if (spend <= 0 || customersCount <= 0) return 0;
  return Number((spend / customersCount).toFixed(2));
}

export function calculateROAS(revenue: number, spend: number): number {
  if (revenue <= 0 || spend <= 0) return 0;
  return Number((revenue / spend).toFixed(2));
}

export function calculateCTR(clicks: number, impressions: number): number {
  if (clicks <= 0 || impressions <= 0) return 0;
  return Number(((clicks / impressions) * 100).toFixed(2));
}

export function calculateCPC(spend: number, clicks: number): number {
  if (spend <= 0 || clicks <= 0) return 0;
  return Number((spend / clicks).toFixed(2));
}

export function calculateCPM(spend: number, impressions: number): number {
  if (spend <= 0 || impressions <= 0) return 0;
  return Number(((spend / impressions) * 1000).toFixed(2));
}

export function calculateConversionRate(converted: number, total: number): number {
  if (converted <= 0 || total <= 0) return 0;
  return Number(((converted / total) * 100).toFixed(2));
}

export interface MarketingKPIsInput {
  spend?: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  leadsCount?: number;
  totalLeads?: number;
  qualifiedLeadsCount?: number;
  qualifiedLeads?: number;
  proposalsSent?: number;
  wonDealsCount?: number;
  wonDeals?: number;
  attributedRevenue?: number;
  revenueWon?: number;
  revenueExpected?: number;
  operationalCosts?: number;
  operatingCosts?: number;
}

export interface CalculatedKPIs {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leadsCount: number;
  qualifiedLeadsCount: number;
  proposalsSent: number;
  wonDealsCount: number;
  attributedRevenue: number;
  revenueExpected: number;
  ctr: number; // Click-through rate (%)
  cpc: number; // Cost per click (R$)
  cpm: number; // Cost per 1000 impressions (R$)
  cpl: number; // Cost per lead (R$)
  cac: number; // Customer acquisition cost (R$)
  roas: number; // Return on ad spend (ratio, e.g. 4.5x)
  conversionRate: number; // % of leads that converted to contracts
  conversionRateLeadToWon: number; // alias
  qualificationRate: number; // % of leads qualified
  estimatedProfit: number; // Attributed revenue minus spend and operational costs
}

export function calculateMarketingKPIs(input: MarketingKPIsInput): CalculatedKPIs {
  const spend = input.spend || 0;
  const impressions = input.impressions || 0;
  const reach = input.reach || 0;
  const clicks = input.clicks || 0;
  const leadsCount = input.leadsCount ?? input.totalLeads ?? 0;
  const qualifiedLeadsCount = input.qualifiedLeadsCount ?? input.qualifiedLeads ?? 0;
  const proposalsSent = input.proposalsSent || 0;
  const wonDealsCount = input.wonDealsCount ?? input.wonDeals ?? 0;
  const attributedRevenue = input.attributedRevenue ?? input.revenueWon ?? 0;
  const revenueExpected = input.revenueExpected || 0;
  const operationalCosts = input.operationalCosts ?? input.operatingCosts ?? 0;

  const ctr = calculateCTR(clicks, impressions);
  const cpc = calculateCPC(spend, clicks);
  const cpm = calculateCPM(spend, impressions);
  const cpl = calculateCPL(spend, leadsCount);
  const cac = calculateCAC(spend, wonDealsCount);
  const roas = calculateROAS(attributedRevenue, spend);
  const conversionRate = calculateConversionRate(wonDealsCount, leadsCount);
  const qualificationRate = calculateConversionRate(qualifiedLeadsCount, leadsCount);
  const estimatedProfit = Number((attributedRevenue - spend - operationalCosts).toFixed(2));

  return {
    spend: Number(spend.toFixed(2)),
    impressions,
    reach,
    clicks,
    leadsCount,
    qualifiedLeadsCount,
    proposalsSent,
    wonDealsCount,
    attributedRevenue: Number(attributedRevenue.toFixed(2)),
    revenueExpected: Number(revenueExpected.toFixed(2)),
    ctr,
    cpc,
    cpm,
    cpl,
    cac,
    roas,
    conversionRate,
    conversionRateLeadToWon: conversionRate,
    qualificationRate,
    estimatedProfit,
  };
}

/**
 * Format BRL Currency (R$ 1.250,00)
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

/**
 * Format Percent (12,50%)
 */
export function formatPercentBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format((value || 0) / 100);
}
