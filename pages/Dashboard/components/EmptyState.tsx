import React from 'react';
import { BarChart2 } from 'lucide-react';

interface Props {
  message?: string;
  height?: string;
}

export const EmptyState: React.FC<Props> = ({ message = 'No data for this period', height = 'h-[200px]' }) => (
  <div className={`${height} w-full flex flex-col items-center justify-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700`}>
    <BarChart2 size={28} className="text-slate-300 dark:text-slate-600" />
    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{message}</p>
  </div>
);
