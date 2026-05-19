import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyState } from './EmptyState';
import type { DashboardAOV } from '../../../services/dashboardApi';

interface Props {
  data: DashboardAOV[];
  isLoading: boolean;
}

const AVG_THRESHOLD = (data: DashboardAOV[]) => {
  if (!data.length) return 0;
  return data.reduce((sum, d) => sum + d.avg_order_value, 0) / data.length;
};

export const AOVChart: React.FC<Props> = ({ data, isLoading }) => {
  const threshold = AVG_THRESHOLD(data);

  return (
    <div className="lg:col-span-8 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Average Order Value (AOV)</h2>
      <div className="h-[200px] w-full">
        {isLoading ? <ChartSkeleton /> : !data.length ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
              <XAxis dataKey="order_date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                formatter={(value: number) => [`RS ${value.toFixed(0)}`, 'Avg Order Value']}
              />
              <Bar dataKey="avg_order_value" radius={[4, 4, 0, 0]} barSize={40}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.avg_order_value >= threshold ? '#14b8a6' : '#94a3b8'} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <p className="text-[10px] text-slate-500 italic">
          {data.length ? `Period avg: RS ${threshold.toFixed(0)}` : 'Average order value by day'}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-500" /><span className="text-[9px] font-bold text-slate-400 uppercase">Above Avg</span></div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400" /><span className="text-[9px] font-bold text-slate-400 uppercase">Below Avg</span></div>
        </div>
      </div>
    </div>
  );
};
