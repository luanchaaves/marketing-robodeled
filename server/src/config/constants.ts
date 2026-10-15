export const APP_CONSTANTS = {
  APP_NAME: 'Robô LED Partner — Marketing & CRM Platform',
  DEFAULT_TIMEZONE: 'America/Sao_Paulo',
  DEFAULT_CURRENCY: 'BRL',
  SESSION_COOKIE_NAME: 'rlp_marketing_session',
  SESSION_EXPIRATION_DAYS: 7,
  INVITE_EXPIRATION_HOURS: 48,
  
  // Rate Limits
  AUTH_RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 mins
  AUTH_RATE_LIMIT_MAX_ATTEMPTS: 10,
  API_RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 min
  API_RATE_LIMIT_MAX: 180,
  
  // Roles
  ROLES: {
    ADMIN: 'ADMIN',
    MARKETING: 'MARKETING',
    READONLY: 'READONLY',
  } as const,
  
  // Lead Funnel Stages
  LEAD_STATUSES: {
    NEW_LEAD: 'NEW_LEAD',
    IN_SERVICE: 'IN_SERVICE',
    QUALIFIED: 'QUALIFIED',
    QUOTE_SENT: 'QUOTE_SENT',
    NEGOTIATING: 'NEGOTIATING',
    WON: 'WON',
    LOST: 'LOST',
  } as const,

  // Event Categories
  EVENT_TYPES: [
    'Casamento',
    'Festa de 15 Anos',
    'Corporativo',
    'Aniversário Infantil / Adulto',
    'Formatura',
    'Balada / Festival',
    'Outro',
  ] as const,

  // Attractions
  ATTRACTIONS: [
    'Robô de LED Titanium 2.8m (Megatron)',
    'Robô de LED Cyber 2.5m (Cyber LED)',
    'Robô de LED Bumblebee',
    'Robô de LED Optimus Prime',
    'Personagens Vivos (Super-Heróis / Princesas)',
    'Efeito Pistola de CO2 + Bazuca de Fumaça',
    'Combo Robô LED + Tequileiro Especial',
    'Combo Robô LED + Show de Luzes',
  ] as const,
};
