import React from 'react';
import { LeadStatus, LeadTemperature, SourceChannel, EventType } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'leadStatus' | 'temperature' | 'source' | 'eventType' | 'custom';
  status?: LeadStatus | string;
  temperature?: LeadTemperature;
  source?: SourceChannel | string;
  eventType?: EventType | string;
  colorScheme?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'slate';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'custom',
  status,
  temperature,
  source,
  eventType,
  colorScheme = 'slate',
  className = '',
}) => {
  // 1. Lead Status Mapping
  if (variant === 'leadStatus' && status) {
    const config: Record<string, { label: string; bg: string; text: string; border: string }> = {
      NEW_LEAD: {
        label: 'Novo Lead',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        border: 'border-cyan-500/30',
      },
      ATTENDING: {
        label: 'Em Atendimento',
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
      },
      QUALIFIED: {
        label: 'Qualificado',
        bg: 'bg-indigo-500/10',
        text: 'text-indigo-400',
        border: 'border-indigo-500/30',
      },
      PROPOSAL_SENT: {
        label: 'Orçamento Enviado',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
      },
      NEGOTIATION: {
        label: 'Em Negociação',
        bg: 'bg-purple-500/10',
        text: 'text-purple-400',
        border: 'border-purple-500/30',
      },
      WON: {
        label: 'Contrato Fechado',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
      },
      LOST: {
        label: 'Perdido',
        bg: 'bg-rose-500/10',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
      },
    };

    const current = config[status] || {
      label: status,
      bg: 'bg-slate-800',
      text: 'text-slate-300',
      border: 'border-slate-700',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.bg} ${current.text} ${current.border} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {current.label}
      </span>
    );
  }

  // 2. Temperature Mapping
  if (variant === 'temperature' && temperature) {
    const config = {
      HOT: { label: '🔥 Quente', bg: 'bg-red-500/10 text-red-400 border-red-500/30' },
      WARM: { label: '⚡ Morno', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
      COLD: { label: '❄️ Frio', bg: 'bg-slate-800 text-slate-400 border-slate-700' },
    }[temperature];

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${config.bg} ${className}`}
      >
        {config.label}
      </span>
    );
  }

  // 3. Source Channel Mapping
  if (variant === 'source' && source) {
    const config: Record<string, string> = {
      META_ADS: 'Meta Ads',
      META_LEAD_ADS: 'Meta Lead Ads',
      INSTAGRAM_ORGANIC: 'Instagram Orgânico',
      WHATSAPP_DIRECT: 'WhatsApp Direto',
      SITE_FORM: 'Formulário Site',
      GOOGLE_ADS: 'Google Ads',
      REFERRAL: 'Indicação',
      MANUAL: 'Cadastro Manual',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700 ${className}`}
      >
        {config[source] || source}
      </span>
    );
  }

  // 4. Event Type Mapping
  if (variant === 'eventType' && eventType) {
    const config: Record<string, string> = {
      WEDDING: '💍 Casamento',
      DEBUTANTE_15: '👑 Debutante 15 Anos',
      BIRTHDAY: '🎂 Aniversário',
      GRADUATION: '🎓 Formatura',
      CORPORATE: '🏢 Corporativo',
      CLUB_PARTY: '🎉 Balada / Show',
      OTHER: '✨ Outro Evento',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-800/90 text-cyan-300 border border-cyan-500/20 ${className}`}
      >
        {config[eventType] || eventType}
      </span>
    );
  }

  // Custom Colors
  const colors = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  }[colorScheme];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors} ${className}`}
    >
      {children}
    </span>
  );
};
