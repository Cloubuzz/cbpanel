import React, { useState } from 'react';
import { CheckCircle2, Ban, Loader2 } from 'lucide-react';

interface Props {
  type: 'Accept' | 'Reject';
  orderId: number | undefined;
  isProcessing?: boolean;
  onConfirm: (rejectReason: string) => void;
  onCancel: () => void;
}

export const ConfirmActionModal: React.FC<Props> = ({ type, orderId, isProcessing, onConfirm, onCancel }) => {
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 text-center">
          <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
            type === 'Accept' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
          }`}>
            {type === 'Accept' ? <CheckCircle2 size={40} /> : <Ban size={40} />}
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {type === 'Accept' ? 'Accept Order?' : 'Reject Order?'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Are you sure you want to {type.toLowerCase()} order{' '}
            <span className="font-bold text-slate-900 dark:text-white">#{orderId}</span>?{' '}
            This action will notify the customer immediately.
          </p>
          {type === 'Reject' && (
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={3}
              className="w-full mb-6 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all resize-none"
            />
          )}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(rejectReason)}
              disabled={isProcessing}
              className={`flex-1 py-3.5 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 ${
                type === 'Accept'
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                  : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
              }`}
            >
              {isProcessing && <Loader2 size={16} className="animate-spin" />}
              Confirm {type}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
