import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MetricCardProps } from '../../../types';

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendUp, icon, isLoading }) => (
  <div className="glass-card p-4 rounded-xl relative overflow-hidden group border border-slate-200 dark:border-slate-800">
    <div className="absolute -right-10 -top-10 w-24 h-24 bg-teal-500/5 rounded-full blur-[30px] group-hover:bg-teal-500/15 transition-all duration-500 opacity-0 group-hover:opacity-100" />

    <div className="flex justify-between items-start mb-2 relative z-10">
      <div className="p-2 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-500/20 rounded-lg text-teal-600 dark:text-teal-400">
        {icon}
      </div>
      {trend && !isLoading && (
        <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
          trendUp
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400'
        }`}>
          {trendUp ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
          {trend}
        </div>
      )}
    </div>

    <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold mb-0.5 tracking-wider uppercase">{title}</h3>
    {isLoading ? (
      <div className="animate-pulse h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-md mt-1" />
    ) : (
      <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
    )}
  </div>
);
