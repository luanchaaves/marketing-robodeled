import { z } from 'zod';

export const createInviteSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase().trim(),
  role: z.enum(['ADMIN', 'MARKETING', 'READONLY']).default('MARKETING'),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MARKETING', 'READONLY']),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'BLOCKED']),
});
