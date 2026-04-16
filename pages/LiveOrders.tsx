import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  Search,
  MoreVertical,
  Printer,
  Share2,
  CreditCard,
  Wallet,
  Truck,
  ShoppingBag,
  MessageSquare,
  Save,
  Utensils,
  Ban,
  History,
  Ticket,
  ChevronDown
} from 'lucide-react';

interface OrderItem {
  id: number;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  amount: number;
  type: 'Delivery' | 'Takeaway';
  time: string;
  status: 'Pending' | 'Accepted' | 'Preparing' | 'Baking' | 'Out for Delivery' | 'Delivered' | 'Rejected';
  channel: string;
  deliveryTime: string;
  paidBy: string;
  isPaid: boolean;
  address: string;
  remarks: string;
  items: OrderItem[];
  subTotal: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  activityLogs: {
    id: number;
    action: string;
    user: string;
    time: string;
    icon?: React.ReactNode;
  }[];
}

const mockOrders: Order[] = [
  {
    id: '5486646',
    customerName: 'Ansa Rizwan',
    phone: '03361054954',
    amount: 1992,
    type: 'Delivery',
    time: '1 Min',
    status: 'Accepted',
    channel: 'Web',
    deliveryTime: '30 Minutes',
    paidBy: 'CreditCard',
    isPaid: true,
    address: 'Jason gulshan gala block 11',
    remarks: '',
    items: [
      { id: 1, name: 'Chicago Bold Fold 13 INCH LARGE', description: 'Crust Stuffed Crust 99 Large Extra Topping Mozzarella Cheese 240', quantity: 1, unitPrice: 1499, total: 1499 },
      { id: 2, name: 'Chocolate Lava Cake', description: '', quantity: 1, unitPrice: 399, total: 399 },
      { id: 3, name: 'Beverages', description: 'Drinks Small Pepsi 345 Ml 129 x 2', quantity: 2, unitPrice: 0, total: 0 },
    ],
    subTotal: 2495,
    deliveryFee: 79,
    discount: 0,
    grandTotal: 2574,
    activityLogs: [
      { id: 1, action: 'Order Placed', user: 'Customer', time: '12:45 PM', icon: <ShoppingBag size={14} /> },
      { id: 2, action: 'Payment Verified', user: 'System', time: '12:46 PM', icon: <CreditCard size={14} /> },
      { id: 3, action: 'Order Accepted', user: 'Admin (Downtown)', time: '12:47 PM', icon: <CheckCircle2 size={14} /> },
    ]
  },
  {
    id: '5486647',
    customerName: 'Yasha Ali',
    phone: '03363454264',
    amount: 2574,
    type: 'Delivery',
    time: '5 Mins',
    status: 'Accepted',
    channel: 'App',
    deliveryTime: '45 Minutes',
    paidBy: 'Wallet',
    isPaid: false,
    address: 'Gulshan-e-Iqbal Block 4',
    remarks: 'Please bring change for 5000',
    items: [
      { id: 1, name: 'Pepperoni Feast Large', description: 'Thin Crust, Extra Cheese', quantity: 1, unitPrice: 1899, total: 1899 },
      { id: 2, name: 'Garlic Bread', description: 'With Cheese', quantity: 1, unitPrice: 299, total: 299 },
    ],
    subTotal: 2198,
    deliveryFee: 50,
    discount: 0,
    grandTotal: 2248,
    activityLogs: [
      { id: 1, action: 'Order Placed', user: 'Customer', time: '12:40 PM', icon: <ShoppingBag size={14} /> },
      { id: 2, action: 'Order Accepted', user: 'Admin (Downtown)', time: '12:42 PM', icon: <CheckCircle2 size={14} /> },
    ]
  },
  {
    id: '5486648',
    customerName: 'Kulsoom Mariam',
    phone: '03003608668',
    amount: 3075,
    type: 'Delivery',
    time: '5 Mins',
    status: 'Pending',
    channel: 'Web',
    deliveryTime: '40 Minutes',
    paidBy: 'Cash',
    isPaid: false,
    address: 'DHA Phase 6, Street 5',
    remarks: '',
    items: [
      { id: 1, name: 'BBQ Chicken Medium', description: 'Pan Crust', quantity: 2, unitPrice: 1299, total: 2598 },
    ],
    subTotal: 2598,
    deliveryFee: 100,
    discount: 0,
    grandTotal: 2698,
    activityLogs: [
      { id: 1, action: 'Order Placed', user: 'Customer', time: '12:50 PM', icon: <ShoppingBag size={14} /> },
    ]
  }
];

