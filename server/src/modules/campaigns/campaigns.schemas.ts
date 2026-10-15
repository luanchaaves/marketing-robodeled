import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z.string().min(2, 'Nome da campanha é obrigatório').trim(),
  platform: z.enum(['META', 'GOOGLE', 'TIKTOK', 'ORGANIC_INSTAGRAM', 'INFLUENCER', 'OTHER']).default('META'),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']).default('ACTIVE'),
  objective: z.string().default('LEAD_GENERATION'),
  plannedBudget: z.coerce.number().min(0).default(0),
  actualSpent: z.coerce.number().min(0).default(0),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  targetAudience: z.string().optional(),
  offer: z.string().optional(),
  creativeNotes: z.string().optional(),
  landingPageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  utmSource: z.string().optional().default('facebook'),
  utmMedium: z.string().optional().default('paid_social'),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
  utmTerm: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

export const logCampaignExpenseSchema = z.object({
  amount: z.coerce.number().positive('O valor deve ser maior que zero'),
  date: z.string().optional(),
  note: z.string().optional(),
});
