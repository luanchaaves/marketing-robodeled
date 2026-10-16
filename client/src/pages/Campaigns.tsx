import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  DollarSign,
  TrendingUp,
  Layers,
  Edit2,
  Trash2,
  Receipt,
  X,
  Target,
  FolderOpen,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { campaignsApi } from '../services/api';
import { Campaign } from '../types';
import {
  formatCurrency,
  formatDateBR,
  formatNumberBR,
  campaignStatusLabels,
  campaignStatusColors,
  getErrorMessage,
} from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export const Campaigns: React.FC = () => {
  const { addToast } = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // New Campaign Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null);
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('META_ADS');
  const [objective, setObjective] = useState('LEAD_GENERATION');
  const [budget, setBudget] = useState<number>(1000);
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'>('ACTIVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Add Expense Modal
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [expenseAmount, setExpenseAmount] = useState<number>(150);
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expenseNotes, setExpenseNotes] = useState('');

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await campaignsApi.getAll();
      const camps = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setCampaigns(camps);
    } catch (err: any) {
      addToast('Erro ao carregar campanhas', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleOpenCreate = () => {
    setCampaignToEdit(null);
    setName('');
    setPlatform('META_ADS');
    setObjective('LEAD_GENERATION');
    setBudget(1000);
    setStatus('ACTIVE');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Campaign) => {
    setCampaignToEdit(c);
    setName(c.name);
    setPlatform(c.platform);
    setObjective(c.objective);
    setBudget(c.budget);
    setStatus(c.status);
    setStartDate(c.startDate ? c.startDate.split('T')[0] : '');
    setEndDate(c.endDate ? c.endDate.split('T')[0] : '');
    setIsModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const payload: any = {
        name,
        platform,
        objective,
        budget: Number(budget) || 0,
        status,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      };

      if (campaignToEdit) {
        await campaignsApi.update(campaignToEdit.id, payload);
        addToast('Campanha atualizada com sucesso!', 'success');
      } else {
        await campaignsApi.create(payload);
        addToast('Campanha criada com sucesso!', 'success');
      }

      setIsModalOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      addToast(getErrorMessage(err, 'Erro ao salvar campanha'), 'error');
    }
  };

  const handleDeleteCampaign = async (id: string, campName: string) => {
    if (!confirm(`Deseja realmente excluir a campanha "${campName}"?`)) return;

    try {
      await campaignsApi.delete(id);
      addToast('Campanha excluída com sucesso!', 'success');
      fetchCampaigns();
    } catch (err: any) {
      addToast('Erro ao excluir campanha', 'error');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !expenseAmount) return;

    try {
      await campaignsApi.addExpense(selectedCampaignId, {
        amount: Number(expenseAmount),
        date: new Date(expenseDate).toISOString(),
        notes: expenseNotes || undefined,
      });
      addToast('Despesa registrada com sucesso!', 'success');
      setIsExpenseModalOpen(false);
      fetchCampaigns();
    } catch (err: any) {
      addToast('Erro ao registrar despesa', 'error');
    }
  };

  // Aggregated KPIs
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const totalBudget = safeCampaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalSpent = safeCampaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
  const activeCount = safeCampaigns.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Gestão de Campanhas & Orçamentos</span>
            <Megaphone className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe o orçamento alocado, despesas reais e retorno de cada campanha de marketing
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (safeCampaigns.length > 0) {
                setSelectedCampaignId(safeCampaigns[0].id);
                setIsExpenseModalOpen(true);
              } else {
                addToast('Crie uma campanha primeiro antes de registrar despesas.', 'info');
              }
            }}
            className="flex items-center space-x-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors"
          >
            <Receipt className="w-4 h-4 text-cyan-400" />
            <span>Lançar Despesa</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Orçamento Total Planejado"
          value={formatCurrency(totalBudget)}
          icon={<DollarSign className="w-5 h-5 text-cyan-400" />}
          change={`${safeCampaigns.length} campanhas`}
          changeType="neutral"
          subtitle="Verba alocada"
        />

        <StatCard
          title="Gasto Efetivo Realizado"
          value={formatCurrency(totalSpent)}
          icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
          change={`${totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% utilizado`}
          changeType="neutral"
          subtitle="Despesas lançadas"
        />

        <StatCard
          title="Campanhas Ativas"
          value={formatNumberBR(activeCount)}
          icon={<Target className="w-5 h-5 text-emerald-400" />}
          change="Em circulação"
          changeType="positive"
          subtitle="Veiculando no momento"
        />
      </div>

      {/* Campaigns Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Lista de Campanhas</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : safeCampaigns.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <EmptyState
              icon={<FolderOpen className="w-8 h-8 text-cyan-400" />}
              title="Nenhuma campanha cadastrada"
              description="Cadastre suas campanhas do Meta Ads, Google Ads ou promoções locais para rastrear custos e ROI."
              actionLabel="Criar Primeira Campanha"
              onAction={handleOpenCreate}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Campanha / Plataforma</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Orçamento Alocado</th>
                  <th className="py-3 px-4">Gasto Real</th>
                  <th className="py-3 px-4">Uso da Verba</th>
                  <th className="py-3 px-4">Início / Fim</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {safeCampaigns.map((camp) => {
                  const percentUsed = camp.budget > 0 ? (camp.spend / camp.budget) * 100 : 0;

                  return (
                    <tr key={camp.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{camp.name}</div>
                        <div className="text-[11px] text-cyan-400 mt-0.5">
                          {camp.platform} • {camp.objective}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${campaignStatusColors[camp.status]}`}>
                          {campaignStatusLabels[camp.status] || camp.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-100">
                        {formatCurrency(camp.budget)}
                      </td>

                      <td className="py-3 px-4 font-semibold text-cyan-400">
                        {formatCurrency(camp.spend)}
                      </td>

                      <td className="py-3 px-4">
                        <div className="w-28 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full ${
                              percentUsed > 100 ? 'bg-rose-500' : percentUsed > 80 ? 'bg-amber-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${Math.min(percentUsed, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">{percentUsed.toFixed(1)}% gasto</div>
                      </td>

                      <td className="py-3 px-4 text-slate-400">
                        {camp.startDate ? formatDateBR(camp.startDate) : '—'}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(camp)}
                            title="Editar"
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                            title="Excluir"
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Campaign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">
                {campaignToEdit ? 'Editar Campanha' : 'Nova Campanha'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nome da Campanha *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Noivas 2026 - Robô Megatron VIP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Plataforma</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="META_ADS">Meta Ads</option>
                    <option value="GOOGLE_ADS">Google Ads</option>
                    <option value="TIKTOK_ADS">TikTok Ads</option>
                    <option value="INFLUENCER">Influenciadores</option>
                    <option value="LOCAL_EVENT">Evento / Feira</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="ACTIVE">Ativa</option>
                    <option value="PAUSED">Pausada</option>
                    <option value="DRAFT">Rascunho</option>
                    <option value="COMPLETED">Finalizada</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Orçamento Planejado (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Data Início</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-600/20"
                >
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Expense */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                <Receipt className="w-4 h-4 text-cyan-400" />
                <span>Lançar Despesa de Marketing</span>
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Vincular à Campanha:</label>
                <select
                  value={selectedCampaignId}
                  onChange={(e) => setSelectedCampaignId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.platform})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Valor Gasto (R$):</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Data da Despesa:</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Observações / Comprovante:</label>
                <input
                  type="text"
                  placeholder="Ex: Fatura Meta Ads #BR-12345"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-600/20"
                >
                  Registrar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