export const LiveOrders: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>(mockOrders[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [showConfirmModal, setShowConfirmModal] = useState<{ show: boolean, type: 'Accept' | 'Reject' | null }>({ show: false, type: null });
  const [paymentType, setPaymentType] = useState('CreditCard');

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.includes(searchQuery) ||
      order.phone.includes(searchQuery);
    
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus || (filterStatus === 'Credit Card' && order.paidBy === 'CreditCard');
    
    return matchesSearch && matchesStatus;
  });

  const selectedOrder = mockOrders.find(o => o.id === selectedOrderId) || mockOrders[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Rejected': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      
      {/* Far Left: Status Rail */}
      <div className="w-16 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col items-center py-4 gap-4 z-20">
        {[
          { id: 'Pending', icon: <Clock size={20} />, label: 'Pending' },
          { id: 'Accepted', icon: <CheckCircle2 size={20} />, label: 'Accepted' },
          { id: 'Credit Card', icon: <CreditCard size={20} />, label: 'Card' },
          { id: 'Rejected', icon: <Ban size={20} />, label: 'Rejected' },
          { id: 'POS Failed', icon: <AlertCircle size={20} />, label: 'POS' },
          { id: 'Journey', icon: <History size={20} />, label: 'Journey' },
          { id: 'Ticket', icon: <Ticket size={20} />, label: 'Ticket' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilterStatus(item.id)}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              filterStatus === item.id 
              ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' 
              : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="text-[8px] font-bold uppercase">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Left Column: Order List */}
      <div className="w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-900/50 backdrop-blur-sm relative z-10">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-teal-500" />
              Live Orders
            </h2>
            <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
              {mockOrders.length} NEW
            </span>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search ID, Name, Phone..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-teal-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50 custom-scrollbar">
          {filteredOrders.length > 0 ? filteredOrders.map(order => (
            <button 
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className={`w-full p-4 text-left transition-all relative group ${
                selectedOrderId === order.id 
                ? 'bg-teal-500/5 dark:bg-teal-500/10' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
              }`}
            >
              {selectedOrderId === order.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500"></div>
              )}
              
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-tighter">#{order.id}</span>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                  <Clock size={10} /> {order.time}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate pr-2">{order.customerName}</h3>
                <span className="text-sm font-bold text-slate-900 dark:text-white">RS {order.amount}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{order.type}</span>
                </div>
                <ChevronRight size={14} className={`text-slate-300 transition-transform ${selectedOrderId === order.id ? 'translate-x-1 text-teal-500' : 'group-hover:translate-x-1'}`} />
              </div>
            </button>
          )) : (
            <div className="p-8 text-center">
              <p className="text-slate-400 text-sm italic">No orders found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Order Details */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
        
        {/* Detail Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/30 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 border border-teal-500/20">
              <ShoppingBag size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Order #{selectedOrder.id}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1"><Clock size={12} /> Received 12:45 PM</span>
                <span className="flex items-center gap-1"><Truck size={12} /> {selectedOrder.deliveryTime} Delivery</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all" title="Print Invoice">
              <Printer size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all" title="Share">
              <Share2 size={20} />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <MoreVertical size={20} />
            </button>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <button 
              onClick={() => setShowConfirmModal({ show: true, type: 'Reject' })}
              className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all flex items-center gap-2"
            >
              <XCircle size={18} /> Reject
            </button>
            <button 
              onClick={() => setShowConfirmModal({ show: true, type: 'Accept' })}
              className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-teal-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={18} /> Accept Order
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Customer Info</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-500">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.customerName}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1"><Phone size={10} /> {selectedOrder.phone}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Payment Details</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                  {selectedOrder.paidBy === 'CreditCard' ? <CreditCard size={20} /> : <Wallet size={20} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.paidBy}</p>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedOrder.isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <p className="text-xs text-slate-500">{selectedOrder.isPaid ? 'Paid Successfully' : 'Payment Pending'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Order Source</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.channel} Channel</p>
                  <p className="text-xs text-slate-500">Type: {selectedOrder.type}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">Delivery Time</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedOrder.deliveryTime}</p>
                  <p className="text-xs text-slate-500">Estimated Arrival</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
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
                {selectedOrder.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-slate-500 italic max-w-md">{item.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-bold text-slate-700 dark:text-slate-300">
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-slate-600 dark:text-slate-400">RS {item.unitPrice}</td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">RS {item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex flex-col lg:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">Delivery Address</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                      <textarea 
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/50 transition-all min-h-[80px]"
                        defaultValue={selectedOrder.address}
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
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500/50 transition-all min-h-[80px]"
                        placeholder="Add internal notes or customer remarks..."
                        defaultValue={selectedOrder.remarks}
                      />
                    </div>
                    <button className="self-end p-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all shadow-md shadow-teal-500/20">
                      <Save size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-80 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Sub-Total</span>
                  <span className="font-bold text-slate-900 dark:text-white">RS {selectedOrder.subTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Delivery Fees</span>
                  <span className="font-bold text-emerald-500">RS {selectedOrder.deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Discount</span>
                  <span className="font-bold text-rose-500">- RS {selectedOrder.discount}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900 dark:text-white">Grand Total</span>
                  <span className="text-2xl font-black text-teal-600 dark:text-teal-400">RS {selectedOrder.grandTotal}</span>
                </div>
                
                <div className="pt-4 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Select Payment Method</label>
                  <div className="relative group">
                    <select 
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-teal-500/50 transition-all outline-none"
                    >
                      <option value="CreditCard">Credit Card</option>
                      <option value="JazzCash">JazzCash</option>
                      <option value="CashOnDelivery">Cash on Delivery</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-teal-500 transition-colors" size={18} />
                  </div>
                  <button className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg">
                    Change Payment Type
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Outlet Info */}
          <div className="p-4 bg-teal-500/5 border border-teal-500/10 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white">
                <Utensils size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Downtown Outlet</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Kitchen ID: K-9921</p>
              </div>
            </div>
            <button className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase hover:underline">
              Switch Outlet
            </button>
          </div>

          {/* Activity Logs */}
          <div className="bg-white dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <History size={16} className="text-teal-500" />
                Order Activity Logs
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedOrder.activityLogs.length} Events</span>
            </div>
            <div className="p-6">
              <div className="relative space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                {selectedOrder.activityLogs.map((log) => (
                  <div key={log.id} className="relative pl-8 group">
                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-teal-500 group-hover:text-teal-500 transition-all z-10">
                      {log.icon || <Clock size={12} />}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{log.action}</p>
                        <p className="text-xs text-slate-500">Performed by <span className="font-medium text-slate-700 dark:text-slate-300">{log.user}</span></p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg self-start sm:self-center">
                        {log.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                showConfirmModal.type === 'Accept' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
              }`}>
                {showConfirmModal.type === 'Accept' ? <CheckCircle2 size={40} /> : <Ban size={40} />}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {showConfirmModal.type === 'Accept' ? 'Accept Order?' : 'Reject Order?'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Are you sure you want to {showConfirmModal.type?.toLowerCase()} order <span className="font-bold text-slate-900 dark:text-white">#{selectedOrder.id}</span>? 
                This action will notify the customer immediately.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmModal({ show: false, type: null })}
                  className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowConfirmModal({ show: false, type: null })}
                  className={`flex-1 py-3.5 text-white rounded-2xl font-bold transition-all shadow-lg ${
                    showConfirmModal.type === 'Accept' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                    : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                  }`}
                >
                  Confirm {showConfirmModal.type}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
