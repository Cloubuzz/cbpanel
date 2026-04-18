import React from 'react';
import { History, Ticket } from 'lucide-react';
import type { OrderTab } from '../../../services/ordersApi';
import { TABS } from '../helpers';

interface Props {
  activeTab: OrderTab;
  tabData: Partial<Record<OrderTab, { loading: boolean }>>;
  onTabChange: (tab: OrderTab) => void;
}

export const StatusRail: React.FC<Props> = ({ activeTab, tabData, onTabChange }) => (
  <div className="w-16 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center py-4 gap-4 z-20">
    {TABS.map((item) => (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative ${
          activeTab === item.id
            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        {item.icon}
        <span className="text-[8px] font-bold uppercase">{item.label}</span>
        {tabData[item.id]?.loading && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
        )}
      </button>
    ))}
    <button className="w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
      <History size={20} />
      <span className="text-[8px] font-bold uppercase">Journey</span>
    </button>
    <button className="w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all">
      <Ticket size={20} />
      <span className="text-[8px] font-bold uppercase">Ticket</span>
    </button>
  </div>
);
