import { z } from 'zod';

export const configureIntegrationSchema = z.object({
  provider: z.enum([
    'META_ADS',
    'INSTAGRAM',
    'WHATSAPP_CLOUD',
    'META_LEAD_ADS',
    'N8N',
    'SISTEMA_COTACAO',
    'SISTEMA_CONTRATO',
    'AI_ASSISTANT',
  ]),
  credentials: z.record(z.any()),
  metadata: z.record(z.any()).optional(),
});

export const testIntegrationSchema = z.object({
  provider: z.enum([
    'META_ADS',
    'INSTAGRAM',
    'WHATSAPP_CLOUD',
    'META_LEAD_ADS',
    'N8N',
    'SISTEMA_COTACAO',
    'SISTEMA_CONTRATO',
    'AI_ASSISTANT',
  ]),
});
