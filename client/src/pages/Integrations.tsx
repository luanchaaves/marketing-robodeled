import React, { useState, useEffect } from 'react';
import {
  Link2,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  X,
} from 'lucide-react';
import { integrationsApi } from '../services/api';
import { IntegrationConfig } from '../types';
import { formatDateBR } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

interface IntegrationCardProps {
  id: string;
  name: string;
  provider: string;
  description: string;
  category: string;
  connected: boolean;
  lastSyncAt?: string | null;
  onConfigure: () => void;
  onTest: () => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  description,
  category,
  connected,
  lastSyncAt,
  onConfigure,
  onTest,
}) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          {category}
        </span>
        <span
          className={`flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            connected
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          {connected ? (
            <>
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Conectado
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 mr-1 text-slate-400" /> Não configurado
            </>
          )}
        </span>
      </div>

      <h3 className="text-sm font-bold text-slate-100">{name}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
    </div>

    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
      <span className="text-[11px] text-slate-500">
        {lastSyncAt ? `Sincronizado: ${formatDateBR(lastSyncAt)}` : 'Sem sincronização'}
      </span>

      <div className="flex items-center space-x-2">
        {connected && (
          <button
            onClick={onTest}
            className="px-2.5 py-1 text-[11px] text-slate-300 hover:text-cyan-400 bg-slate-950 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          >
            Testar
          </button>
        )}
        <button
          onClick={onConfigure}
          className="px-3 py-1 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md shadow-cyan-600/20 transition-all"
        >
          Configurar
        </button>
      </div>
    </div>
  </div>
);

export const Integrations: React.FC = () => {
  const { addToast } = useToast();

  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);

  // Config Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string>('');
  const [activeTitle, setActiveTitle] = useState<string>('');
  const [configFields, setConfigFields] = useState<any>({});

  const fetchIntegrations = async () => {
    try {
      const res = await integrationsApi.getAll();
      const rawList = res.data?.data || res.data || [];
      setIntegrations(Array.isArray(rawList) ? rawList : []);
    } catch (err: any) {
      addToast('Erro ao carregar integrações', 'error');
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const safeIntegrations = Array.isArray(integrations) ? integrations : [];

  const handleOpenConfig = (provider: string, title: string) => {
    setActiveProvider(provider);
    setActiveTitle(title);
    const existing = safeIntegrations.find((i) => i.provider === provider);
    setConfigFields(existing?.settings || {});
    setIsModalOpen(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await integrationsApi.save(activeProvider, {
        enabled: true,
        settings: configFields,
      });
      addToast(`Configuração de ${activeTitle} salva com sucesso!`, 'success');
      setIsModalOpen(false);
      fetchIntegrations();
    } catch (err: any) {
      addToast('Erro ao salvar configuração', 'error');
    }
  };

  const handleTestIntegration = async (provider: string) => {
    try {
      await integrationsApi.test(provider);
      addToast(`Teste de conexão com ${provider} efetuado com sucesso!`, 'success');
    } catch (err: any) {
      addToast(`Falha no teste com ${provider}`, 'error');
    }
  };

  const isConnected = (p: string) => {
    const item = safeIntegrations.find((i) => i.provider === p);
    return item ? item.enabled : false;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Central de Integrações Oficiais</span>
            <Link2 className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Conecte suas contas do Meta Ads, WhatsApp Cloud, Webhooks n8n, Cotações e Provedores de IA
          </p>
        </div>
      </div>

      {/* Grid of integrations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <IntegrationCard
          id="meta"
          provider="META_ADS"
          name="Meta Marketing & Lead Ads API"
          category="Tráfego Pago & Leads"
          description="Sincroniza campanhas, métricas de anúncios e recebe leads instantâneos via webhook com verificação SHA-256."
          connected={isConnected('META_ADS')}
          onConfigure={() => handleOpenConfig('META_ADS', 'Meta Marketing API')}
          onTest={() => handleTestIntegration('META_ADS')}
        />

        <IntegrationCard
          id="whatsapp"
          provider="WHATSAPP_CLOUD"
          name="WhatsApp Cloud API (Meta Oficial)"
          category="Mensagens & CRM"
          description="Disparo automático de templates de primeiro atendimento e alertas de follow-up diretamente para o cliente."
          connected={isConnected('WHATSAPP_CLOUD')}
          onConfigure={() => handleOpenConfig('WHATSAPP_CLOUD', 'WhatsApp Cloud API')}
          onTest={() => handleTestIntegration('WHATSAPP_CLOUD')}
        />

        <IntegrationCard
          id="n8n"
          provider="N8N_WEBHOOKS"
          name="n8n Automações & Webhooks"
          category="Fluxos de Trabalho"
          description="Disparo de eventos em tempo real com assinatura HMAC para o motor de workflows n8n da empresa."
          connected={isConnected('N8N_WEBHOOKS')}
          onConfigure={() => handleOpenConfig('N8N_WEBHOOKS', 'n8n Webhook')}
          onTest={() => handleTestIntegration('N8N_WEBHOOKS')}
        />

        <IntegrationCard
          id="cotacao"
          provider="SISTEMA_COTACAO"
          name="Sistema de Cotação Robô LED"
          category="Ecossistema Parceiro"
          description="Importa orçamentos emitidos pelos clientes e vincula dados da festa ao lead do CRM automaticamente."
          connected={isConnected('SISTEMA_COTACAO')}
          onConfigure={() => handleOpenConfig('SISTEMA_COTACAO', 'Sistema de Cotação')}
          onTest={() => handleTestIntegration('SISTEMA_COTACAO')}
        />

        <IntegrationCard
          id="contrato"
          provider="SISTEMA_CONTRATO"
          name="Sistema de Contratos & Pagamentos"
          category="Ecossistema Parceiro"
          description="Notifica o fechamento de contrato para atualizar o status do lead para Ganho e calcular ROAS real."
          connected={isConnected('SISTEMA_CONTRATO')}
          onConfigure={() => handleOpenConfig('SISTEMA_CONTRATO', 'Sistema de Contratos')}
          onTest={() => handleTestIntegration('SISTEMA_CONTRATO')}
        />

        <IntegrationCard
          id="ai"
          provider="AI_PROVIDER"
          name="Inteligência Artificial (Gemini / OpenAI)"
          category="Geração de Conteúdo"
          description="Alimenta o Assistente de IA com geração de legendas de Instagram, briefings e ideias de anúncios."
          connected={isConnected('AI_PROVIDER')}
          onConfigure={() => handleOpenConfig('AI_PROVIDER', 'Provedor de IA')}
          onTest={() => handleTestIntegration('AI_PROVIDER')}
        />
      </div>

      {/* Config Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>Configurar {activeTitle}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Todas as chaves secretas e tokens de acesso são armazenados com criptografia segura AES-256-GCM no banco de dados.
                </span>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Token de Acesso / API Key:</label>
                <input
                  type="password"
                  placeholder="EAA..."
                  value={configFields.accessToken || configFields.apiKey || ''}
                  onChange={(e) =>
                    setConfigFields({ ...configFields, accessToken: e.target.value, apiKey: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">ID da Conta / Webhook URL / Endpoint:</label>
                <input
                  type="text"
                  placeholder="act_123456789 ou https://n8n..."
                  value={configFields.accountId || configFields.webhookUrl || configFields.appSecret || ''}
                  onChange={(e) =>
                    setConfigFields({
                      ...configFields,
                      accountId: e.target.value,
                      webhookUrl: e.target.value,
                      appSecret: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500 font-mono"
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
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg shadow-lg shadow-cyan-600/20"
                >
                  Salvar Integração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
