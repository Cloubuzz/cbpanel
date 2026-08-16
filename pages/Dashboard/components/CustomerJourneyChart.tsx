import React from 'react';
import { ChartSkeleton } from './ChartSkeleton';
import { EmptyState } from './EmptyState';
import type { DashboardCustomerJourneyItem } from '../../../services/dashboardApi';

interface Props {
  data: DashboardCustomerJourneyItem[];
  isLoading: boolean;
}

const getStepColor = (step: string): string => {
  const s = step.toLowerCase();
  if (s.includes('cart')) return 'bg-blue-500';
  if (s.includes('address')) return 'bg-purple-500';
  if (s.includes('checkout')) return 'bg-pink-500';
  return 'bg-emerald-500'; // Place Order
};

export const CustomerJourneyChart: React.FC<Props> = ({ data, isLoading }) => {
  // Order steps: Add Address, Add to Cart, Checkout, Place Order
  const stepOrder = ['address', 'cart', 'checkout', 'place'];
  
  const sortedData = [...data].sort((a, b) => {
    const idxA = stepOrder.findIndex(s => a.step.toLowerCase().includes(s));
    const idxB = stepOrder.findIndex(s => b.step.toLowerCase().includes(s));
    return idxA - idxB;
  });

  return (
    <>
      <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Customer Journey</h2>
      <div className="flex flex-col justify-center gap-y-4 min-h-[200px] py-2">
        {isLoading ? (
          <ChartSkeleton />
        ) : !data.length ? (
          <EmptyState />
        ) : (
          sortedData.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                <span>{item.step}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-950 dark:text-white font-mono text-[11px]">{Number(item.count).toLocaleString()}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-sans">({item.percentage}%)</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStepColor(item.step)} rounded-full transition-all duration-500`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};
