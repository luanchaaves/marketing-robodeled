import React from 'react';
import {
  LayoutDashboard,
  Users2,
  Megaphone,
  TrendingUp,
  Instagram,
  CalendarDays,
  Zap,
  BarChart3,
  Boxes,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab =
  | 'dashboard'
  | 'leads'
  | 'campaigns'
  | 'traffic'
  | 'instagram'
  | 'editorial'
  | 'automations'
  | 'reports'
  | 'integrations'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenNewLeadModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user } = useAuth();

  const menuItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'leads', label: 'Leads e CRM', icon: <Users2 className="w-5 h-5" />, badge: 'Funil' },
    { id: 'campaigns', label: 'Campanhas', icon: <Megaphone className="w-5 h-5" /> },
    { id: 'traffic', label: 'Tráfego Pago', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'instagram', label: 'Instagram & Mídia', icon: <Instagram className="w-5 h-5" /> },
    { id: 'editorial', label: 'Calendário Editorial', icon: <CalendarDays className="w-5 h-5" /> },
    { id: 'automations', label: 'Automações', icon: <Zap className="w-5 h-5" /> },
    { id: 'reports', label: 'Relatórios & ROI', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrações', icon: <Boxes className="w-5 h-5" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-[#0E131F] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900 border border-purple-500/30 shadow-md shadow-purple-500/20 p-1 overflow-hidden shrink-0">
              <img
                src="/logo.png"
                alt="Robô LED Partner"
                className="w-full h-full object-contain"
              />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-wide text-white">ROBÔ LED</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PARTNER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Marketing & CRM Intelligence</p>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Assistant Banner */}
        <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-br from-cyan-950/40 to-blue-950/40 border border-cyan-500/20">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assistente IA Integrado</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Gere copys, ideias para o Instagram e briefings de campanhas em segundos.
          </p>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'Usuário'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase shrink-0">
            {user?.role || 'USER'}
          </span>
        </div>
      </aside>
    </>
  );
};
