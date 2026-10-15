import React, { useState } from 'react';
import { X, Download, FileSpreadsheet } from 'lucide-react';
import { leadsApi } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface LeadExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeadExportModal: React.FC<LeadExportModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [sourceChannel, setSourceChannel] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (status) params.status = status;
      if (sourceChannel) params.sourceChannel = sourceChannel;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await leadsApi.exportCsv(params);

      // Create download link
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads_robo_led_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast('Arquivo CSV gerado e baixado com sucesso!', 'success');
      onClose();
    } catch (err: any) {
      addToast('Erro ao exportar leads', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">Exportar Base de Leads (CSV)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          <p className="text-slate-400">
            Filtre os leads que deseja incluir no arquivo CSV ou deixe os campos vazios para exportar toda a base de dados.
          </p>

          <div>
            <label className="text-slate-400 block mb-1">Filtrar por Status / Etapa:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="">Todos os status</option>
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
            <label className="text-slate-400 block mb-1">Filtrar por Canal de Origem:</label>
            <select
              value={sourceChannel}
              onChange={(e) => setSourceChannel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="">Todos os canais</option>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Data Inicial:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Data Final:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

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
            onClick={handleExport}
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-lg shadow-lg shadow-cyan-600/20 transition-all flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{loading ? 'Gerando CSV...' : 'Baixar Arquivo CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
