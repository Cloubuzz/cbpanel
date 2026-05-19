import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Area, Line } from 'recharts';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyState } from './EmptyState';
import type { DashboardHourlyPerformance } from '../../../services/dashboardApi';

interface Props {
  data: DashboardHourlyPerformance[];
  isLoading: boolean;
}

export const HourlyPerformanceChart: React.FC<Props> = ({ data, isLoading }) => (
  <div className="lg:col-span-8 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-teal-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hourly Performance</h2>
        </div>
        <p className="text-[10px] text-slate-500">Revenue vs Orders vs Delivery Volume</p>
      </div>
      <div className="flex gap-3">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-500" /><span className="text-[9px] font-bold text-slate-400 uppercase">Sales</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-[9px] font-bold text-slate-400 uppercase">Delivery</span></div>
      </div>
    </div>
    <div className="h-[300px] w-full">
      {isLoading ? <ChartSkeleton height="h-[300px]" /> : !data.length ? <EmptyState height="h-[300px]" /> : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
            <XAxis dataKey="HourLabel" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
            <Area type="monotone" dataKey="Sales" fill="#14b8a6" fillOpacity={0.05} stroke="#14b8a6" strokeWidth={2} />
            <Line type="monotone" dataKey="Delivery" stroke="#f59e0b" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  </div>
);
