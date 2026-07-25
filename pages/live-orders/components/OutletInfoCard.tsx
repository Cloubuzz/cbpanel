import React from 'react';
import { Utensils } from 'lucide-react';
import type { OrderDetail } from '../../../services/ordersApi';

interface Props {
  orderDetail: OrderDetail;
  onSwitchOutlet: () => void;
}

export const OutletInfoCard: React.FC<Props> = ({ orderDetail, onSwitchOutlet }) => (
  <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shrink-0">
        <Utensils size={20} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-900 dark:text-white">{orderDetail.order.OutletName}</p>
        <p className="text-[10px] text-slate-500">{orderDetail.order.OutletAddress}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{orderDetail.order.OutletPhone}</p>
      </div>
    </div>
    <button
      onClick={onSwitchOutlet}
      className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase hover:underline shrink-0"
    >
      Switch Outlet
    </button>
  </div>
);
