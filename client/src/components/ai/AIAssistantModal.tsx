import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Copy,
  Check,
  Instagram,
  Megaphone,
  FileText,
  Loader2,
} from 'lucide-react';
import { aiApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AITool = 'captions' | 'campaigns' | 'briefing' | 'summary';

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [activeTool, setActiveTool] = useState<AITool>('captions');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState('');

  // Captions form state
  const [attraction, setAttraction] = useState('Robô Megatron LED');
  const [eventType, setEventType] = useState('Casamento');
  const [tone, setTone] = useState('Épico e emocionante');
  const [cta, setCta] = useState('Chamar no WhatsApp para checar agenda');

  // Campaign ideas form state
  const [campaignTopic, setCampaignTopic] = useState('Campanha para Noivas 2026/2027 com Combo Megatron + Tequileiros');

  // Briefing form state
  const [briefingAudience, setBriefingAudience] = useState('Debutante 15 Anos e Pais');

  if (!isOpen) return null;

  const handleGenerateCaption = async () => {
    try {
      setLoading(true);
      setOutput('');
      const prompt = `Crie 3 opções de legendas para Instagram de alto engajamento para a empresa Robô LED Partner (entretenimento para eventos de luxo).
Atração: ${attraction}
Tipo de Evento: ${eventType}
Tom de voz: ${tone}
Chamada para Ação (CTA): ${cta}
Inclua emojis estratégicos e hashtags recomendadas para eventos no Brasil.`;

      const res = await aiApi.generate({ prompt, task: 'caption' });
      setOutput(res.data.text);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao gerar conteúdo com IA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCampaignIdeas = async () => {
    try {
      setLoading(true);
      setOutput('');
      const prompt = `Atue como um estrategista de tráfego pago especialista em Meta Ads para eventos sociais e casamentos.
Crie um plano completo de criativos e cópias de anúncio para: ${campaignTopic}.
Estruture:
1. Gancho (Hook) do vídeo / carrossel
2. Texto do Anúncio (Copy) com foco em desejo e escassez de datas
3. Título e Descrição para o botão do WhatsApp
4. Segmentação sugerida no Meta Ads.`;

      const res = await aiApi.generate({ prompt, task: 'campaign_idea' });
      setOutput(res.data.text);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao gerar ideias de campanha', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBriefing = async () => {
    try {
      setLoading(true);
      setOutput('');
      const prompt = `Elabore um roteiro persuasivo de apresentação comercial para WhatsApp e e-mail focado em ${briefingAudience}, explicando o impacto inesquecível da atração ${attraction} na pista de dança, efeitos especiais (CO2, laser, iluminação computadorizada) e diferencial de exclusividade.`;

      const res = await aiApi.generate({ prompt, task: 'briefing' });
      setOutput(res.data.text);
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao gerar roteiro', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    addToast('Conteúdo copiado para a área de transferência!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center">
                Assistente de IA de Marketing
                <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800/80 px-2 py-0.5 rounded-full">
                  Robô LED AI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Gere copys, ideias de anúncios e briefings estratégicos para eventos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tool Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6 text-xs font-medium">
          <button
            onClick={() => {
              setActiveTool('captions');
              setOutput('');
            }}
            className={`py-3 px-3 border-b-2 flex items-center space-x-2 transition-all ${
              activeTool === 'captions'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>Legendas para Instagram</span>
          </button>
          <button
            onClick={() => {
              setActiveTool('campaigns');
              setOutput('');
            }}
            className={`py-3 px-3 border-b-2 flex items-center space-x-2 transition-all ${
              activeTool === 'campaigns'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Ideias & Copys de Anúncios</span>
          </button>
          <button
            onClick={() => {
              setActiveTool('briefing');
              setOutput('');
            }}
            className={`py-3 px-3 border-b-2 flex items-center space-x-2 transition-all ${
              activeTool === 'briefing'
                ? 'border-cyan-500 text-cyan-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Roteiro Comercial / WhatsApp</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tool 1: Captions */}
          {activeTool === 'captions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Atração Principal:</label>
                  <select
                    value={attraction}
                    onChange={(e) => setAttraction(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="Robô Megatron LED">Robô Megatron LED (3 metros)</option>
                    <option value="Robô Bumblebee LED">Robô Bumblebee LED Amarelo</option>
                    <option value="Tequileiros e Tequileiras LED">Tequileiros / Tequileiras LED</option>
                    <option value="Espelho Mágico Interativo">Espelho Mágico Interativo</option>
                    <option value="Combo Megatron + Tequileiros">Combo Megatron + Tequileiros</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Público / Tipo de Evento:</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                  >
                    <option value="Casamento de Luxo">Casamento de Luxo</option>
                    <option value="Festa de 15 Anos / Debutante">Festa de 15 Anos / Debutante</option>
                    <option value="Formatura Universitária">Formatura Universitária</option>
                    <option value="Evento Corporativo / Confraternização">Evento Corporativo</option>
                    <option value="Aniversário Adulto">Aniversário Adulto</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Tom de Voz:</label>
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Chamada para Ação (CTA):</label>
                  <input
                    type="text"
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateCaption}
                  disabled={loading}
                  className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Gerando Legendas...' : 'Gerar 3 Opções de Legenda'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tool 2: Campaigns */}
          {activeTool === 'campaigns' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Objetivo ou Tema da Campanha de Tráfego Pago:</label>
                <textarea
                  rows={2}
                  value={campaignTopic}
                  onChange={(e) => setCampaignTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateCampaignIdeas}
                  disabled={loading || !campaignTopic.trim()}
                  className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Criando Estratégia...' : 'Gerar Estrutura de Anúncio'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tool 3: Briefing */}
          {activeTool === 'briefing' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Público-Alvo do Roteiro:</label>
                <input
                  type="text"
                  value={briefingAudience}
                  onChange={(e) => setBriefingAudience(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateBriefing}
                  disabled={loading || !briefingAudience.trim()}
                  className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{loading ? 'Elaborando Roteiro...' : 'Gerar Roteiro Comercial'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Output Display Box */}
          {output && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center">
                  <Sparkles className="w-3.5 h-3.5 mr-1" /> Resultado Gerado
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-xs text-slate-300 hover:text-cyan-400 bg-slate-900 hover:bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {output}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
