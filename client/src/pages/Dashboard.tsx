import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  Target,
  TrendingUp,
  Percent,
  Sparkles,
  RefreshCw,
  BarChart3,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { Skeleton } from '../components/common/Skeleton';
import { dashboardApi } from '../services/api';
import { DashboardSummary } from '../types';
import {
  formatCurrency,
  formatNumberBR,
  formatPercentBR,
  formatDateBR,
  formatPhoneBR,
  leadStatusLabels,
  leadStatusColors,
} from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [period, setPeriod] = useState<string>('last_30_days');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardSummary | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getSummary({ period });
      setData(res.data);
    } catch (err: any) {
      addToast('Erro ao carregar dados do dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const kpis = data?.kpis;

  return (
    <div className="space-y-6">
      {/* Top Banner / Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
            <span>Dashboard Executivo de Marketing</span>
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas de tráfego, atração de leads, CPL, CAC, ROAS e receita da Robô LED Partner
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Period Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setPeriod('today')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                period === 'today' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriod('last_7_days')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                period === 'last_7_days' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Dias
            </button>
            <button
              onClick={() => setPeriod('last_30_days')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                period === 'last_30_days' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              30 Dias
            </button>
            <button
              onClick={() => setPeriod('this_month')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                period === 'this_month' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mês Atual
            </button>
          </div>

          <button
            onClick={fetchDashboard}
            title="Atualizar dados"
            className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Investimento em Anúncios"
          value={loading ? '...' : formatCurrency(kpis?.totalSpend || 0)}
          icon={<DollarSign className="w-5 h-5 text-cyan-400" />}
          change={`${kpis?.impressions ? formatNumberBR(kpis.impressions) + ' imp.' : 'Meta Ads'}`}
          changeType="neutral"
          subtitle="Gasto no período"
        />

        <StatCard
          title="Leads Capturados"
          value={loading ? '...' : formatNumberBR(kpis?.leadsCount || 0)}
          icon={<Users className="w-5 h-5 text-blue-400" />}
          change={`CPL: ${formatCurrency(kpis?.cpl || 0)}`}
          changeType="positive"
          subtitle={`${kpis?.qualifiedLeadsCount || 0} qualificados`}
        />

        <StatCard
          title="Contratos Fechados"
          value={loading ? '...' : formatNumberBR(kpis?.wonCount || 0)}
          icon={<Target className="w-5 h-5 text-emerald-400" />}
          change={`CAC: ${formatCurrency(kpis?.cac || 0)}`}
          changeType="positive"
          subtitle={`De ${kpis?.proposalsCount || 0} propostas`}
        />

        <StatCard
          title="Taxa de Conversão"
          value={loading ? '...' : formatPercentBR(kpis?.conversionRate || 0)}
          icon={<Percent className="w-5 h-5 text-amber-400" />}
          change="Lead → Contrato"
          changeType={kpis?.conversionRate && kpis.conversionRate > 10 ? 'positive' : 'neutral'}
          subtitle="Eficiência de vendas"
        />

        <StatCard
          title="Receita Atribuída"
          value={loading ? '...' : formatCurrency(kpis?.attributedRevenue || 0)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          change={`ROAS: ${(kpis?.roas || 0).toFixed(2)}x`}
          changeType="positive"
          subtitle="Valor total contratos"
        />

        <StatCard
          title="Lucro Estimado"
          value={loading ? '...' : formatCurrency(kpis?.estimatedProfit || 0)}
          icon={<Sparkles className="w-5 h-5 text-purple-400" />}
          change="Margem operacional"
          changeType="positive"
          subtitle="Receita - Custos"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Evolução Temporal: Investimento vs. Receita</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Acompanhamento diário de gastos em mídia paga e receita de contratos fechados
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (!data?.timeSeries || data.timeSeries.length === 0) ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Sem dados históricos para o período selecionado.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D2FE" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D2FE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} tickFormatter={(val) => `R$${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(val: any) => formatCurrency(Number(val) || 0)}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="revenue" name="Receita Fechada" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="spend" name="Investimento Anúncios" stroke="#00D2FE" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Funnel Stage Bar Chart (1 Col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Funil Comercial de Leads</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Volume atual de leads em cada etapa da jornada
            </p>
          </div>

          <div className="h-72 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full rounded-xl" />
            ) : (!data?.funnel || data.funnel.length === 0) ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Nenhum lead no funil.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.funnel} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" horizontal={false} />
                  <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="stage" stroke="#94A3B8" fontSize={10} width={90} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F17', borderColor: '#1E293B', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Quantidade" fill="#00D2FE" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Section: Channels & Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channels Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-slate-100">Desempenho por Canal de Aquisição</h2>
          <div className="space-y-3 pt-1">
            {loading ? (
              <Skeleton className="h-48 w-full rounded-xl" />
            ) : (!data?.channels || data.channels.length === 0) ? (
              <p className="text-xs text-slate-500 py-6 text-center">Nenhum canal registrado no período.</p>
            ) : (
              data.channels.map((chan, idx) => (
                <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{chan.channel}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {chan.leadsCount} leads • {chan.wonCount} contratos
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400">{formatCurrency(chan.revenue)}</div>
                    <div className="text-[11px] text-cyan-400/80">ROAS: {chan.roas.toFixed(1)}x</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Leads Table (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100">Últimos Leads Recebidos</h2>
            <button
              onClick={() => navigate('/leads')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1 transition-colors"
            >
              <span>Ver todos no CRM</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Nome / Contato</th>
                  <th className="py-2.5 px-3">Atração</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Valor Estimado</th>
                  <th className="py-2.5 px-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-500">Carregando leads...</td>
                  </tr>
                ) : (!data?.recentLeads || data.recentLeads.length === 0) ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">Nenhum lead recente cadastrado.</td>
                  </tr>
                ) : (
                  data.recentLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => navigate('/leads')}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-100">{lead.name}</div>
                        <div className="text-[11px] text-slate-400">{formatPhoneBR(lead.whatsapp || lead.phone)}</div>
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300">
                        {lead.attractionInterest || 'Robô de LED'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${leadStatusColors[lead.status]}`}>
                          {leadStatusLabels[lead.status] || lead.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-100">
                        {formatCurrency(lead.estimatedValue || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {formatDateBR(lead.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
