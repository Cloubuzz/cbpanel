import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { LIVE_ORDERS_MOCK } from '../constants';

const STATUS_STYLES: Record<string, string> = {
  Baking: 'bg-orange-100 text-orange-600',
  Prep: 'bg-blue-100 text-blue-600',
  'Out for Delivery': 'bg-purple-100 text-purple-600',
  Delivered: 'bg-emerald-100 text-emerald-600',
};

export const LiveKitchenMonitor: React.FC = () => (
  <div className="lg:col-span-12 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-rose-500 animate-pulse" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live Kitchen Monitor</h2>
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase">{LIVE_ORDERS_MOCK.length} Active Orders</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {LIVE_ORDERS_MOCK.map((order, i) => (
        <div key={i} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase">{order.id}</span>
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${STATUS_STYLES[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
              {order.status}
            </span>
          </div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{order.branch}</h4>
          <p className="text-[10px] text-slate-500 mb-2 line-clamp-1 italic">"{order.items}"</p>
          <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white">{order.total}</span>
            <span className="text-[9px] text-slate-400 flex items-center gap-1"><Clock size={10} /> {order.time}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
