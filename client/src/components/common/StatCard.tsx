import React, { ReactNode } from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  accentColor?: 'cyan' | 'blue' | 'emerald' | 'amber' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  change,
  changeType = 'neutral',
  accentColor = 'cyan',
}) => {
  const accentGlow = {
    cyan: 'border-cyan-500/20 group-hover:border-cyan-500/40 text-cyan-400 bg-cyan-500/10',
    blue: 'border-blue-500/20 group-hover:border-blue-500/40 text-blue-400 bg-blue-500/10',
    emerald: 'border-emerald-500/20 group-hover:border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    amber: 'border-amber-500/20 group-hover:border-amber-500/40 text-amber-400 bg-amber-500/10',
    purple: 'border-purple-500/20 group-hover:border-purple-500/40 text-purple-400 bg-purple-500/10',
  }[accentColor];

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-3 group hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-slate-100 tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl border transition-colors ${accentGlow}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
        {change && (
          <span
            className={`font-semibold ${
              changeType === 'positive'
                ? 'text-emerald-400'
                : changeType === 'negative'
                ? 'text-rose-400'
                : 'text-slate-400'
            }`}
          >
            {change}
          </span>
        )}
        {subtitle && <span className="text-slate-500 text-[11px] ml-auto">{subtitle}</span>}
      </div>
    </div>
  );
};
