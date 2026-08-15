import React from 'react';
import { MetricCardProps } from '../../../types';

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  isLoading,
  // trend, trendUp, color, sparklineData kept in props signature for compatibility
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3">
      {/* Icon */}
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-500/20 text-teal-600 dark:text-teal-400">
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
      </div>

      {/* Label */}
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{title}</p>

      {/* Value */}
      <div>
        {isLoading ? (
          <div className="animate-pulse h-6 w-20 bg-slate-100 dark:bg-slate-800 rounded-md" />
        ) : (
          <p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p>
        )}
      </div>
    </div>
  );
};
