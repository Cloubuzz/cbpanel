import React from 'react';
import { Settings2, X, Trash2, Percent, Tag, Save, ShoppingBag, Calendar, Hash } from 'lucide-react';
import { motion } from 'motion/react';
import type { Voucher } from '../types';

interface Props {
  voucher: Voucher;
  isNew: boolean;
  isSaving: boolean;
  onChange: (v: Voucher) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export const VoucherEditor: React.FC<Props> = ({ voucher, isNew, isSaving, onChange, onSave, onDelete, onCancel }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    className="bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
  >
    {/* Header */}
    <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
          <Settings2 size={20} />
        </div>
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">
            {isNew ? 'New Voucher' : voucher.code}
          </h2>
          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
            {isNew ? 'Fill in the voucher details below' : 'Voucher details'}
          </p>
        </div>
      </div>
      <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
        <X size={24} />
      </button>
    </div>

    <div className="p-5 md:p-8">
      {isNew ? (
        /* ── Create form: only the 3 API fields ── */
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Hash size={12} /> Voucher Code
            </label>
            <input
              type="text"
              value={voucher.code}
              onChange={e => onChange({ ...voucher, code: e.target.value.toUpperCase() })}
              placeholder="e.g. SAVE100"
              className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white font-mono tracking-widest"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Discount Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { api: 'Amount', label: 'Fixed Amount', icon: <Tag size={16} /> },
                { api: 'Percentage', label: 'Percentage', icon: <Percent size={16} /> },
              ].map(opt => (
                <button
                  key={opt.api}
                  type="button"
                  onClick={() => onChange({ ...voucher, type: opt.api === 'Amount' ? 'FIXED' : 'PERCENTAGE' })}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                    voucher.type === (opt.api === 'Amount' ? 'FIXED' : 'PERCENTAGE')
                      ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                      : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Amount {voucher.type === 'PERCENTAGE' ? '(%)' : '(PKR)'}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {voucher.type === 'PERCENTAGE' ? <Percent size={16} /> : <Tag size={16} />}
              </div>
              <input
                type="number"
                min={0}
                value={voucher.value || ''}
                onChange={e => onChange({ ...voucher, value: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl text-sm transition-all outline-none dark:text-white"
              />
            </div>
          </div>
        </div>
      ) : (
        /* ── Edit form for existing vouchers ── */
        <div className="space-y-6 max-w-md">
          {/* Read-only meta */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              <Calendar size={13} />
              <span>Created {voucher.startDate}</span>
            </div>
            {voucher.orderId && (
              <>
                <span className="text-slate-200 dark:text-slate-700">·</span>
                <div className="flex items-center gap-2 text-[11px] font-bold text-teal-500 uppercase tracking-widest">
                  <ShoppingBag size={13} />
                  <span>Order #{voucher.orderId}</span>
                </div>
              </>
            )}
            <span className={`ml-auto px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
              voucher.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {voucher.isActive ? 'Unused' : 'Used'}
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Hash size={12} /> Voucher Code
            </label>
            <input
              type="text"
              value={voucher.code}
              onChange={e => onChange({ ...voucher, code: e.target.value.toUpperCase() })}
              className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white font-mono tracking-widest"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Discount Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { api: 'Amount', label: 'Fixed Amount', icon: <Tag size={16} /> },
                { api: 'Percentage', label: 'Percentage', icon: <Percent size={16} /> },
              ].map(opt => (
                <button
                  key={opt.api}
                  type="button"
                  onClick={() => onChange({ ...voucher, type: opt.api === 'Amount' ? 'FIXED' : 'PERCENTAGE' })}
                  className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 text-sm font-bold transition-all ${
                    voucher.type === (opt.api === 'Amount' ? 'FIXED' : 'PERCENTAGE')
                      ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                      : 'border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Amount {voucher.type === 'PERCENTAGE' ? '(%)' : '(PKR)'}
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                {voucher.type === 'PERCENTAGE' ? <Percent size={16} /> : <Tag size={16} />}
              </div>
              <input
                type="number"
                min={0}
                value={voucher.value || ''}
                onChange={e => onChange({ ...voucher, value: parseFloat(e.target.value) || 0 })}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl text-sm transition-all outline-none dark:text-white"
              />
            </div>
          </div>
        </div>
      )}
    </div>

    <div className="p-5 md:p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
      <button onClick={onDelete} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all">
        <Trash2 size={20} /> Delete Voucher
      </button>
      <div className="w-full md:w-auto flex items-center gap-3">
        <button onClick={onCancel} className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-all">
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaving || !voucher.code}
          className="flex items-center justify-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isSaving
            ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Save size={20} />
          }
          {isSaving ? 'Saving...' : isNew ? 'Create Voucher' : 'Save Changes'}
        </button>
      </div>
    </div>
  </motion.div>
);
