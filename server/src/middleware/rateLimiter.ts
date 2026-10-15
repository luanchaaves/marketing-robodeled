import rateLimit from 'express-rate-limit';
import { APP_CONSTANTS } from '../config/constants.js';

export const authLimiter = rateLimit({
  windowMs: APP_CONSTANTS.AUTH_RATE_LIMIT_WINDOW_MS,
  max: APP_CONSTANTS.AUTH_RATE_LIMIT_MAX_ATTEMPTS,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Muitas tentativas de autenticação. Por segurança, tente novamente em 15 minutos.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: APP_CONSTANTS.API_RATE_LIMIT_WINDOW_MS,
  max: APP_CONSTANTS.API_RATE_LIMIT_MAX,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Limite de requisições excedido. Reduza a frequência de chamadas.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
