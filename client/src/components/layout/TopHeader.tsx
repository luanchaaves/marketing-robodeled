import React, { useState } from 'react';
import {
  Menu,
  Plus,
  LogOut,
  ExternalLink,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from './Sidebar';
import { Button } from '../common/Button';

interface TopHeaderProps {
  currentTab: NavTab;
  onOpenMobileMenu: () => void;
  onOpenNewLead: () => void;
  onOpenAIModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onOpenMobileMenu,
  onOpenNewLead,
  onOpenAIModal,
}) => {
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const tabTitles: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Painel Executivo',
      subtitle: 'Métricas de tráfego, conversões, ROAS e faturamento do Robô LED',
    },
    leads: {
      title: 'Gestão de Leads & CRM Comercial',
      subtitle: 'Pipeline de oportunidades, funil de atendimento e tarefas de follow-up',
    },
    campaigns: {
      title: 'Campanhas de Marketing',
      subtitle: 'Controle orçamentário, despesas manuais e performance de atração',
    },
    traffic: {
      title: 'Tráfego Pago & Meta Ads',
      subtitle: 'Sincronização em tempo real da API Graph v21.0 do Facebook & Instagram',
    },
    instagram: {
      title: 'Instagram & Mídia Visual',
      subtitle: 'Banco de fotos e vídeos dos Robôs de LED, Tequileiros e Cabine 360',
    },
    editorial: {
      title: 'Planejamento & Calendário Editorial',
      subtitle: 'Agendamento de posts, Reels e carrosséis com fluxo de aprovação',
    },
    automations: {
      title: 'Automações & Webhooks',
      subtitle: 'Disparos instantâneos para WhatsApp Cloud, Meta Lead Ads e fluxos n8n',
    },
    reports: {
      title: 'Relatórios Analíticos & BI',
      subtitle: 'Análises detalhadas por tipo de evento, motivos de perda e exportação CSV',
    },
    integrations: {
      title: 'Central de Integrações Oficiais',
      subtitle: 'Conexões com Meta Ads, WhatsApp Cloud, Sistema de Cotação e IA',
    },
    settings: {
      title: 'Configurações do Sistema & Equipe',
      subtitle: 'Gestão de usuários, convites com RBAC e logs de auditoria administrativa',
    },
  };

  const currentInfo = tabTitles[currentTab] || {
    title: 'Robô LED Partner',
    subtitle: 'Marketing Platform',
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B0F17]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Left: Mobile hamburger & breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white lg:hidden border border-slate-700/60"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {currentInfo.title}
            </h1>
          </div>
          <p className="hidden sm:block text-xs text-slate-400 mt-0.5">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Quick actions, Ecosystem links, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Assistant button */}
        {onOpenAIModal && (
          <Button
            onClick={onOpenAIModal}
            variant="outline"
            size="sm"
            icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
            className="hidden sm:inline-flex"
          >
            Assistente IA
          </Button>
        )}

        {/* Quick New Lead Button */}
        <Button
          onClick={onOpenNewLead}
          variant="glow"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
        >
          <span className="hidden sm:inline">Novo Lead</span>
          <span className="sm:hidden">Lead</span>
        </Button>

        {/* Ecosystem dropdown or shortcut */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500 font-semibold mr-1">ECOSSISTEMA:</span>
          <a
            href="https://cotacao.roboledpartner.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-0.5"
          >
            Cotação <ExternalLink className="w-3 h-3" />
          </a>
          <span className="text-slate-700">|</span>
          <a
            href="https://contratos.roboledpartner.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-0.5"
          >
            Contratos <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700/60"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#111827] border border-slate-800 shadow-2xl py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                    {user?.role}
                  </span>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors font-medium text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair da conta</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
