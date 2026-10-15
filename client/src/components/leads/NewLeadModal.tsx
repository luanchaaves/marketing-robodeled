import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { Lead, LeadStatus, LeadTemperature, SourceChannel, EventType } from '../../types';
import { leadsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadSaved: () => void;
  leadToEdit?: Lead | null;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onLeadSaved,
  leadToEdit,
}) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [sourceChannel, setSourceChannel] = useState<SourceChannel>('WHATSAPP_DIRECT');
  const [status, setStatus] = useState<LeadStatus>('NEW_LEAD');
  const [temperature, setTemperature] = useState<LeadTemperature>('WARM');
  const [eventType, setEventType] = useState<EventType | ''>('WEDDING');
  const [eventDate, setEventDate] = useState('');
  const [eventCity, setEventCity] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [attractionInterest, setAttractionInterest] = useState('Robô Megatron LED');
  const [estimatedValue, setEstimatedValue] = useState<number>(2500);
  const [notes, setNotes] = useState('');
  const [utmSource, setUtmSource] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [lossReason, setLossReason] = useState('');
  const [lossDetails, setLossDetails] = useState('');

  useEffect(() => {
    if (leadToEdit) {
      setName(leadToEdit.name);
      setPhone(leadToEdit.phone);
      setWhatsapp(leadToEdit.whatsapp || '');
      setEmail(leadToEdit.email || '');
      setSourceChannel(leadToEdit.sourceChannel);
      setStatus(leadToEdit.status);
      setTemperature(leadToEdit.temperature);
      setEventType(leadToEdit.eventType || '');
      setEventDate(leadToEdit.eventDate ? leadToEdit.eventDate.split('T')[0] : '');
      setEventCity(leadToEdit.eventCity || '');
      setEventVenue(leadToEdit.eventVenue || '');
      setAttractionInterest(leadToEdit.attractionInterest || 'Robô Megatron LED');
      setEstimatedValue(leadToEdit.estimatedValue || 2500);
      setNotes(leadToEdit.notes || '');
      setUtmSource(leadToEdit.utmSource || '');
      setUtmCampaign(leadToEdit.utmCampaign || '');
      setLossReason(leadToEdit.lossReason || '');
      setLossDetails(leadToEdit.lossDetails || '');
    } else {
      setName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
      setSourceChannel('WHATSAPP_DIRECT');
      setStatus('NEW_LEAD');
      setTemperature('WARM');
      setEventType('WEDDING');
      setEventDate('');
      setEventCity('');
      setEventVenue('');
      setAttractionInterest('Robô Megatron LED');
      setEstimatedValue(2500);
      setNotes('');
      setUtmSource('');
      setUtmCampaign('');
      setLossReason('');
      setLossDetails('');
    }
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      addToast('Nome e Telefone/WhatsApp são obrigatórios!', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload: any = {
        name,
        phone,
        whatsapp: whatsapp || phone,
        email: email || undefined,
        sourceChannel,
        status,
        temperature,
        eventType: eventType || undefined,
        eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
        eventCity: eventCity || undefined,
        eventVenue: eventVenue || undefined,
        attractionInterest: attractionInterest || undefined,
        estimatedValue: Number(estimatedValue) || 0,
        notes: notes || undefined,
        utmSource: utmSource || undefined,
        utmCampaign: utmCampaign || undefined,
        lossReason: status === 'LOST' ? lossReason || undefined : undefined,
        lossDetails: status === 'LOST' ? lossDetails || undefined : undefined,
      };

      if (leadToEdit) {
        await leadsApi.update(leadToEdit.id, payload);
        addToast('Lead atualizado com sucesso!', 'success');
      } else {
        await leadsApi.create(payload);
        addToast('Novo lead cadastrado com sucesso!', 'success');
      }

      onLeadSaved();
      onClose();
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Erro ao salvar lead', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">
              {leadToEdit ? 'Editar Lead' : 'Novo Lead / Oportunidade'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Section 1: Contato Principal */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-3">
              1. Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Vasconcelos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">WhatsApp / Telefone *</label>
                <input
                  type="text"
                  required
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (!whatsapp) setWhatsapp(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">E-mail (opcional)</label>
                <input
                  type="email"
                  placeholder="mariana@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Canal de Origem</label>
                <select
                  value={sourceChannel}
                  onChange={(e) => setSourceChannel(e.target.value as SourceChannel)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="WHATSAPP_DIRECT">WhatsApp Direto</option>
                  <option value="META_ADS">Meta Ads (Instagram / Facebook)</option>
                  <option value="META_LEAD_ADS">Meta Lead Ads (Formulário Instantâneo)</option>
                  <option value="INSTAGRAM_ORGANIC">Instagram Orgânico (Direct)</option>
                  <option value="SITE_FORM">Formulário do Site</option>
                  <option value="GOOGLE_ADS">Google Ads</option>
                  <option value="REFERRAL">Indicação / Parceiro</option>
                  <option value="MANUAL">Cadastro Manual / Prospecção</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Qualificação & Status */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-3">
              2. Qualificação & Funil
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Etapa no Funil</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LeadStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="NEW_LEAD">Novo Lead</option>
                  <option value="ATTENDING">Em Atendimento</option>
                  <option value="QUALIFIED">Qualificado</option>
                  <option value="PROPOSAL_SENT">Orçamento Enviado</option>
                  <option value="NEGOTIATION">Em Negociação</option>
                  <option value="WON">Contrato Fechado</option>
                  <option value="LOST">Perdido</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Temperatura</label>
                <select
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value as LeadTemperature)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="HOT">🔥 Quente (Festa próxima / Orçamento imediato)</option>
                  <option value="WARM">⚡ Morno (Pesquisando atrações)</option>
                  <option value="COLD">❄️ Frio (Curioso / Longo prazo)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Valor Estimado (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={estimatedValue}
                  onChange={(e) => setEstimatedValue(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Detalhes do Evento */}
          <div>
            <h3 className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-3">
              3. Dados do Evento & Atração
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tipo de Evento</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="WEDDING">Casamento</option>
                  <option value="DEBUTANTE_15">Debutante 15 Anos</option>
                  <option value="BIRTHDAY">Aniversário Adulto / Infantil</option>
                  <option value="GRADUATION">Formatura</option>
                  <option value="CORPORATE">Evento Corporativo / Empresa</option>
                  <option value="CLUB_PARTY">Balada / Festival / Festa</option>
                  <option value="OTHER">Outro Tipo</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Atração de Interesse</label>
                <select
                  value={attractionInterest}
                  onChange={(e) => setAttractionInterest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                >
                  <option value="Robô Megatron LED">Robô Megatron LED (Gigante)</option>
                  <option value="Robô Bumblebee LED">Robô Bumblebee LED Amarelo</option>
                  <option value="Tequileiros com LED">Tequileiros / Tequileiras LED</option>
                  <option value="Espelho Mágico + Robô">Combo Espelho Mágico + Robô LED</option>
                  <option value="Tambores de LED">Tambores de LED / Batucada</option>
                  <option value="Personagens Vivos">Personagens Vivos Especiais</option>
                  <option value="Pacote Completo VIP">Pacote Completo VIP de Atrações</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Data do Evento</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Cidade do Evento</label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo / SP, Campinas, Santos..."
                  value={eventCity}
                  onChange={(e) => setEventCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* If status is LOST */}
          {status === 'LOST' && (
            <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-xl space-y-3">
              <div className="flex items-center text-xs font-bold text-rose-400">
                <AlertCircle className="w-4 h-4 mr-1.5" /> Motivo da Perda do Negócio
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Motivo Principal</label>
                  <select
                    value={lossReason}
                    onChange={(e) => setLossReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-rose-500"
                  >
                    <option value="">Selecione o motivo...</option>
                    <option value="PREÇO_ALTO">Preço / Orçamento fora da verba</option>
                    <option value="FECHOU_CONCORRENTE">Fechou com concorrente</option>
                    <option value="DATA_INDISPONÍVEL">Data indisponível na agenda</option>
                    <option value="SEM_RESPOSTA">Parou de responder / Desistiu da festa</option>
                    <option value="LOCAL_SEM_ESTRUTURA">Local não comporta o Robô</option>
                    <option value="OUTRO">Outro motivo</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Detalhes da Perda</label>
                  <input
                    type="text"
                    placeholder="Ex: Noivo optou apenas por cabine de fotos..."
                    value={lossDetails}
                    onChange={(e) => setLossDetails(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Observações */}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Observações Internas</label>
            <textarea
              rows={3}
              placeholder="Ex: Noiva prefere entrada do robô com fumaça e bazuca de CO2..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg shadow-lg shadow-cyan-600/20 transition-all flex items-center space-x-1.5"
          >
            {loading ? (
              <span>Salvando...</span>
            ) : (
              <span>{leadToEdit ? 'Atualizar Lead' : 'Cadastrar Lead'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
