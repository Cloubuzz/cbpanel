import React from 'react';
import { Users, Clock, MoreHorizontal, TrendingUp, TrendingDown, Zap, Target, BarChart3 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ScoreGauge } from './ScoreGauge';
import type { Segment } from '../types';

const getPotentialBadge = (potential: string) => {
  const styles: Record<string, string> = {
    High: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  };
  const icons: Record<string, React.ReactNode> = {
    High: <Zap size={12} className="fill-current" />,
    Medium: <Target size={12} />,
    Low: <Clock size={12} />,
  };
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[potential]}`}>
      {icons[potential]}
      {potential} Potential
    </span>
  );
};

interface Props {
  segment: Segment;
}

export const SegmentCard: React.FC<Props> = ({ segment }) => (
  <div className="glass-card rounded-2xl flex flex-col group transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] overflow-hidden">
    <div className="p-6 pb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 group-hover:text-teal-600 group-hover:border-teal-200 dark:group-hover:border-teal-900 transition-colors">
            <Users size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{segment.name}</h3>
            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={10} /> Synced {segment.lastSync}</span>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"><MoreHorizontal size={18} /></button>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8">{segment.description}</p>
    </div>

    <div className="px-6 pb-4 flex flex-wrap gap-2">
      {segment.tags.map(tag => (
        <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">{tag}</span>
      ))}
    </div>

    <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex-1 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Audience Size</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900 dark:text-white">{segment.count.toLocaleString()}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${segment.growth >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
              {segment.growth >= 0 ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
              {Math.abs(segment.growth)}%
            </span>
          </div>
        </div>
        {getPotentialBadge(segment.potential)}
      </div>

      <ScoreGauge score={segment.score} />

      <div className="h-10 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={segment.trendData}>
            <defs>
              <linearGradient id={`seg-grad-${segment.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#64748b" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#64748b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke="#94a3b8" strokeWidth={2} fill={`url(#seg-grad-${segment.id})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="p-3 bg-white dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
      <button className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-teal-600 py-1 transition-colors"><BarChart3 size={14} /> Analytics</button>
      <button className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-teal-600 py-1 transition-colors"><Zap size={14} /> Sync Ad</button>
    </div>
  </div>
);
