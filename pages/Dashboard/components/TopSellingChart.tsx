import React from 'react';
import { CHART_COLORS } from '../constants';
import { EmptyState } from './EmptyState';
import type { DashboardTopSellingItem } from '../../../services/dashboardApi';

interface Props {
  data: DashboardTopSellingItem[];
  isLoading: boolean;
}

export const TopSellingChart: React.FC<Props> = ({ data, isLoading }) => (
  <>
    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Top Selling Items</h2>
    {isLoading ? (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="animate-pulse h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
            <div className="animate-pulse h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
          </div>
        ))}
      </div>
    ) : !data.length ? <EmptyState message="No sales data for this period" /> : (
      <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
        {data.map((item, i) => {
          const max = data[0]?.TotalSale || 1;
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600 dark:text-slate-400 truncate mr-2">{item.ItemName}</span>
                <span className="text-slate-900 dark:text-white shrink-0">{item.TotalSale.toLocaleString()}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.TotalSale / max) * 100}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    )}
  </>
);
