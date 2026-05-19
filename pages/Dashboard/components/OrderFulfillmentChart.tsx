import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyState } from './EmptyState';
import type { FulfillmentItem } from '../hooks/useDashboardData';

interface Props {
  data: FulfillmentItem[];
  isLoading: boolean;
}

export const OrderFulfillmentChart: React.FC<Props> = ({ data, isLoading }) => (
  <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Order Fulfillment</h2>
    <div className="h-[200px] w-full">
      {isLoading ? <ChartSkeleton /> : !data.length ? <EmptyState /> : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
              {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value}%`, name]} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
    <div className="grid grid-cols-2 gap-y-2 mt-4">
      {!isLoading && data.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.fill }} />
          <span className="text-[10px] font-bold text-slate-500 uppercase">{s.name}</span>
          <span className="text-[10px] font-bold text-slate-900 dark:text-white ml-auto">{s.value}%</span>
        </div>
      ))}
    </div>
  </div>
);
