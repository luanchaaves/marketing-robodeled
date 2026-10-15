/**
 * Format currency in Brazilian Real (R$ 1.250,00)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export const formatCurrencyBRL = formatCurrency;

/**
 * Format integer numbers (1.250)
 */
export function formatNumberBR(value: number | string | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('pt-BR').format(num);
}

/**
 * Format date in Brazilian standard (DD/MM/YYYY or DD/MM/YYYY HH:mm)
 */
export function formatDateBR(
  date: string | Date | null | undefined,
  includeTime = false
): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

/**
 * Format percentage (12,5%)
 */
export function formatPercentBR(value: number | null | undefined): string {
  const num = Number(value || 0);
  return `${num.toFixed(1).replace('.', ',')}%`;
}

/**
 * Format Brazilian phone number ((11) 98765-4321)
 */
export function formatPhoneBR(phone: string | null | undefined): string {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export const leadStatusLabels: Record<string, string> = {
  NEW_LEAD: 'Novo Lead',
  ATTENDING: 'Em Atendimento',
  QUALIFIED: 'Qualificado',
  PROPOSAL_SENT: 'Orçamento Enviado',
  NEGOTIATION: 'Em Negociação',
  WON: 'Contrato Fechado',
  LOST: 'Perdido',
};

export const leadStatusColors: Record<string, string> = {
  NEW_LEAD: 'bg-cyan-950 text-cyan-400 border-cyan-800',
  ATTENDING: 'bg-blue-950 text-blue-400 border-blue-800',
  QUALIFIED: 'bg-indigo-950 text-indigo-400 border-indigo-800',
  PROPOSAL_SENT: 'bg-amber-950 text-amber-400 border-amber-800',
  NEGOTIATION: 'bg-purple-950 text-purple-400 border-purple-800',
  WON: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  LOST: 'bg-rose-950 text-rose-400 border-rose-800',
};

export const eventTypeLabels: Record<string, string> = {
  WEDDING: 'Casamento',
  DEBUTANTE_15: 'Debutante 15 Anos',
  BIRTHDAY: 'Aniversário',
  GRADUATION: 'Formatura',
  CORPORATE: 'Corporativo',
  CLUB_PARTY: 'Balada / Show',
  OTHER: 'Outro',
};

export const sourceChannelLabels: Record<string, string> = {
  META_ADS: 'Meta Ads',
  META_LEAD_ADS: 'Meta Lead Ads',
  INSTAGRAM_ORGANIC: 'Instagram Orgânico',
  WHATSAPP_DIRECT: 'WhatsApp Direto',
  SITE_FORM: 'Formulário do Site',
  GOOGLE_ADS: 'Google Ads',
  REFERRAL: 'Indicação',
  MANUAL: 'Manual',
};

export const campaignStatusLabels: Record<string, string> = {
  ACTIVE: 'Ativa',
  PAUSED: 'Pausada',
  DRAFT: 'Rascunho',
  COMPLETED: 'Finalizada',
};

export const campaignStatusColors: Record<string, string> = {
  ACTIVE: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  PAUSED: 'bg-amber-950 text-amber-400 border-amber-800',
  DRAFT: 'bg-slate-800 text-slate-400 border-slate-700',
  COMPLETED: 'bg-blue-950 text-blue-400 border-blue-800',
};

export const postStatusLabels: Record<string, string> = {
  DRAFT: 'Rascunho',
  PLANNED: 'Planejado',
  APPROVED: 'Aprovado',
  PUBLISHED: 'Publicado',
};

export const postStatusColors: Record<string, string> = {
  DRAFT: 'bg-slate-800 text-slate-400 border-slate-700',
  PLANNED: 'bg-blue-950 text-blue-400 border-blue-800',
  APPROVED: 'bg-amber-950 text-amber-400 border-amber-800',
  PUBLISHED: 'bg-emerald-950 text-emerald-400 border-emerald-800',
};
