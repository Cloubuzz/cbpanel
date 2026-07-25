import React from 'react';
import { Search, Ticket, Calendar, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import type { Voucher } from '../types';

interface Props {
  vouchers: Voucher[];
  selectedId?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (v: Voucher) => void;
}

export const VoucherList: React.FC<Props> = ({ vouchers, selectedId, searchQuery, onSearchChange, onSelect }) => (
  <div className="space-y-6">
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
      <input
        type="text"
        placeholder="Search vouchers..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl shadow-sm outline-none transition-all dark:text-white"
      />
    </div>
    <div className="space-y-4">
      {vouchers.map(v => (
        <motion.div layout key={v.id} onClick={() => onSelect(v)}
          className={`p-5 bg-white dark:bg-slate-900 rounded-[32px] border-2 transition-all cursor-pointer ${selectedId === v.id ? 'border-teal-500 shadow-lg' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm'}`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedId === v.id ? 'bg-teal-500/10 ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Ticket size={20} className={selectedId === v.id ? 'text-teal-500' : 'text-slate-400'} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white tracking-widest font-mono">{v.code}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  {v.type === 'PERCENTAGE' ? `${v.value}% Off` : `PKR ${v.value} Off`}
                </p>
              </div>
            </div>
            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
              v.isActive
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-rose-500/10 text-rose-500'
            }`}>
              {v.isActive ? 'Unused' : 'Used'}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-3 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Calendar size={11} />
              <span>{v.startDate}</span>
            </div>
            {v.orderId && (
              <div className="flex items-center gap-1.5 text-teal-500">
                <ShoppingBag size={11} />
                <span>Order #{v.orderId}</span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);
