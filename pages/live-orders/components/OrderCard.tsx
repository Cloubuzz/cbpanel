import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';
import type { RawOrder } from '../../../services/ordersApi';
import { getRelativeTime, getStatusColor } from '../helpers';

interface Props {
  order: RawOrder;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

export const OrderCard: React.FC<Props> = ({ order, isSelected, onSelect }) => (
  <button
    onClick={() => onSelect(order.ID)}
    className={`w-full p-4 text-left transition-all relative group ${
      isSelected
        ? 'bg-teal-500/5 dark:bg-teal-500/10'
        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
    }`}
  >
    {isSelected && (
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500" />
    )}

    <div className="flex justify-between items-start mb-1">
      <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-tighter">
        #{order.ID}
      </span>
      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
        <Clock size={10} /> {getRelativeTime(order.Created)}
      </span>
    </div>

    <div className="flex justify-between items-center mb-2">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2">
        {order.CustomerName}
      </h3>
      <span className="text-sm font-bold text-slate-900 dark:text-white">
        RS {order.OrderAmount.toLocaleString()}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusColor(order.Status)}`}>
          {order.Status}
        </span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{order.OrderType}</span>
        <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase">{order.Branch}</span>
      </div>
      <ChevronRight
        size={14}
        className={`text-slate-300 transition-transform ${isSelected ? 'translate-x-1 text-teal-500' : 'group-hover:translate-x-1'}`}
      />
    </div>
  </button>
);
