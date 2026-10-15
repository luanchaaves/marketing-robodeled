import React from 'react';
import { Lead, LeadStatus } from '../../types';
import {
  Calendar,
  MapPin,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Flame,
  Zap,
  Snowflake,
} from 'lucide-react';
import { formatCurrency, formatDateBR } from '../../utils/formatters';

interface LeadKanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onStatusChange?: (leadId: string, newStatus: LeadStatus) => void;
  onUpdateLeadStatus?: (leadId: string, newStatus: LeadStatus) => void;
  onQuickAction?: (action: 'whatsapp' | 'edit', lead: Lead) => void;
}

const STAGES: Array<{ id: LeadStatus; label: string; color: string; border: string }> = [
  { id: 'NEW_LEAD', label: '1. Novo Lead', color: 'text-cyan-400', border: 'border-cyan-500/30' },
  { id: 'ATTENDING', label: '2. Em Atendimento', color: 'text-blue-400', border: 'border-blue-500/30' },
  { id: 'QUALIFIED', label: '3. Qualificado', color: 'text-indigo-400', border: 'border-indigo-500/30' },
  { id: 'PROPOSAL_SENT', label: '4. Orçamento Enviado', color: 'text-amber-400', border: 'border-amber-500/30' },
  { id: 'NEGOTIATION', label: '5. Em Negociação', color: 'text-purple-400', border: 'border-purple-500/30' },
  { id: 'WON', label: '6. Contrato Fechado', color: 'text-emerald-400', border: 'border-emerald-500/30' },
  { id: 'LOST', label: '7. Perdido', color: 'text-rose-400', border: 'border-rose-500/30' },
];

export const LeadKanbanBoard: React.FC<LeadKanbanBoardProps> = ({
  leads,
  onSelectLead,
  onStatusChange,
  onUpdateLeadStatus,
  onQuickAction,
}) => {
  const handleMoveStatus = (leadId: string, newStatus: LeadStatus) => {
    if (onStatusChange) onStatusChange(leadId, newStatus);
    else if (onUpdateLeadStatus) onUpdateLeadStatus(leadId, newStatus);
  };

  const safeLeads = Array.isArray(leads) ? leads : [];

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory">
      {STAGES.map((stage, stageIndex) => {
        const stageLeads = safeLeads.filter((l) => l.status === stage.id);
        const stageTotalValue = stageLeads.reduce(
          (acc, l) => acc + (Number(l.actualContractValue || l.estimatedValue) || 0),
          0
        );

        return (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80 bg-[#111827]/80 border border-slate-800 rounded-2xl flex flex-col max-h-[calc(100vh-220px)] snap-start"
          >
            {/* Column Header */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${stage.color}`}>{stage.label}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {stageLeads.length}
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">
                Total: <span className="text-slate-200 font-bold">{formatCurrency(stageTotalValue)}</span>
              </div>
            </div>

            {/* Cards List */}
            <div className="p-3 overflow-y-auto flex-1 space-y-3">
              {stageLeads.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-600 border border-dashed border-slate-800/60 rounded-xl">
                  Nenhum lead nesta etapa
                </div>
              ) : (
                stageLeads.map((lead) => {
                  const cleanPhone = (lead.whatsapp || lead.phone).replace(/\D/g, '');
                  const waUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : null;

                  return (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow-md cursor-pointer transition-all hover:shadow-cyan-500/5 group space-y-2.5"
                    >
                      {/* Top: Name & Temp */}
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-xs text-slate-100 group-hover:text-cyan-400 transition-colors">
                          {lead.name}
                        </span>

                        {lead.temperature === 'HOT' && (
                          <span className="flex items-center text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-1.5 py-0.5 rounded-full">
                            <Flame className="w-3 h-3 mr-0.5 fill-rose-500 text-rose-500" /> Quente
                          </span>
                        )}
                        {lead.temperature === 'WARM' && (
                          <span className="flex items-center text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded-full">
                            <Zap className="w-3 h-3 mr-0.5 fill-amber-500 text-amber-500" /> Morno
                          </span>
                        )}
                        {lead.temperature === 'COLD' && (
                          <span className="flex items-center text-[10px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-1.5 py-0.5 rounded-full">
                            <Snowflake className="w-3 h-3 mr-0.5 text-cyan-400" /> Frio
                          </span>
                        )}
                      </div>

                      {/* Attraction & Event */}
                      <div className="space-y-1 text-xs text-slate-400">
                        <div className="flex items-center text-slate-300">
                          <Sparkles className="w-3 h-3 text-cyan-400 mr-1.5 shrink-0" />
                          <span className="truncate">{lead.attractionInterest || 'Robô de LED'}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          {lead.eventDate && (
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 text-slate-600" />
                              {formatDateBR(lead.eventDate)}
                            </span>
                          )}
                          {lead.eventCity && (
                            <span className="flex items-center truncate max-w-[120px]">
                              <MapPin className="w-3 h-3 mr-1 text-slate-600" />
                              {lead.eventCity}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom: Value & Actions */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">
                          {formatCurrency(lead.actualContractValue || lead.estimatedValue || 0)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onQuickAction) onQuickAction('whatsapp', lead);
                              }}
                              title="Abrir WhatsApp"
                              className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40 rounded transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {stageIndex < STAGES.length - 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStatus(lead.id, STAGES[stageIndex + 1].id);
                              }}
                              title={`Avançar para ${STAGES[stageIndex + 1].label}`}
                              className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
