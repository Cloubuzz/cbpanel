import React from 'react';
import { Search, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import type { RawOrder, OrderTab } from '../../../services/ordersApi';
import { TABS } from '../helpers';
import { OrderCard } from './OrderCard';

interface Props {
  activeTab: OrderTab;
  isLoading: boolean;
  currentError: string | null;
  filteredOrders: RawOrder[];
  selectedOrderId: number | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  onSelectOrder: (id: number) => void;
}

export const OrderListPanel: React.FC<Props> = ({
  activeTab,
  isLoading,
  currentError,
  filteredOrders,
  selectedOrderId,
  searchQuery,
  onSearchChange,
  onRefresh,
  onSelectOrder,
}) => (
  <div className="w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900/50 backdrop-blur-sm relative z-10">
    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag size={20} className="text-teal-500" />
          {TABS.find((t) => t.id === activeTab)?.label ?? activeTab} Orders
        </h2>
        <div className="flex items-center gap-2">
          {!isLoading && (
            <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
              {filteredOrders.length}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 transition-all disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search ID, Name, Phone..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/50 transition-all"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>

    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 custom-scrollbar">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-10 gap-3">
          <RefreshCw className="animate-spin text-teal-500" size={24} />
          <p className="text-slate-400 text-sm">Loading orders…</p>
        </div>
      ) : currentError ? (
        <div className="p-6 text-center space-y-3">
          <AlertCircle className="mx-auto text-rose-400" size={28} />
          <p className="text-slate-500 text-sm">{currentError}</p>
          <button
            onClick={onRefresh}
            className="text-teal-600 dark:text-teal-400 text-xs font-bold uppercase underline"
          >
            Retry
          </button>
        </div>
      ) : filteredOrders.length > 0 ? (
        filteredOrders.map((order) => (
          <OrderCard
            key={order.ID}
            order={order}
            isSelected={selectedOrderId === order.ID}
            onSelect={onSelectOrder}
          />
        ))
      ) : (
        <div className="p-8 text-center">
          <p className="text-slate-400 text-sm italic">No orders found.</p>
        </div>
      )}
    </div>
  </div>
);
