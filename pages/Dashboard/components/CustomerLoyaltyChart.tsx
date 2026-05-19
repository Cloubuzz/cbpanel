import React from 'react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyState } from './EmptyState';
import type { CustomerLoyaltyItem } from '../hooks/useDashboardData';

interface Props {
  data: CustomerLoyaltyItem[];
  isLoading: boolean;
}

export const CustomerLoyaltyChart: React.FC<Props> = ({ data, isLoading }) => (
  <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Customer Loyalty</h2>
    <div className="h-[200px] w-full">
      {isLoading ? <ChartSkeleton /> : !data.length ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
            <Bar dataKey="repeat" stackId="a" fill="#14b8a6" barSize={20} />
            <Bar dataKey="new" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
    <div className="flex justify-center gap-4 mt-4">
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500" /><span className="text-[9px] font-bold text-slate-500 uppercase">Repeat</span></div>
      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400" /><span className="text-[9px] font-bold text-slate-500 uppercase">New</span></div>
    </div>
  </div>
);
