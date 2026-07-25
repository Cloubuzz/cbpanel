import React from 'react';
import { Search, Tag, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import type { Discount } from '../types';

interface Props {
  discounts: Discount[];
  selectedId?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (d: Discount) => void;
}

export const DiscountList: React.FC<Props> = ({ discounts, selectedId, searchQuery, onSearchChange, onSelect }) => (
  <div className="space-y-6">
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
      <input
        type="text"
        placeholder="Search discounts..."
        value={searchQuery}
        onChange={e => onSearchChange(e.target.value)}
        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-amber-500 rounded-2xl shadow-sm outline-none transition-all dark:text-white"
      />
    </div>
    <div className="space-y-4">
      {discounts.map(d => (
        <motion.div layout key={d.id} onClick={() => onSelect(d)}
          className={`p-5 bg-white dark:bg-slate-900 rounded-[32px] border-2 transition-all cursor-pointer ${selectedId === d.id ? 'border-amber-500 shadow-lg' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm'}`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center ${selectedId === d.id ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                {d.image ? <img src={d.image} alt={d.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <Tag size={20} className="text-slate-400" />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{d.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{d.type === 'PERCENTAGE' ? `${d.value}% Off` : `${d.value} PKR Off`}</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${d.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
              {d.isActive ? 'Active' : 'Draft'}
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1"><Calendar size={12} /><span>{d.startDate} - {d.endDate}</span></div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);
