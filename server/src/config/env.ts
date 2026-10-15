import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:3000,https://marketing.roboledpartner.com.br'),
  
  // Database
  DATABASE_URL: z.string().default('postgresql://roboled_user:roboled_secure_password_2026@localhost:5432/marketing_roboled_db?schema=public'),
  
  // Redis for BullMQ
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // Security
  SESSION_SECRET: z.string().min(32).default('robo_led_partner_super_secure_session_secret_key_2026_marketing_platform'),
  ENCRYPTION_KEY: z.string().min(32).default('robo_led_partner_aes_encryption_key_32_bytes_len_secure_key'),
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SECURE: z.coerce.boolean().default(false),
  
  // Meta Marketing & Lead Ads APIs
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_VERIFY_TOKEN: z.string().default('roboled_meta_webhook_verify_token_2026'),
  META_GRAPH_API_VERSION: z.string().default('v21.0'),
  
  // WhatsApp Business Cloud API
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().default('roboled_wa_webhook_verify_token_2026'),
  
  // n8n Integration
  N8N_WEBHOOK_URL: z.string().optional(),
  N8N_WEBHOOK_SECRET: z.string().default('roboled_n8n_secret_key_2026'),
  
  // Existing Ecosystem System URLs
  SISTEMA_COTACAO_URL: z.string().default('https://cotacao.roboledpartner.com.br'),
  SISTEMA_CONTRATO_URL: z.string().default('https://contratos.roboledpartner.com.br'),
  SISTEMA_EVENTOS_URL: z.string().default('https://agenda.roboledpartner.com.br'),
  ROBOLED_SITE_URL: z.string().default('https://roboledpartner.com.br'),
  
  // AI Provider (OpenAI / Anthropic / Gemini / Local)
  AI_PROVIDER: z.enum(['openai', 'anthropic', 'gemini', 'mock']).default('mock'),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  
  // File Upload
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(25),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Configuração inválida no .env:', JSON.stringify(parsed.error.format(), null, 2));
  throw new Error('Falha na validação das variáveis de ambiente');
}

export const env: Env = parsed.data;
