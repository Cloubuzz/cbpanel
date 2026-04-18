import React from 'react';
import { MapPin, MessageSquare, Save, ChevronDown } from 'lucide-react';
import type { OrderDetail } from '../../../services/ordersApi';

interface Props {
  orderDetail: OrderDetail;
  paymentType: string;
  onPaymentTypeChange: (type: string) => void;
}

export const OrderItemsTable: React.FC<Props> = ({ orderDetail, paymentType, onPaymentTypeChange }) => (
  <div className="bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Order Items</h3>
    </div>

    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20">
          <th className="px-6 py-4 w-12">#</th>
          <th className="px-6 py-4">Item Details</th>
          <th className="px-6 py-4 text-center">Qty</th>
          <th className="px-6 py-4 text-right">Unit Price</th>
          <th className="px-6 py-4 text-right">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {orderDetail.items.map((item, idx) => (
          <tr key={item.orderdetailID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <td className="px-6 py-4 text-xs font-bold text-slate-400">{idx + 1}</td>
            <td className="px-6 py-4">
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{item.Item}</p>
              <p className="text-xs text-slate-400 mb-1">{item.Size}</p>
              {item.Options.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.Options.map((opt) => (
                    <span key={opt.OptionID} className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                      {opt.optiongroupName}: {opt.OptionItem} {opt.Price !== '0' ? `+RS ${opt.Price}` : ''}
                    </span>
                  ))}
                </div>
              )}
              {item.CookingInstructions && (
                <p className="text-xs text-amber-600 dark:text-amber-400 italic mt-1">{item.CookingInstructions}</p>
              )}
            </td>
            <td className="px-6 py-4 text-center">
              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-700 dark:text-slate-300">
                {item.Qty}
              </span>
            </td>
            <td className="px-6 py-4 text-right text-sm font-medium text-slate-600 dark:text-slate-400">
              RS {item.price.toLocaleString()}
            </td>
            <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
              RS {item.Total.toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col lg:flex-row gap-6">
      {/* Address + Remarks */}
      <div className="flex-1 space-y-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Delivery Address</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
              <textarea
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/50 transition-all min-h-[60px]"
                defaultValue={`${orderDetail.order.Address}${orderDetail.order.Area ? `, ${orderDetail.order.Area}` : ''}`}
              />
            </div>
            <button className="self-end p-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all shadow-md shadow-teal-500/20">
              <Save size={18} />
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Remarks / Special Instructions</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <MessageSquare className="absolute left-3 top-3 text-slate-400" size={16} />
              <textarea
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/50 transition-all min-h-[60px]"
                placeholder="Add internal notes or customer remarks..."
                defaultValue={orderDetail.order.Remarks}
              />
            </div>
            <button className="self-end p-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all shadow-md shadow-teal-500/20">
              <Save size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Totals + Payment */}
      <div className="w-full lg:w-80 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Sub-Total</span>
          <span className="font-bold text-slate-900 dark:text-white">RS {orderDetail.order.SubTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Delivery Fee</span>
          <span className="font-bold text-emerald-500">RS {orderDetail.order.DeliveryFee.toLocaleString()}</span>
        </div>
        {orderDetail.order.Discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Discount</span>
            <span className="font-bold text-rose-500">- RS {orderDetail.order.Discount.toLocaleString()}</span>
          </div>
        )}
        {Number(orderDetail.order.VoucherAmount) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Voucher ({orderDetail.order.VoucherCode})</span>
            <span className="font-bold text-rose-500">- RS {Number(orderDetail.order.VoucherAmount).toLocaleString()}</span>
          </div>
        )}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-base font-bold text-slate-900 dark:text-white">Grand Total</span>
          <span className="text-2xl font-black text-teal-600 dark:text-teal-400">
            RS {orderDetail.order.GrandTotal.toLocaleString()}
          </span>
        </div>

        <div className="pt-4 space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Payment Method
          </label>
          <div className="relative group">
            <select
              value={paymentType}
              onChange={(e) => onPaymentTypeChange(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-teal-500/50 transition-all outline-none"
            >
              <option value="Cash">Cash on Delivery</option>
              <option value="CreditCard">Credit Card</option>
              <option value="JazzCash">JazzCash</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-teal-500 transition-colors"
              size={18}
            />
          </div>
          <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg">
            Change Payment Type
          </button>
        </div>
      </div>
    </div>
  </div>
);
