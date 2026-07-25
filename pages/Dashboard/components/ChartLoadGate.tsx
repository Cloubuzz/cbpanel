import React from 'react';
import { BarChart2, Eye, RefreshCw } from 'lucide-react';
import type { ChartStatus } from '../hooks/useDashboardData';

interface Props {
  status: ChartStatus;
  onLoad: () => void;
  onRefresh: () => void;
  title: string;
  children: React.ReactNode;
  /** col-span class for the idle placeholder card */
  colSpan?: string;
  /** Chart area height for the idle placeholder */
  height?: string;
  /**
   * inline=true: no card wrapper (parent already provides the card).
   * inline=false (default): render a full card placeholder when idle.
   */
  inline?: boolean;
}

const IdleContent: React.FC<{ title: string; height: string; onLoad: () => void }> = ({ title, height, onLoad }) => (
  <>
    <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">{title}</h2>
    <div className={`${height} flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700`}>
      <BarChart2 size={28} className="text-slate-300 dark:text-slate-600" />
      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">Click View to load this chart</p>
      <button
        onClick={onLoad}
        className="flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors"
      >
        <Eye size={12} />
        View
      </button>
    </div>
  </>
);

const RefreshButton: React.FC<{ onRefresh: () => void; spinning: boolean }> = ({ onRefresh, spinning }) => (
  <button
    onClick={onRefresh}
    disabled={spinning}
    title="Refresh"
    className="absolute top-4 right-4 z-10 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-teal-500 hover:border-teal-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
    <RefreshCw size={12} className={spinning ? 'animate-spin' : ''} />
  </button>
);

export const ChartLoadGate: React.FC<Props> = ({
  status,
  onLoad,
  onRefresh,
  title,
  children,
  colSpan = 'lg:col-span-4',
  height = 'h-[200px]',
  inline = false,
}) => {
  // Inline mode: parent provides the card wrapper
  if (inline) {
    if (status === 'idle') {
      return <IdleContent title={title} height={height} onLoad={onLoad} />;
    }
    return (
      <div className="relative">
        <RefreshButton onRefresh={onRefresh} spinning={status === 'loading'} />
        {children}
      </div>
    );
  }

  // Always render as the grid cell so col-span never changes between states
  return (
    <div className={`${colSpan} glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800 relative`}>
      {status === 'idle' ? (
        <IdleContent title={title} height={height} onLoad={onLoad} />
      ) : (
        <>
          <RefreshButton onRefresh={onRefresh} spinning={status === 'loading'} />
          {children}
        </>
      )}
    </div>
  );
};
