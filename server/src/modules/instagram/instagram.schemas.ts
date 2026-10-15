import { z } from 'zod';

export const createSocialPostSchema = z.object({
  title: z.string().min(2, 'Título interno é obrigatório').trim(),
  platform: z.enum(['INSTAGRAM', 'TIKTOK', 'FACEBOOK']).default('INSTAGRAM'),
  format: z.enum(['REELS', 'FEED_CAROUSEL', 'FEED_IMAGE', 'STORIES']).default('REELS'),
  caption: z.string().optional(),
  hashtags: z.string().optional(),
  cta: z.string().optional(),
  mediaUrls: z.array(z.string()).default([]),
  scheduledAt: z.string().optional(),
  status: z
    .enum(['IDEA', 'IN_PRODUCTION', 'PENDING_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'FAILED', 'CANCELLED'])
    .default('IDEA'),
  objective: z.string().optional(),
  campaignId: z.string().uuid().optional().nullable(),
});

export const updateSocialPostSchema = createSocialPostSchema.partial();

export const updatePostStatusSchema = z.object({
  status: z.enum(['IDEA', 'IN_PRODUCTION', 'PENDING_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'FAILED', 'CANCELLED']),
  errorMessage: z.string().optional(),
});

export const createMediaAssetSchema = z.object({
  title: z.string().min(2, 'Título da mídia é obrigatório').trim(),
  category: z
    .enum([
      'ROBO_LED',
      'PERSONAGEM',
      'CASAMENTO',
      'FESTA_15_ANOS',
      'CORPORATIVO',
      'ANIVERSARIO',
      'BASTIDORES',
      'DEPOIMENTO',
      'OFERTA',
      'OUTRO',
    ])
    .default('ROBO_LED'),
  fileUrl: z.string().min(1, 'URL ou caminho do arquivo é obrigatório'),
  fileType: z.enum(['image', 'video', 'document']).default('image'),
  fileSize: z.coerce.number().default(0),
  mimeType: z.string().default('image/jpeg'),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
});
