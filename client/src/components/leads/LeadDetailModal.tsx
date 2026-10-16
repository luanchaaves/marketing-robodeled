import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Sparkles,
  Flame,
  Zap,
  Snowflake,
  Tag,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  AlertCircle,
  Send,
  Edit2,
} from 'lucide-react';
import { Lead, LeadStatus } from '../../types';
import {
  formatCurrency,
  formatDateBR,
  formatPhoneBR,
  leadStatusLabels,
  leadStatusColors,
  eventTypeLabels,
  sourceChannelLabels,
  getErrorMessage,
} from '../../utils/formatters';
import { leadsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface LeadDetailModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
  onEditLead: (lead: Lead) => void;
}

type TabType = 'overview' | 'activities' | 'tasks' | 'deals' | 'attribution';

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onLeadUpdated,
  onEditLead,
}) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);

  // New activity form
  const [activityType, setActivityType] = useState<'NOTE' | 'CALL' | 'WHATSAPP' | 'PROPOSAL'>('NOTE');
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDesc, setActivityDesc] = useState('');

  // New task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');

  if (!isOpen || !lead) return null;

  const cleanPhone = (lead.whatsapp || lead.phone).replace(/\D/g, '');
  const waUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTitle.trim()) return;

    try {
      setLoading(true);
      await leadsApi.addActivity(lead.id, {
        type: activityType,
        title: activityTitle,
        description: activityDesc || undefined,
      });
      addToast('Atividade registrada com sucesso!', 'success');
      setActivityTitle('');
      setActivityDesc('');
      onLeadUpdated();
    } catch (err: any) {
      addToast(getErrorMessage(err, 'Erro ao registrar atividade'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !taskDueDate) return;

    try {
      setLoading(true);
      await leadsApi.addTask(lead.id, {
        title: taskTitle,
        dueDate: taskDueDate,
        priority: taskPriority,
      });
      addToast('Tarefa agendada com sucesso!', 'success');
      setTaskTitle('');
      setTaskDueDate('');
      onLeadUpdated();
    } catch (err: any) {
      addToast(getErrorMessage(err, 'Erro ao criar tarefa'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      await leadsApi.updateTask(lead.id, taskId, {
        completed: !currentStatus,
      });
      addToast('Status da tarefa atualizado!', 'success');
      onLeadUpdated();
    } catch (err: any) {
      addToast(getErrorMessage(err, 'Erro ao atualizar tarefa'), 'error');
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    try {
      await leadsApi.update(lead.id, { status: newStatus });
      addToast(`Status alterado para "${leadStatusLabels[newStatus]}"`, 'success');
      onLeadUpdated();
    } catch (err: any) {
      addToast(getErrorMessage(err, 'Erro ao alterar status'), 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-slide-left">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h2 className="text-xl font-bold text-slate-100">{lead.name}</h2>
              {lead.temperature === 'HOT' && (
                <span className="flex items-center text-xs font-semibold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2 py-0.5 rounded-full">
                  <Flame className="w-3.5 h-3.5 mr-1 fill-rose-500 text-rose-500" /> Quente
                </span>
              )}
              {lead.temperature === 'WARM' && (
                <span className="flex items-center text-xs font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                  <Zap className="w-3.5 h-3.5 mr-1 fill-amber-500 text-amber-500" /> Morno
                </span>
              )}
              {lead.temperature === 'COLD' && (
                <span className="flex items-center text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-full">
                  <Snowflake className="w-3.5 h-3.5 mr-1 text-cyan-400" /> Frio
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center text-slate-300">
                <Phone className="w-3.5 h-3.5 mr-1 text-slate-500" />
                {formatPhoneBR(lead.whatsapp || lead.phone)}
              </span>

              {waUrl && (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center text-emerald-400 hover:text-emerald-300 transition-colors font-medium bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded"
                >
                  <MessageCircle className="w-3.5 h-3.5 mr-1" />
                  Abrir WhatsApp
                </a>
              )}

              {lead.email && (
                <span className="flex items-center text-slate-300">
                  <Mail className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  {lead.email}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEditLead(lead)}
              title="Editar Lead"
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Etapa atual:</span>
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
              className={`text-xs font-semibold py-1 px-3 rounded-full border transition-all cursor-pointer outline-none bg-slate-950 ${
                leadStatusColors[lead.status] || 'text-slate-300 border-slate-700'
              }`}
            >
              {Object.entries(leadStatusLabels).map(([key, label]) => (
                <option key={key} value={key} className="bg-slate-900 text-slate-200">
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-300">
            <span className="text-slate-500 mr-1">Valor Estimado:</span>
            <span className="font-bold text-cyan-400 text-sm">
              {formatCurrency(lead.actualContractValue || lead.estimatedValue || 0)}
            </span>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('activities')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'activities'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Histórico ({lead.activities?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'tasks'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Tarefas ({lead.tasks?.filter((t) => !t.completed).length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'deals'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Negócios & Propostas
          </button>
          <button
            onClick={() => setActiveTab('attribution')}
            className={`py-3 px-3 border-b-2 transition-all ${
              activeTab === 'attribution'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Atribuição & UTMs
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: VISÃO GERAL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Event Info Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-cyan-400 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5" /> Detalhes do Evento
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Tipo de Evento:</span>
                    <span className="font-medium text-slate-200 text-sm">
                      {lead.eventType ? eventTypeLabels[lead.eventType] : 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Data do Evento:</span>
                    <span className="font-medium text-slate-200 text-sm flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {lead.eventDate ? formatDateBR(lead.eventDate) : 'A definir'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Cidade / Local:</span>
                    <span className="font-medium text-slate-200 text-sm flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {lead.eventCity || 'Não informada'} {lead.eventVenue ? `(${lead.eventVenue})` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Atração de Interesse:</span>
                    <span className="font-semibold text-cyan-300 text-sm">
                      {lead.attractionInterest || 'Robô de LED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attribution / Origin Card */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center">
                  <Tag className="w-4 h-4 mr-1.5 text-slate-500" /> Origem & Aquisição
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block mb-1">Canal de Aquisição:</span>
                    <span className="font-medium text-slate-200">
                      {sourceChannelLabels[lead.sourceChannel] || lead.sourceChannel}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Campanha:</span>
                    <span className="font-medium text-slate-200">
                      {lead.campaignName || lead.utmCampaign || 'Orgânico / Direto'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Responsável Interno:</span>
                    <span className="font-medium text-slate-200">
                      {lead.assignedToUser?.name || 'Não atribuído'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Data de Criação:</span>
                    <span className="font-medium text-slate-200">
                      {formatDateBR(lead.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Loss Reason Card if status is LOST */}
              {lead.status === 'LOST' && (
                <div className="bg-rose-950/30 border border-rose-900/50 rounded-xl p-5 space-y-2">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-rose-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1.5" /> Motivo da Perda
                  </h3>
                  <div className="text-xs text-rose-200">
                    <strong>Motivo:</strong> {lead.lossReason || 'Não especificado'}
                  </div>
                  {lead.lossDetails && (
                    <p className="text-xs text-slate-300 mt-1">{lead.lossDetails}</p>
                  )}
                </div>
              )}

              {/* Notes */}
              {lead.notes && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                    Observações Internas
                  </h3>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HISTÓRICO & ATIVIDADES */}
          {activeTab === 'activities' && (
            <div className="space-y-6">
              {/* Form to add activity */}
              <form onSubmit={handleAddActivity} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setActivityType('NOTE')}
                    className={`text-xs px-2.5 py-1 rounded transition-colors ${
                      activityType === 'NOTE' ? 'bg-cyan-600 text-white font-medium' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Nota
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityType('WHATSAPP')}
                    className={`text-xs px-2.5 py-1 rounded transition-colors ${
                      activityType === 'WHATSAPP' ? 'bg-emerald-600 text-white font-medium' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityType('CALL')}
                    className={`text-xs px-2.5 py-1 rounded transition-colors ${
                      activityType === 'CALL' ? 'bg-blue-600 text-white font-medium' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Ligação
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivityType('PROPOSAL')}
                    className={`text-xs px-2.5 py-1 rounded transition-colors ${
                      activityType === 'PROPOSAL' ? 'bg-purple-600 text-white font-medium' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Proposta
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Título ou resumo da atividade..."
                  value={activityTitle}
                  onChange={(e) => setActivityTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />

                <textarea
                  placeholder="Detalhes adicionais (opcional)..."
                  rows={2}
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !activityTitle.trim()}
                    className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Registrar Atividade</span>
                  </button>
                </div>
              </form>

              {/* Timeline */}
              <div className="space-y-4">
                {(!Array.isArray(lead.activities) || lead.activities.length === 0) ? (
                  <p className="text-xs text-slate-500 text-center py-6">Nenhuma atividade registrada ainda.</p>
                ) : (
                  lead.activities.map((act) => (
                    <div key={act.id} className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{act.title}</span>
                        <span className="text-[11px] text-slate-500">{formatDateBR(act.createdAt)}</span>
                      </div>
                      {act.description && (
                        <p className="text-xs text-slate-400 whitespace-pre-wrap">{act.description}</p>
                      )}
                      {act.user && (
                        <div className="text-[10px] text-slate-500 pt-1">
                          Registrado por: <span className="text-slate-400">{act.user.name}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TAREFAS */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              {/* Form to add task */}
              <form onSubmit={handleAddTask} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Ex: Ligar para confirmar se noiva recebeu vídeo do Megatron..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Data/Hora limite:</label>
                    <input
                      type="datetime-local"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Prioridade:</label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-500"
                    >
                      <option value="LOW">Baixa</option>
                      <option value="MEDIUM">Média</option>
                      <option value="HIGH">Alta</option>
                      <option value="URGENT">Urgente</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !taskTitle.trim() || !taskDueDate}
                    className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Tarefa</span>
                  </button>
                </div>
              </form>

              {/* Task List */}
              <div className="space-y-2">
                {(!Array.isArray(lead.tasks) || lead.tasks.length === 0) ? (
                  <p className="text-xs text-slate-500 text-center py-6">Nenhuma tarefa cadastrada.</p>
                ) : (
                  lead.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                        task.completed
                          ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleTask(task.id, task.completed)}
                        className="mt-0.5 text-slate-400 hover:text-cyan-400"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className={`text-xs font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {task.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 flex items-center space-x-3">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDateBR(task.dueDate)}
                          </span>
                          <span className={`font-semibold uppercase text-[10px] ${
                            task.priority === 'URGENT' ? 'text-rose-400' :
                            task.priority === 'HIGH' ? 'text-amber-400' : 'text-slate-400'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DEALS */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Orçamentos & Contratos Vinculados
                </h4>
              </div>

              {(!Array.isArray(lead.deals) || lead.deals.length === 0) ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
                  Nenhum orçamento ou contrato emitido ainda para este lead.
                </div>
              ) : (
                lead.deals.map((deal) => (
                  <div key={deal.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{deal.title}</span>
                      <span className="font-bold text-cyan-400">{formatCurrency(deal.value)}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-[11px] text-slate-400">
                      {deal.quoteCode && <span>Cotação: #{deal.quoteCode}</span>}
                      {deal.contractCode && <span>Contrato: #{deal.contractCode}</span>}
                      <span>Status: <strong className="text-slate-200">{deal.status}</strong></span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: ATRIBUIÇÃO & UTMS */}
          {activeTab === 'attribution' && (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-cyan-400">
                  Parâmetros de Rastreamento (UTMs)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div><strong>utm_source:</strong> {lead.utmSource || '—'}</div>
                  <div><strong>utm_medium:</strong> {lead.utmMedium || '—'}</div>
                  <div><strong>utm_campaign:</strong> {lead.utmCampaign || '—'}</div>
                  <div><strong>utm_content:</strong> {lead.utmContent || '—'}</div>
                  <div><strong>utm_term:</strong> {lead.utmTerm || '—'}</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                  Jornada de Toques (Touchpoints)
                </h4>
                {(!Array.isArray(lead.attributionTouches) || lead.attributionTouches.length === 0) ? (
                  <p className="text-slate-500">Nenhum touchpoint adicional registrado.</p>
                ) : (
                  <div className="space-y-2">
                    {lead.attributionTouches.map((touch) => (
                      <div key={touch.id} className="p-3 bg-slate-900 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-200">{touch.touchType}</span>
                          <span className="text-slate-400 text-[11px] ml-2">via {touch.channel}</span>
                        </div>
                        <span className="text-slate-500 text-[11px]">{formatDateBR(touch.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
