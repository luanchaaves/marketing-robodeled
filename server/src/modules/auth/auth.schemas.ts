import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase().trim(),
  password: z.string().min(8, 'A senha deve conter no mínimo 8 caracteres'),
});

export const setupFirstAdminSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').trim(),
  email: z.string().email('E-mail inválido').toLowerCase().trim(),
  password: z
    .string()
    .min(10, 'A senha deve conter no mínimo 10 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
  setupToken: z.string().min(16, 'Token de inicialização inválido'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(10, 'A nova senha deve conter no mínimo 10 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(10, 'Token de convite obrigatório'),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').trim(),
  password: z
    .string()
    .min(10, 'A senha deve conter no mínimo 10 caracteres')
    .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'A senha deve conter pelo menos um caractere especial'),
});
