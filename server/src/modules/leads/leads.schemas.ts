import { z } from 'zod';

export const createLeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').trim(),
  phone: z.string().min(8, 'Telefone deve ter no mínimo 8 dígitos').trim(),
  whatsapp: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  status: z
    .enum(['NEW_LEAD', 'IN_SERVICE', 'QUALIFIED', 'QUOTE_SENT', 'NEGOTIATING', 'WON', 'LOST'])
    .default('NEW_LEAD'),
  lossReason: z.string().optional(),
  sourceChannel: z
    .enum([
      'META_ADS',
      'INSTAGRAM_ORGANIC',
      'SITE_FORM',
      'WHATSAPP_DIRECT',
      'GOOGLE_ADS',
      'REFERRAL',
      'MANUAL',
      'CSV_IMPORT',
      'OTHER',
    ])
    .default('MANUAL'),
  campaignName: z.string().optional(),
  adSetName: z.string().optional(),
  adName: z.string().optional(),
  eventType: z.string().optional(),
  eventDate: z.string().optional(), // ISO Date String
  eventCity: z.string().optional(),
  eventLocation: z.string().optional(),
  attractionInterest: z.string().optional(),
  estimatedValue: z.coerce.number().min(0).default(0),
  actualValue: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  assignedToUserId: z.string().uuid().optional().nullable(),
  nextAction: z.string().optional(),
  nextActionDate: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const updateLeadStatusSchema = z.object({
  status: z.enum(['NEW_LEAD', 'IN_SERVICE', 'QUALIFIED', 'QUOTE_SENT', 'NEGOTIATING', 'WON', 'LOST']),
  lossReason: z.string().optional(),
  note: z.string().optional(),
});

export const createLeadActivitySchema = z.object({
  type: z.enum(['NOTE', 'CALL', 'WHATSAPP_MESSAGE', 'EMAIL', 'QUOTE_CREATED', 'CONTRACT_SIGNED', 'SYSTEM']).default('NOTE'),
  title: z.string().min(1, 'Título é obrigatório').trim(),
  description: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const createLeadTaskSchema = z.object({
  title: z.string().min(1, 'Título da tarefa é obrigatório').trim(),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Data de vencimento obrigatória'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedToUserId: z.string().uuid().optional().nullable(),
});

export const duplicateCheckSchema = z.object({
  phone: z.string().optional(),
  email: z.string().optional(),
  name: z.string().optional(),
});

export const importLeadsSchema = z.object({
  leads: z.array(createLeadSchema),
});
