import { describe, it, expect } from 'vitest';
import {
  calculateCPL,
  calculateCAC,
  calculateROAS,
  calculateCTR,
  calculateCPC,
  calculateCPM,
  calculateConversionRate,
  calculateMarketingKPIs,
} from '../../src/utils/metrics.js';

describe('Marketing Metrics & KPI Calculations', () => {
  describe('calculateCPL (Cost Per Lead)', () => {
    it('calculates CPL correctly with valid values', () => {
      expect(calculateCPL(1000, 50)).toBe(20);
      expect(calculateCPL(2500.5, 33)).toBe(75.77);
    });

    it('returns 0 when leads count is 0 without division by zero', () => {
      expect(calculateCPL(1000, 0)).toBe(0);
      expect(calculateCPL(0, 0)).toBe(0);
    });

    it('handles negative or invalid inputs gracefully', () => {
      expect(calculateCPL(-100, 10)).toBe(0);
      expect(calculateCPL(100, -5)).toBe(0);
    });
  });

  describe('calculateCAC (Customer Acquisition Cost)', () => {
    it('calculates CAC correctly with valid closed deals', () => {
      expect(calculateCAC(3000, 6)).toBe(500);
      expect(calculateCAC(4200, 7)).toBe(600);
    });

    it('returns 0 when customers count is 0 without division by zero', () => {
      expect(calculateCAC(3000, 0)).toBe(0);
    });
  });

  describe('calculateROAS (Return On Ad Spend)', () => {
    it('calculates ROAS multiplier correctly', () => {
      expect(calculateROAS(10000, 2000)).toBe(5);
      expect(calculateROAS(4200, 1840.5)).toBe(2.28);
    });

    it('returns 0 when ad spend is 0', () => {
      expect(calculateROAS(5000, 0)).toBe(0);
    });
  });

  describe('calculateCTR, calculateCPC, calculateCPM', () => {
    it('calculates CTR percentage correctly', () => {
      // 50 clicks / 1000 impressions = 5%
      expect(calculateCTR(50, 1000)).toBe(5);
    });

    it('calculates CPC correctly', () => {
      // 500 spend / 100 clicks = 5.00
      expect(calculateCPC(500, 100)).toBe(5);
    });

    it('calculates CPM correctly', () => {
      // 500 spend / 10000 impressions * 1000 = 50.00
      expect(calculateCPM(500, 10000)).toBe(50);
    });
  });

  describe('calculateConversionRate', () => {
    it('calculates lead-to-won conversion rate percentage', () => {
      // 5 won / 50 leads = 10%
      expect(calculateConversionRate(5, 50)).toBe(10);
    });

    it('returns 0 when total leads is 0', () => {
      expect(calculateConversionRate(0, 0)).toBe(0);
    });
  });

  describe('calculateMarketingKPIs comprehensive bundle', () => {
    it('generates a full verified KPI object with correct profitability math', () => {
      const kpis = calculateMarketingKPIs({
        spend: 2000,
        impressions: 40000,
        reach: 28000,
        clicks: 800,
        totalLeads: 40,
        qualifiedLeads: 20,
        proposalsSent: 15,
        wonDeals: 4,
        revenueWon: 16800,
        revenueExpected: 22000,
        operatingCosts: 4800,
      });

      expect(kpis.cpl).toBe(50);
      expect(kpis.cac).toBe(500);
      expect(kpis.roas).toBe(8.4);
      expect(kpis.ctr).toBe(2); // 800/40000 = 2%
      expect(kpis.cpc).toBe(2.5); // 2000/800 = 2.5
      expect(kpis.cpm).toBe(50); // 2000/40000 * 1000 = 50
      expect(kpis.conversionRate).toBe(10); // 4 / 40 = 10%
      expect(kpis.estimatedProfit).toBe(10000); // 16800 - 2000 - 4800 = 10000
    });
  });
});
