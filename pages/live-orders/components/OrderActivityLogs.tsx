import React from 'react';
import { History, Clock } from 'lucide-react';
import type { OrderLogs } from '../../../services/ordersApi';

interface Props {
  orderLogs: OrderLogs;
}

export const OrderActivityLogs: React.FC<Props> = ({ orderLogs }) => (
  <div className="bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
        <History size={16} className="text-teal-500" />
        Order Activity Logs
      </h3>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase">
          {orderLogs.summary.channel} · {orderLogs.summary.source}
        </span>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
          {orderLogs.logs.length} Events
        </span>
      </div>
    </div>

    <div className="p-6">
      <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
        {orderLogs.logs.map((log) => (
          <div key={log.ID} className="relative pl-8 group">
            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-teal-500 group-hover:text-teal-500 transition-all z-10">
              <Clock size={12} />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{log.object_type}</p>
                {typeof log.Remarks === 'string' && log.Remarks && (
                  <p className="text-xs text-slate-500 italic">{log.Remarks}</p>
                )}
                {log.RejectionTitle && (
                  <p className="text-xs text-rose-500 font-medium">{log.RejectionTitle}</p>
                )}
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest">
                  {log.LogType} · {log.OrderChannel}
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg self-start sm:shrink-0">
                {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
