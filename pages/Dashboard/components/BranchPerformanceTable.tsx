import React from 'react';
import { ArrowUpRight, ArrowDownRight, Star, MoreHorizontal, BarChart2 } from 'lucide-react';
import type { DashboardBranchPerformance } from '../../../services/dashboardApi';

interface Props {
  data: DashboardBranchPerformance[];
  isLoading: boolean;
}

export const BranchPerformanceTable: React.FC<Props> = ({ data, isLoading }) => (
  <div className="lg:col-span-12 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Branch Performance Matrix</h2>
      <div className="flex gap-2">
        <button className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500">Weekly</button>
        <button className="px-2 py-1 bg-teal-600 rounded text-[10px] font-bold text-white">Monthly</button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
            <th className="pb-3">Branch</th>
            <th className="pb-3">Revenue</th>
            <th className="pb-3">Growth</th>
            <th className="pb-3">Rating</th>
            <th className="pb-3">Status</th>
            <th className="pb-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={6} className="py-2">
                  <div className="animate-pulse h-6 bg-slate-200 dark:bg-slate-800 rounded-md" />
                </td>
              </tr>
            ))
          ) : !data.length ? (
            <tr>
              <td colSpan={6} className="py-10">
                <div className="flex flex-col items-center justify-center gap-2">
                  <BarChart2 size={28} className="text-slate-300 dark:text-slate-600" />
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">No branch data for this period</p>
                </div>
              </td>
            </tr>
          ) : data.map((b, i) => (
            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
              <td className="py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{b.branch}</td>
              <td className="py-3 text-xs font-medium text-slate-600 dark:text-slate-400">RS {b.revenue.toLocaleString()}</td>
              <td className="py-3">
                <span className={`text-[10px] font-bold flex items-center gap-0.5 ${b.growth > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {b.growth > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {Math.abs(b.growth)}%
                </span>
              </td>
              <td className="py-3">
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{b.rating}</span>
                </div>
              </td>
              <td className="py-3">
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-50 text-emerald-600">{b.STATUS}</span>
              </td>
              <td className="py-3 text-right">
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                  <MoreHorizontal size={14} className="text-slate-400" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
