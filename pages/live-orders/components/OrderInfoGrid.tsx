import React from 'react';
import { User, Phone, CreditCard, Wallet, Utensils, Clock } from 'lucide-react';
import type { OrderDetail } from '../../../services/ordersApi';
import { getRelativeTime } from '../helpers';

interface Props {
  orderDetail: OrderDetail;
}

export const OrderInfoGrid: React.FC<Props> = ({ orderDetail }) => (
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
    {/* Customer */}
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Customer Info</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500">
          <User size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{orderDetail.order.CustomerName}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Phone size={10} /> {orderDetail.order.CustomerPhone}
          </p>
          {orderDetail.order.Email && (
            <p className="text-xs text-slate-400">{orderDetail.order.Email}</p>
          )}
        </div>
      </div>
    </div>

    {/* Payment */}
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Payment Details</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
          {orderDetail.payment.Type.toLowerCase().includes('credit') ? <CreditCard size={20} /> : <Wallet size={20} />}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{orderDetail.payment.Display}</p>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${orderDetail.payment.IsCreditCardSuccessfull ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <p className="text-xs text-slate-500">{orderDetail.payment.OnlineStatus}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Outlet */}
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Outlet</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
          <Utensils size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{orderDetail.order.OutletName}</p>
          <p className="text-xs text-slate-500">{orderDetail.order.OutletPhone}</p>
        </div>
      </div>
    </div>

    {/* Delivery Time */}
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Delivery Time</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
          <Clock size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{orderDetail.order.DeliveryTime} Minutes</p>
          <p className="text-xs text-slate-500">{getRelativeTime(orderDetail.order.OrderDateTime)} ago</p>
        </div>
      </div>
    </div>
  </div>
);
