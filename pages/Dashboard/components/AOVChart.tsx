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
    <>
      <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Average Order Value (AOV)</h2>
      <div className="h-[200px] w-full">
        {isLoading ? <ChartSkeleton /> : !data.length ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
              <XAxis 
                dataKey="DATE(created)" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(tick) => {
                  const found = data.find(item => item['DATE(created)'] === tick);
                  return found ? found.order_date : tick;
                }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                cursor={{ fill: 'transparent' }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as any;
                    const aov = item.avg_order_value || 0;
                    const revenue = item.DailyRevenue || 0;
                    const orders = item.DailyOrders || 0;
                    
                    let dateStr = label;
                    try {
                      const d = new Date(label);
                      dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                    } catch {}

                    return (
                      <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 rounded-xl p-3 shadow-lg text-[11px] space-y-1.5 text-white min-w-[160px]">
                        <p className="font-bold text-[9px] text-slate-400 uppercase tracking-wider mb-1">
                          {dateStr}
                        </p>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Avg Order Value:</span>
                          <span className="font-bold text-teal-400">Rs {Math.round(aov).toLocaleString()}</span>
                        </div>
                        <div className="border-t border-slate-800 my-1" />
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Total Sales:</span>
                          <span className="font-semibold text-slate-200">Rs {Math.round(revenue).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Total Orders:</span>
                          <span className="font-semibold text-slate-200">{orders.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
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
    </>
  );
};
