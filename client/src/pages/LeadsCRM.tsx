import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  List,
  Search,
  Plus,
  Upload,
  Download,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { LeadKanbanBoard } from '../components/leads/LeadKanbanBoard';
import { LeadTableView } from '../components/leads/LeadTableView';
import { LeadDetailModal } from '../components/leads/LeadDetailModal';
import { NewLeadModal } from '../components/leads/NewLeadModal';
import { LeadImportModal } from '../components/leads/LeadImportModal';
import { LeadExportModal } from '../components/leads/LeadExportModal';
import { AIAssistantModal } from '../components/ai/AIAssistantModal';
import { leadsApi } from '../services/api';
import { Lead, LeadStatus } from '../types';
import { useToast } from '../context/ToastContext';

export const LeadsCRM: React.FC = () => {
  const { addToast } = useToast();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [tempFilter, setTempFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  // Modal States
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (tempFilter !== 'ALL') params.temperature = tempFilter;
      if (channelFilter !== 'ALL') params.sourceChannel = channelFilter;

      const res = await leadsApi.getAll(params);
      setLeads(res.data);
    } catch (err: any) {
      addToast('Erro ao carregar base de leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, tempFilter, channelFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      // Optimistic update
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      await leadsApi.update(leadId, { status: newStatus });
      addToast('Status do lead atualizado!', 'success');
      fetchLeads();
    } catch (err: any) {
      addToast('Erro ao mover lead', 'error');
      fetchLeads();
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      await leadsApi.delete(leadId);
      addToast('Lead excluído com sucesso!', 'success');
      if (selectedLead?.id === leadId) {
        setIsDetailOpen(false);
        setSelectedLead(null);
      }
      fetchLeads();
    } catch (err: any) {
      addToast('Erro ao excluir lead', 'error');
    }
  };

  const handleOpenDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const handleEditLead = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsNewLeadOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>CRM & Funil de Leads</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
              {leads.length} Leads
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gestão de oportunidades comerciais, orçamentos e fechamento de contratos
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('kanban')}
              title="Visualização Kanban"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'kanban' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Visualização Tabela"
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsAIOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assistente IA</span>
          </button>

          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Importar CSV</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-slate-100 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Exportar</span>
          </button>

          <button
            onClick={() => {
              setLeadToEdit(null);
              setIsNewLeadOpen(true);
            }}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-xs">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone, e-mail, cidade ou atração..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500"
          />
        </form>

        {/* Status Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 text-[11px] font-medium hidden md:inline">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="ALL">Todos os Status</option>
            <option value="NEW_LEAD">1. Novo Lead</option>
            <option value="ATTENDING">2. Em Atendimento</option>
            <option value="QUALIFIED">3. Qualificado</option>
            <option value="PROPOSAL_SENT">4. Orçamento Enviado</option>
            <option value="NEGOTIATING">5. Em Negociação</option>
            <option value="WON">6. Contrato Fechado</option>
            <option value="LOST">7. Perdido</option>
          </select>
        </div>

        {/* Temperature Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 text-[11px] font-medium hidden md:inline">Temp:</span>
          <select
            value={tempFilter}
            onChange={(e) => setTempFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="ALL">Todas Temp.</option>
            <option value="HOT">🔥 Quente</option>
            <option value="WARM">⚡ Morno</option>
            <option value="COLD">❄️ Frio</option>
          </select>
        </div>

        {/* Channel Filter */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-500 text-[11px] font-medium hidden md:inline">Canal:</span>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 outline-none focus:border-cyan-500"
          >
            <option value="ALL">Todos os Canais</option>
            <option value="META_ADS">Meta Ads</option>
            <option value="META_LEAD_ADS">Meta Lead Ads</option>
            <option value="WHATSAPP_DIRECT">WhatsApp Direto</option>
            <option value="INSTAGRAM_ORGANIC">Instagram Orgânico</option>
            <option value="SITE_FORM">Formulário do Site</option>
            <option value="GOOGLE_ADS">Google Ads</option>
            <option value="REFERRAL">Indicação</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>

        <button
          onClick={fetchLeads}
          title="Recarregar"
          className="p-2 text-slate-400 hover:text-cyan-400 bg-slate-950 border border-slate-800 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main View Area (Kanban or Table) */}
      {viewMode === 'kanban' ? (
        <LeadKanbanBoard
          leads={leads}
          onSelectLead={handleOpenDetail}
          onStatusChange={handleStatusChange}
          onQuickAction={(action, lead) => {
            if (action === 'edit') handleEditLead(lead);
            if (action === 'whatsapp') {
              const clean = (lead.whatsapp || lead.phone).replace(/\D/g, '');
              window.open(`https://wa.me/55${clean}`, '_blank');
            }
          }}
        />
      ) : (
        <LeadTableView
          leads={leads}
          onSelectLead={handleOpenDetail}
          onStatusChange={handleStatusChange}
          onDeleteLead={handleDeleteLead}
        />
      )}

      {/* Modals */}
      <LeadDetailModal
        lead={selectedLead}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedLead(null);
        }}
        onLeadUpdated={() => {
          fetchLeads();
          if (selectedLead) {
            leadsApi.getById(selectedLead.id).then((res) => setSelectedLead(res.data));
          }
        }}
        onEditLead={(lead) => {
          setIsDetailOpen(false);
          handleEditLead(lead);
        }}
      />

      <NewLeadModal
        isOpen={isNewLeadOpen}
        leadToEdit={leadToEdit}
        onClose={() => {
          setIsNewLeadOpen(false);
          setLeadToEdit(null);
        }}
        onLeadSaved={fetchLeads}
      />

      <LeadImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={fetchLeads}
      />

      <LeadExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
      />
    </div>
  );
};
