import React from 'react';
import { Search, XCircle, AlertCircle, RefreshCw, Utensils } from 'lucide-react';
import type { Outlet } from '../../../services/ordersApi';

interface Props {
  selectedOrderId: number | undefined;
  outlets: Outlet[];
  outletsLoading: boolean;
  outletsError: string | null;
  currentOutletName: string;
  outletSearch: string;
  onSearchChange: (q: string) => void;
  onClose: () => void;
  onSelect: (outlet: Outlet) => void;
  onRetry: () => void;
}

export const SwitchOutletModal: React.FC<Props> = ({
  selectedOrderId,
  outlets,
  outletsLoading,
  outletsError,
  currentOutletName,
  outletSearch,
  onSearchChange,
  onClose,
  onSelect,
  onRetry,
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Switch Outlet</h3>
          <p className="text-xs text-slate-400 mt-0.5">Select a new outlet for Order #{selectedOrderId}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <XCircle size={20} />
        </button>
      </div>

      <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search outlet..."
            value={outletSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/50 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {outletsLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <RefreshCw className="animate-spin text-teal-500" size={24} />
            <p className="text-slate-400 text-sm">Loading outlets…</p>
          </div>
        ) : outletsError ? (
          <div className="p-6 text-center space-y-3">
            <AlertCircle className="mx-auto text-rose-400" size={28} />
            <p className="text-slate-500 text-sm">{outletsError}</p>
            <button
              onClick={onRetry}
              className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase underline"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {outlets
              .filter((o) => o.NAME.toLowerCase().includes(outletSearch.toLowerCase()))
              .map((outlet) => (
                <button
                  key={outlet.ID}
                  onClick={() => onSelect(outlet)}
                  className={`w-full px-5 py-3.5 text-left flex items-center justify-between hover:bg-teal-500/5 dark:hover:bg-teal-500/10 transition-all group ${
                    outlet.NAME === currentOutletName ? 'bg-teal-500/5 dark:bg-teal-500/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-500 shrink-0">
                      <Utensils size={16} />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {outlet.NAME}
                    </span>
                  </div>
                  {outlet.NAME === currentOutletName && (
                    <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">Current</span>
                  )}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  </div>
);
