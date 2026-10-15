import React, { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Play,
  ToggleLeft,
  ToggleRight,
  Layers,
  X,
} from 'lucide-react';
import { automationsApi } from '../services/api';
import { AutomationRule } from '../types';
import { useToast } from '../context/ToastContext';

export const Automations: React.FC = () => {
  const { addToast } = useToast();

  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingRuleId, setTestingRuleId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState('LEAD_CREATED');
  const [actionType, setActionType] = useState('SEND_WHATSAPP');
  const [targetConfig, setTargetConfig] = useState('');

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await automationsApi.getRules();
      setRules(res.data);
    } catch (err: any) {
      addToast('Erro ao carregar regras de automação', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      setRules((prev) =>
        prev.map((r) => (r.id === id ? { ...r, active: !currentActive } : r))
      );
      await automationsApi.toggleRule(id, !currentActive);
      addToast('Status da regra atualizado!', 'success');
    } catch (err: any) {
      addToast('Erro ao alterar status da regra', 'error');
      fetchRules();
    }
  };

  const handleTestTrigger = async (rule: AutomationRule) => {
    try {
      setTestingRuleId(rule.id);
      await automationsApi.testRule(rule.id);
      addToast(`Disparo de teste da regra "${rule.name}" enviado com sucesso!`, 'success');
    } catch (err: any) {
      addToast('Erro no teste de disparo', 'error');
    } finally {
      setTestingRuleId(null);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await automationsApi.createRule({
        name,
        triggerEvent,
        actionType,
        targetConfig: targetConfig ? JSON.parse(targetConfig) : {},
        active: true,
      });
      addToast('Regra de automação criada com sucesso!', 'success');
      setIsModalOpen(false);
      setName('');
      setTargetConfig('');
      fetchRules();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao criar regra', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Automações Comerciais & Gatilhos</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure alertas automáticos de WhatsApp, notificações de follow-up e webhooks para n8n
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg shadow-amber-600/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Automação</span>
        </button>
      </div>

      {/* Rules List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Regras Configuradas</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-6 text-center text-xs text-slate-500">Carregando automações...</div>
        ) : rules.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-3">
            <Zap className="w-8 h-8 text-amber-400 mx-auto opacity-70" />
            <p className="font-semibold text-slate-200">Nenhuma automação cadastrada.</p>
            <p className="text-slate-500 max-w-sm mx-auto">
              Crie regras automáticas para responder novos leads instantaneamente e integrar com seu fluxo do n8n.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100 text-sm">{rule.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      rule.active
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {rule.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center space-x-3">
                    <span>Gatilho: <strong className="text-slate-300">{rule.triggerEvent}</strong></span>
                    <span>•</span>
                    <span>Ação: <strong className="text-cyan-400">{rule.actionType}</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTestTrigger(rule)}
                    disabled={testingRuleId === rule.id}
                    className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-amber-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>{testingRuleId === rule.id ? 'Disparando...' : 'Testar Disparo'}</span>
                  </button>

                  <button
                    onClick={() => handleToggle(rule.id, rule.active)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {rule.active ? (
                      <ToggleRight className="w-7 h-7 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: New Automation Rule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Nova Regra de Automação</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nome da Automação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Novo Lead Meta Ads → Disparar Webhook n8n"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Evento de Gatilho (Trigger)</label>
                <select
                  value={triggerEvent}
                  onChange={(e) => setTriggerEvent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="LEAD_CREATED">Novo Lead Criado (Meta Ads / Site)</option>
                  <option value="LEAD_STATUS_PROPOSAL_SENT">Status alterado para "Orçamento Enviado"</option>
                  <option value="LEAD_STATUS_WON">Status alterado para "Contrato Fechado"</option>
                  <option value="LEAD_INACTIVE_24H">Lead sem contato há mais de 24h</option>
                  <option value="QUOTE_REQUESTED">Nova Cotação Solicitada no Sistema</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Ação Executada</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="SEND_WHATSAPP">Enviar Mensagem WhatsApp (Cloud API)</option>
                  <option value="DISPATCH_N8N_WEBHOOK">Disparar Webhook com HMAC para o n8n</option>
                  <option value="INTERNAL_NOTIFICATION">Criar Alerta Interno para a Equipe</option>
                  <option value="AUTO_ASSIGN_LEAD">Atribuir Lead Automaticamente</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Configuração Adicional (JSON opcional):</label>
                <textarea
                  rows={3}
                  placeholder='{"templateName": "boas_vindas_lead", "language": "pt_BR"}'
                  value={targetConfig}
                  onChange={(e) => setTargetConfig(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-amber-500 font-mono text-[11px]"
                />
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
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-lg shadow-amber-600/20"
                >
                  Salvar Automação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
