import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Eye,
  MousePointer,
  DollarSign,
  Percent,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Skeleton } from '../components/common/Skeleton';
import { metaAdsApi } from '../services/api';
import {
  formatCurrency,
  formatNumberBR,
  formatPercentBR,
  getErrorMessage,
} from '../utils/formatters';
import { useToast } from '../context/ToastContext';

export const Traffic: React.FC = () => {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [totalSpend, setTotalSpend] = useState<number>(0);
  const [totalImpressions, setTotalImpressions] = useState<number>(0);
  const [totalClicks, setTotalClicks] = useState<number>(0);

  const fetchTrafficData = async () => {
    try {
      setLoading(true);
      const [accRes, metRes] = await Promise.all([
        metaAdsApi.getAccounts().catch(() => ({ data: { data: {} } })),
        metaAdsApi.getMetrics().catch(() => ({ data: { data: [] } })),
      ]);

      const statusData = accRes.data?.data || accRes.data || {};
      const accountsList = Array.isArray(statusData.adAccounts)
        ? statusData.adAccounts
        : Array.isArray(accRes.data?.accounts)
        ? accRes.data.accounts
        : [];

      const rawMetrics = metRes.data?.data || metRes.data?.metrics || metRes.data || [];
      const metricsList = Array.isArray(rawMetrics) ? rawMetrics : [];

      setAccounts(accountsList);
      setMetrics(metricsList);

      const spend = metricsList.reduce((acc: number, m: any) => acc + (m.metrics?.spend ?? m.spend ?? 0), 0);
      const imp = metricsList.reduce((acc: number, m: any) => acc + (m.metrics?.impressions ?? m.impressions ?? 0), 0);
      const clk = metricsList.reduce((acc: number, m: any) => acc + (m.metrics?.clicks ?? m.clicks ?? 0), 0);

      setTotalSpend(spend);
      setTotalImpressions(imp);
      setTotalClicks(clk);
    } catch (err: any) {
      addToast('Erro ao carregar dados de tráfego pago', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrafficData();
  }, []);

  const handleSyncMeta = async () => {
    try {
      setSyncing(true);
      await metaAdsApi.sync();
      addToast('Sincronização com Meta Marketing API concluída!', 'success');
      fetchTrafficData();
    } catch (err: any) {
      addToast(getErrorMessage(err, 'Erro ao sincronizar com a Meta API'), 'error');
    } finally {
      setSyncing(false);
    }
  };

  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
  const avgCpm = totalImpressions > 0 ? (totalSpend / totalImpressions) * 1000 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Tráfego Pago & Meta Ads</span>
            <span className="text-[11px] font-semibold bg-blue-950 text-blue-400 border border-blue-800 px-2 py-0.5 rounded-full">
              Graph API v21.0
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhamento de contas de anúncios, campanhas no Instagram/Facebook e custo por resultado
          </p>
        </div>

        <button
          onClick={handleSyncMeta}
          disabled={syncing}
          className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Sincronizando Meta...' : 'Sincronizar Meta Ads'}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Investimento em Anúncios"
          value={formatCurrency(totalSpend)}
          icon={<DollarSign className="w-5 h-5 text-cyan-400" />}
          change={`${accounts.length} contas ativas`}
          changeType="neutral"
          subtitle="Gasto sincronizado"
        />

        <StatCard
          title="Impressões & Alcance"
          value={formatNumberBR(totalImpressions)}
          icon={<Eye className="w-5 h-5 text-blue-400" />}
          change={`CPM Médio: ${formatCurrency(avgCpm)}`}
          changeType="neutral"
          subtitle="Visualizações geradas"
        />

        <StatCard
          title="Cliques no Link"
          value={formatNumberBR(totalClicks)}
          icon={<MousePointer className="w-5 h-5 text-emerald-400" />}
          change={`CPC Médio: ${formatCurrency(avgCpc)}`}
          changeType="positive"
          subtitle="Tráfego para WhatsApp/Site"
        />

        <StatCard
          title="CTR Médio"
          value={formatPercentBR(avgCtr)}
          icon={<Percent className="w-5 h-5 text-amber-400" />}
          change={avgCtr >= 1.5 ? 'Excelente engajamento' : 'Abaixo da meta (1.5%)'}
          changeType={avgCtr >= 1.5 ? 'positive' : 'neutral'}
          subtitle="Taxa de cliques / imp."
        />
      </div>

      {/* Connected Accounts & Insights Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Métricas por Campanha do Meta Ads</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (!Array.isArray(metrics) || metrics.length === 0) ? (
          <div className="p-12 text-center space-y-3 text-slate-400 text-xs">
            <AlertCircle className="w-8 h-8 text-cyan-400 mx-auto opacity-60" />
            <p className="font-semibold text-slate-200">Nenhum dado de tráfego retornado ainda.</p>
            <p className="max-w-md mx-auto text-slate-500">
              Certifique-se de configurar o Token de Acesso da Meta e o ID da Conta de Anúncios na aba de <strong>Integrações</strong>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Campanha</th>
                  <th className="py-3 px-4">Gasto (R$)</th>
                  <th className="py-3 px-4">Impressões</th>
                  <th className="py-3 px-4">Cliques</th>
                  <th className="py-3 px-4">CTR</th>
                  <th className="py-3 px-4">CPC</th>
                  <th className="py-3 px-4">CPM</th>
                  <th className="py-3 px-4">Leads</th>
                  <th className="py-3 px-4">CPL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {(metrics || []).map((m: any, idx: number) => {
                  const spend = m.metrics?.spend ?? m.spend ?? 0;
                  const impressions = m.metrics?.impressions ?? m.impressions ?? 0;
                  const clicks = m.metrics?.clicks ?? m.clicks ?? 0;
                  const leads = m.metrics?.conversions ?? m.leads ?? 0;
                  const ctr = m.metrics?.ctr ?? (impressions > 0 ? (clicks / impressions) * 100 : 0);
                  const cpc = m.metrics?.cpc ?? (clicks > 0 ? spend / clicks : 0);
                  const cpm = m.metrics?.cpm ?? (impressions > 0 ? (spend / impressions) * 1000 : 0);
                  const cpl = m.metrics?.cpl ?? (leads > 0 ? spend / leads : 0);
                  const name = m.name || m.campaignName || m.adName || 'Campanha Meta';

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-100">{name}</td>
                      <td className="py-3 px-4 font-bold text-cyan-400">{formatCurrency(spend)}</td>
                      <td className="py-3 px-4">{formatNumberBR(impressions)}</td>
                      <td className="py-3 px-4">{formatNumberBR(clicks)}</td>
                      <td className="py-3 px-4">{formatPercentBR(ctr)}</td>
                      <td className="py-3 px-4">{formatCurrency(cpc)}</td>
                      <td className="py-3 px-4">{formatCurrency(cpm)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">{leads}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400">{cpl > 0 ? formatCurrency(cpl) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
