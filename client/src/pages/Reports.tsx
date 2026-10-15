import React, { useState, useEffect } from 'react';
import {
  Download,
  BarChart3,
  AlertCircle,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Skeleton } from '../components/common/Skeleton';
import { reportsApi, leadsApi } from '../services/api';
import { useToast } from '../context/ToastContext';

const PIE_COLORS = ['#00D2FE', '#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export const Reports: React.FC = () => {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await reportsApi.getPerformanceReport();
      setReportData(res.data);
    } catch (err: any) {
      addToast('Erro ao carregar relatórios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExportFullCSV = async () => {
    try {
      const res = await leadsApi.exportCsv({});
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio_completo_leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addToast('Relatório CSV baixado com sucesso!', 'success');
    } catch (err: any) {
      addToast('Erro ao baixar relatório', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Relatórios Gerenciais & Rentabilidade</span>
            <BarChart3 className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Análises detalhadas por tipo de evento, motivos de perda e taxa de conversão
          </p>
        </div>

        <button
          onClick={handleExportFullCSV}
          className="flex items-center space-x-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Relatório CSV</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Event Type */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Volume & Conversão por Tipo de Evento</span>
          </h2>

          <div className="h-64 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (!reportData?.byEventType || reportData.byEventType.length === 0) ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Sem dados suficientes de eventos.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.byEventType} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="eventType" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="totalLeads" name="Total Leads" fill="#00D2FE" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wonLeads" name="Contratos Fechados" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Loss Reasons Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Distribuição de Motivos de Perda</span>
          </h2>

          <div className="h-64 w-full pt-2 flex items-center justify-center">
            {(!reportData?.byLossReason || reportData.byLossReason.length === 0) ? (
              <div className="text-xs text-slate-500">
                Nenhum lead com motivo de perda registrado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Pie
                    data={reportData.byLossReason}
                    dataKey="count"
                    nameKey="reason"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {reportData.byLossReason.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
