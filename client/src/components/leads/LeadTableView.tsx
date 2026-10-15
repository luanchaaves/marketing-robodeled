import React from 'react';
import {
  MessageCircle,
  Eye,
  Trash2,
  Calendar,
  MapPin,
  Sparkles,
  Flame,
  Zap,
  Snowflake,
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
} from '../../utils/formatters';

interface LeadTableViewProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void;
  onDeleteLead: (leadId: string) => void;
}

export const LeadTableView: React.FC<LeadTableViewProps> = ({
  leads,
  onSelectLead,
  onStatusChange,
  onDeleteLead,
}) => {
  if (leads.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
        Nenhum lead encontrado com os filtros selecionados.
      </div>
    );
  }

  const renderTempIcon = (temp: string) => {
    switch (temp) {
      case 'HOT':
        return <span className="inline-flex items-center text-rose-400 font-medium text-xs"><Flame className="w-3.5 h-3.5 mr-0.5 text-rose-500 fill-rose-500" /> Quente</span>;
      case 'WARM':
        return <span className="inline-flex items-center text-amber-400 font-medium text-xs"><Zap className="w-3.5 h-3.5 mr-0.5 text-amber-500 fill-amber-500" /> Morno</span>;
      case 'COLD':
      default:
        return <span className="inline-flex items-center text-cyan-400 font-medium text-xs"><Snowflake className="w-3.5 h-3.5 mr-0.5 text-cyan-500" /> Frio</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800 font-medium">
            <tr>
              <th className="py-3.5 px-4">Lead / Contato</th>
              <th className="py-3.5 px-4">Status / Etapa</th>
              <th className="py-3.5 px-4">Temp.</th>
              <th className="py-3.5 px-4">Evento / Atração</th>
              <th className="py-3.5 px-4">Origem / Campanha</th>
              <th className="py-3.5 px-4">Valor Estimado</th>
              <th className="py-3.5 px-4">Responsável</th>
              <th className="py-3.5 px-4">Data Entrada</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-normal">
            {leads.map((lead) => {
              const cleanPhone = (lead.whatsapp || lead.phone).replace(/\D/g, '');
              const waUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

              return (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => onSelectLead(lead)}
                >
                  {/* Lead / Contato */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100 group-hover:text-cyan-400 transition-colors">
                      {lead.name}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                      <span>{formatPhoneBR(lead.whatsapp || lead.phone)}</span>
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Abrir WhatsApp"
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 inline" />
                        </a>
                      )}
                    </div>
                    {lead.email && (
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {lead.email}
                      </div>
                    )}
                  </td>

                  {/* Status / Etapa */}
                  <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.status}
                      onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
                      className={`text-xs font-medium py-1 px-2.5 rounded-full border transition-all cursor-pointer outline-none bg-slate-950 ${
                        leadStatusColors[lead.status] || 'text-slate-300 border-slate-700'
                      }`}
                    >
                      {Object.entries(leadStatusLabels).map(([key, label]) => (
                        <option key={key} value={key} className="bg-slate-900 text-slate-200">
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Temperatura */}
                  <td className="py-3.5 px-4">
                    {renderTempIcon(lead.temperature)}
                  </td>

                  {/* Evento & Atração */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center text-xs text-slate-200">
                      <Sparkles className="w-3 h-3 text-cyan-400 mr-1 shrink-0" />
                      <span className="truncate max-w-[140px]">
                        {lead.attractionInterest || (lead.eventType ? eventTypeLabels[lead.eventType] : 'A definir')}
                      </span>
                    </div>
                    <div className="flex items-center text-[11px] text-slate-400 mt-0.5 space-x-2">
                      {lead.eventDate && (
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-0.5 text-slate-500" />
                          {formatDateBR(lead.eventDate)}
                        </span>
                      )}
                      {lead.eventCity && (
                        <span className="flex items-center truncate max-w-[100px]">
                          <MapPin className="w-3 h-3 mr-0.5 text-slate-500" />
                          {lead.eventCity}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Origem */}
                  <td className="py-3.5 px-4">
                    <span className="inline-block text-xs font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {sourceChannelLabels[lead.sourceChannel] || lead.sourceChannel}
                    </span>
                    {lead.utmCampaign && (
                      <div className="text-[11px] text-cyan-400/80 truncate max-w-[120px] mt-0.5">
                        {lead.utmCampaign}
                      </div>
                    )}
                  </td>

                  {/* Valor Estimado */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-100">
                      {formatCurrency(lead.actualContractValue || lead.estimatedValue || 0)}
                    </div>
                    {lead.actualContractValue && (
                      <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">Fechado</span>
                    )}
                  </td>

                  {/* Responsável */}
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {lead.assignedToUser ? (
                      <span className="text-slate-300 font-medium">{lead.assignedToUser.name}</span>
                    ) : (
                      <span className="text-slate-600 italic">Não atribuído</span>
                    )}
                  </td>

                  {/* Data Entrada */}
                  <td className="py-3.5 px-4 text-xs text-slate-400">
                    {formatDateBR(lead.createdAt)}
                  </td>

                  {/* Ações */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1.5">
                      <button
                        onClick={() => onSelectLead(lead)}
                        title="Ver detalhes"
                        className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja realmente excluir o lead "${lead.name}"?`)) {
                            onDeleteLead(lead.id);
                          }
                        }}
                        title="Excluir lead"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
