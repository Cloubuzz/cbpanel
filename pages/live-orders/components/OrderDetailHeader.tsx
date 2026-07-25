import React from 'react';
import {
  ShoppingBag,
  Clock,
  Truck,
  MapPin,
  AlertCircle,
  Printer,
  Share2,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { RawOrder, OrderDetail } from '../../../services/ordersApi';
import { getStatusColor } from '../helpers';

interface Props {
  selectedOrder: RawOrder;
  orderDetail: OrderDetail | null;
  onPrint: () => void;
  onReject: () => void;
  onAccept: () => void;
}

export const OrderDetailHeader: React.FC<Props> = ({ selectedOrder, orderDetail, onPrint, onReject, onAccept }) => (
  <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/30 backdrop-blur-md sticky top-0 z-20">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 border border-teal-500/20">
        <ShoppingBag size={24} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Order #{selectedOrder.ID}</h1>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(selectedOrder.Status)}`}>
            {selectedOrder.Status}
          </span>
          {orderDetail?.order.IsForwardToPOS && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-blue-500/10 text-blue-500 border-blue-500/20">
              POS
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(selectedOrder.Created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="flex items-center gap-1"><Truck size={12} /> {selectedOrder.OrderType}</span>
          <span className="flex items-center gap-1"><MapPin size={12} /> {selectedOrder.Branch}</span>
          {orderDetail?.order.Channel && (
            <span className="flex items-center gap-1"><AlertCircle size={12} /> {orderDetail.order.Channel}</span>
          )}
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={onPrint}
        className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all"
        title="Print Invoice"
      >
        <Printer size={20} />
      </button>
      <button
        className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all"
        title="Share"
      >
        <Share2 size={20} />
      </button>
      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
        <MoreVertical size={20} />
      </button>
      <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2" />
      <button
        onClick={onReject}
        className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
      >
        <XCircle size={18} /> Reject
      </button>
      <button
        onClick={onAccept}
        className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
      >
        <CheckCircle2 size={18} /> Accept Order
      </button>
    </div>
  </div>
);
