import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyState } from './EmptyState';
import type { FulfillmentItem } from '../hooks/useDashboardData';

interface Props {
  data: FulfillmentItem[];
  isLoading: boolean;
}

export const OrderFulfillmentChart: React.FC<Props> = ({ data, isLoading }) => {
  const pieData = data.filter(item => {
    const nameLower = item.name.toLowerCase();
    return (
      nameLower !== 'autoaccept' &&
      nameLower !== 'autoacceptance' &&
      nameLower !== 'responsetimecod' &&
      nameLower !== 'responsetimecc'
    );
  });

  const autoAcceptItem = data.find(item => {
    const nameLower = item.name.toLowerCase();
    return nameLower === 'autoaccept' || nameLower === 'autoacceptance';
  });

  const responseTimeCodItem = data.find(item => {
    const nameLower = item.name.toLowerCase();
    return nameLower === 'responsetimecod';
  });

  const responseTimeCcItem = data.find(item => {
    const nameLower = item.name.toLowerCase();
    return nameLower === 'responsetimecc';
  });

  const listData = [...pieData];
  if (autoAcceptItem) {
    listData.push({
      ...autoAcceptItem,
      name: 'Auto Accept'
    });
  }

  const formatSeconds = (totalSec: number) => {
    if (totalSec <= 0) return '0s';
    const m = Math.floor(totalSec / 60);
    const s = Math.round(totalSec % 60);
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <>
      <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Order Fulfillment</h2>
      <div className="h-[200px] w-full">
        {isLoading ? <ChartSkeleton /> : !pieData.length ? <EmptyState /> : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}%`, name]} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="grid grid-cols-2 gap-y-2 mt-4">
        {!isLoading && listData.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.fill }} />
            <span className="text-[10px] font-bold text-slate-500 uppercase">{s.name}</span>
            <span className="text-[10px] font-bold text-slate-900 dark:text-white ml-auto">{s.value}%</span>
          </div>
        ))}
      </div>
      {!isLoading && (responseTimeCodItem || responseTimeCcItem) && (
        <>
          <div className="border-t border-slate-100 dark:border-slate-800 my-3" />
          <div className="grid grid-cols-2 gap-x-4">
            {responseTimeCodItem && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: responseTimeCodItem.fill }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Resp. Time COD</span>
                <span className="text-[10px] font-bold text-slate-900 dark:text-white ml-auto">
                  {formatSeconds(responseTimeCodItem.value)}
                </span>
              </div>
            )}
            {responseTimeCcItem && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: responseTimeCcItem.fill }} />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Resp. Time CC</span>
                <span className="text-[10px] font-bold text-slate-900 dark:text-white ml-auto">
                  {formatSeconds(responseTimeCcItem.value)}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};
