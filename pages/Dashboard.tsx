import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Activity,
  Calendar,
  Download,
  Clock,
  MapPin,
  Utensils,
  Star,
  Truck,
  AlertCircle,
  ChevronDown,
  Check
} from 'lucide-react';
import { 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Bar,
  PieChart,
  Pie,
  Cell,
  Line,
  ComposedChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  RadialBarChart,
  RadialBar,
  LineChart,
  BarChart,
  AreaChart
} from 'recharts';
import { MetricCardProps } from '../types';

// --- Mock Data for Pizza Chain ---

const hourlySalesData = [
  { time: '10am', sales: 1200, orders: 45, delivery: 30 },
  { time: '12pm', sales: 4500, orders: 180, delivery: 120 },
  { time: '2pm', sales: 3200, orders: 110, delivery: 80 },
  { time: '4pm', sales: 2800, orders: 95, delivery: 70 },
  { time: '6pm', sales: 8500, orders: 320, delivery: 240 },
  { time: '8pm', sales: 12000, orders: 450, delivery: 380 },
  { time: '10pm', sales: 6500, orders: 210, delivery: 150 },
  { time: '12am', sales: 2100, orders: 75, delivery: 60 },
];

const branchPerformance = [
  { name: 'Downtown', sales: 45000, growth: 12.5, status: 'Busy', rating: 4.8 },
  { name: 'Westside', sales: 38000, growth: 8.2, status: 'Normal', rating: 4.5 },
  { name: 'East End', sales: 32000, growth: -2.4, status: 'Slow', rating: 4.2 },
  { name: 'North Park', sales: 51000, growth: 15.8, status: 'Peak', rating: 4.9 },
  { name: 'South Bay', sales: 29000, growth: 4.1, status: 'Normal', rating: 4.6 },
];

const topProducts = [
  { name: 'Pepperoni Feast', value: 450, color: '#14b8a6' },
  { name: 'BBQ Chicken', value: 320, color: '#0d9488' },
  { name: 'Veggie Supreme', value: 280, color: '#0f766e' },
  { name: 'Margherita', value: 210, color: '#052e2b' },
  { name: 'Meat Lovers', value: 190, color: '#021816' },
];

const orderSources = [
  { name: 'Mobile App', value: 55, fill: '#14b8a6' },
  { name: 'Website', value: 25, fill: '#0d9488' },
  { name: 'Aggregators', value: 15, fill: '#0f766e' },
  { name: 'Walk-in', value: 5, fill: '#052e2b' },
];

const paymentMethods = [
  { name: 'Credit Card', value: 65, fill: '#14b8a6' },
  { name: 'Apple Pay', value: 20, fill: '#0d9488' },
  { name: 'Cash', value: 10, fill: '#0f766e' },
  { name: 'Crypto', value: 5, fill: '#052e2b' },
];

const branchComparison = [
  { subject: 'Sales', A: 120, B: 110, fullMark: 150 },
  { subject: 'Speed', A: 98, B: 130, fullMark: 150 },
  { subject: 'Rating', A: 86, B: 130, fullMark: 150 },
  { subject: 'Staff', A: 99, B: 100, fullMark: 150 },
  { subject: 'Waste', A: 85, B: 90, fullMark: 150 },
  { subject: 'Growth', A: 65, B: 85, fullMark: 150 },
];

const inventoryStatus = [
  { name: 'Dough', stock: 85, color: '#14b8a6' },
  { name: 'Cheese', stock: 42, color: '#f59e0b' },
  { name: 'Tomato Sauce', stock: 92, color: '#14b8a6' },
  { name: 'Pepperoni', stock: 15, color: '#ef4444' },
  { name: 'Chicken', stock: 60, color: '#14b8a6' },
];

const prepTimeTrend = [
  { day: 'Mon', avgTime: 18, target: 20 },
  { day: 'Tue', avgTime: 22, target: 20 },
  { day: 'Wed', avgTime: 20, target: 20 },
  { day: 'Thu', avgTime: 25, target: 20 },
  { day: 'Fri', avgTime: 32, target: 20 },
  { day: 'Sat', avgTime: 35, target: 20 },
  { day: 'Sun', avgTime: 28, target: 20 },
];

const customerLoyaltyData = [
  { month: 'Sep', new: 450, repeat: 820 },
  { month: 'Oct', new: 520, repeat: 940 },
  { month: 'Nov', new: 480, repeat: 1100 },
  { month: 'Dec', new: 700, repeat: 1450 },
  { month: 'Jan', new: 550, repeat: 1200 },
  { month: 'Feb', new: 600, repeat: 1350 },
];

const trafficData = [
  { time: '8am', visitors: 120 },
  { time: '10am', visitors: 450 },
  { time: '12pm', visitors: 1200 },
  { time: '2pm', visitors: 850 },
  { time: '4pm', visitors: 720 },
  { time: '6pm', visitors: 1800 },
  { time: '8pm', visitors: 2400 },
  { time: '10pm', visitors: 1100 },
];

const orderStatusData = [
  { name: 'Delivered', value: 82, fill: '#14b8a6' },
  { name: 'In Transit', value: 12, fill: '#0d9488' },
  { name: 'Cancelled', value: 4, fill: '#ef4444' },
  { name: 'Refunded', value: 2, fill: '#94a3b8' },
];

const aovData = [
  { day: 'Mon', aov: 22 },
  { day: 'Tue', aov: 24 },
  { day: 'Wed', aov: 23 },
  { day: 'Thu', aov: 26 },
  { day: 'Fri', aov: 32 },
  { day: 'Sat', aov: 38 },
  { day: 'Sun', aov: 35 },
];

const liveOrders = [
  { id: '#PIZ-9921', branch: 'Downtown', items: '2x Large Pepperoni', total: 'RS 42.50', time: '4 mins ago', status: 'Baking' },
  { id: '#PIZ-9920', branch: 'North Park', items: '1x BBQ Chicken, 1x Coke', total: 'RS 28.90', time: '7 mins ago', status: 'Prep' },
  { id: '#PIZ-9919', branch: 'Westside', items: '3x Margherita', total: 'RS 54.00', time: '12 mins ago', status: 'Out for Delivery' },
  { id: '#PIZ-9918', branch: 'Downtown', items: '1x Veggie Supreme', total: 'RS 19.50', time: '15 mins ago', status: 'Delivered' },
];

const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, trendUp, icon }) => (
  <div className="glass-card p-4 rounded-xl relative overflow-hidden group border border-slate-200 dark:border-slate-800">
    <div className="absolute -right-10 -top-10 w-24 h-24 bg-teal-500/5 rounded-full blur-[30px] group-hover:bg-teal-500/15 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
    
    <div className="flex justify-between items-start mb-2 relative z-10">
      <div className="p-2 bg-teal-50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-500/20 rounded-lg text-teal-600 dark:text-teal-400">
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
            trendUp 
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-500/30 text-red-600 dark:text-red-400'
          }`}>
          {trendUp ? <ArrowUpRight size={10} className="mr-0.5" /> : <ArrowDownRight size={10} className="mr-0.5" />}
          {trend}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 text-[10px] font-bold mb-0.5 tracking-wider uppercase">{title}</h3>
    <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
  </div>
);

export const Dashboard: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [dateFilter, setDateFilter] = useState('Today');
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  const dateOptions = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Custom Range'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
        setIsDateFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="p-3 md:p-6 space-y-4 animate-fade-in pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen font-sans">
      
      {/* --- Header / Global Filters --- */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-600 rounded-xl text-white shadow-lg shadow-teal-600/20">
            <Utensils size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Cloubuzz Pizza Chain</h1>
            <p className="text-[10px] text-slate-500 font-bold mt-1.5 uppercase tracking-[0.2em]">Enterprise Analytics</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <MapPin size={14} className="text-teal-500" />
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-0 outline-none"
            >
              <option>All Branches</option>
              <option>Downtown</option>
              <option>Westside</option>
              <option>North Park</option>
            </select>
          </div>
          <div className="relative" ref={dateFilterRef}>
            <button 
              onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <Calendar size={14} className="text-teal-500" />
              <span>{dateFilter}</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isDateFilterOpen ? 'rotate-180' : ''}`} />
              {dateFilter === 'Today' && (
                <span className="ml-1 px-1.5 py-0.5 bg-teal-500/10 text-teal-500 rounded text-[9px]">Live</span>
              )}
            </button>

            {isDateFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-1.5">
                  {dateOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setDateFilter(option);
                        setIsDateFilterOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                        dateFilter === option 
                          ? 'bg-teal-500 text-white' 
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {option}
                      {dateFilter === option && <Check size={12} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* --- KPI Row --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard title="Sales" value="RS 42.8k" trend="+14%" trendUp={true} icon={<DollarSign size={16} />} />
        <MetricCard title="Orders" value="1,842" trend="+5%" trendUp={true} icon={<ShoppingBag size={16} />} />
        <MetricCard title="Prep Time" value="24m" trend="-2m" trendUp={true} icon={<Clock size={16} />} />
        <MetricCard title="Rating" value="4.7" trend="+0.2" trendUp={true} icon={<Star size={16} />} />
        <MetricCard title="Delivery" value="68%" trend="+3%" trendUp={true} icon={<Truck size={16} />} />
        <MetricCard title="Waste" value="2.4%" trend="-0.5%" trendUp={true} icon={<AlertCircle size={16} />} />
      </div>

      {/* --- Main Data Grid (PowerBI Style) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Hourly Trend (Large) */}
        <div className="lg:col-span-8 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-teal-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Hourly Performance</h2>
              </div>
              <p className="text-[10px] text-slate-500">Revenue vs Orders vs Delivery Volume</p>
            </div>
            <div className="flex gap-3">
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Sales</span></div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Delivery</span></div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={hourlySalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="sales" fill="#14b8a6" fillOpacity={0.05} stroke="#14b8a6" strokeWidth={2} />
                <Bar dataKey="orders" fill="#94a3b8" fillOpacity={0.2} radius={[2, 2, 0, 0]} barSize={15} />
                <Line type="monotone" dataKey="delivery" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products (Sidebar) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Top Selling Pizzas</h2>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-600 dark:text-slate-400">{p.name}</span>
                  <span className="text-slate-900 dark:text-white">{p.value}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(p.value/450)*100}%`, backgroundColor: p.color }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Inventory Alerts</h3>
            <div className="space-y-3">
              {inventoryStatus.filter(i => i.stock < 50).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${item.stock < 20 ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${item.stock < 20 ? 'text-rose-500' : 'text-amber-500'}`}>{item.stock}% Left</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Branch Comparison (Radar) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Branch Benchmarking</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={branchComparison}>
                <PolarGrid stroke="#94a3b8" strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 10}} />
                <Radar name="Downtown" dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.3} />
                <Radar name="North Park" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.1} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-[9px] font-bold text-slate-500 uppercase">Downtown</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div><span className="text-[9px] font-bold text-slate-500 uppercase">North Park</span></div>
          </div>
        </div>

        {/* Order Sources (Donut) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Order Channels</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderSources} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {orderSources.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-2 mt-4">
            {orderSources.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.fill}}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{s.name}</span>
                <span className="text-[10px] font-bold text-slate-900 dark:text-white ml-auto">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods (Radial) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Payment Split</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" barSize={10} data={paymentMethods}>
                <RadialBar background dataKey="value" />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-2 mt-4">
            {paymentMethods.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.fill}}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{s.name}</span>
                <span className="text-[10px] font-bold text-slate-900 dark:text-white ml-auto">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prep Time Trend (Line) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Prep Time Trend</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prepTimeTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip />
                <Line type="monotone" dataKey="avgTime" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4, fill: '#14b8a6' }} />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-[9px] font-bold text-slate-500 uppercase">Actual</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 border-t-2 border-dashed border-slate-400"></div><span className="text-[9px] font-bold text-slate-500 uppercase">Target</span></div>
          </div>
        </div>

        {/* --- New Insights Row --- */}
        
        {/* Repeat vs New Customers (Stacked Bar) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Customer Loyalty</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerLoyaltyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="repeat" stackId="a" fill="#14b8a6" radius={[0, 0, 0, 0]} barSize={20} />
                <Bar dataKey="new" stackId="a" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-[9px] font-bold text-slate-500 uppercase">Repeat</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div><span className="text-[9px] font-bold text-slate-500 uppercase">New</span></div>
          </div>
        </div>

        {/* Traffic Analytics (Area) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Store Traffic</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trafficData}>
                <defs>
                  <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="visitors" stroke="#14b8a6" fillOpacity={1} fill="url(#colorTraffic)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-between items-center px-2">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">Peak Traffic</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">8:00 PM</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase">Avg. Session</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white">4.2 min</p>
            </div>
          </div>
        </div>

        {/* Order Status (Pie) */}
        <div className="lg:col-span-4 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Order Fulfillment</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStatusData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {orderStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-y-2 mt-4">
            {orderStatusData.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: s.fill}}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{s.name}</span>
                <span className="text-[10px] font-bold text-slate-900 dark:text-white ml-auto">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* AOV Trend (Bar) */}
        <div className="lg:col-span-8 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Average Order Value (AOV)</h2>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aovData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.1} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="aov" fill="#14b8a6" radius={[4, 4, 0, 0]} barSize={40}>
                  {aovData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.aov > 30 ? '#14b8a6' : '#94a3b8'} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[10px] text-slate-500 italic">Weekend surge typically increases AOV by 40%</p>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-teal-500"></div><span className="text-[9px] font-bold text-slate-400 uppercase">High</span></div>
               <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-400"></div><span className="text-[9px] font-bold text-slate-400 uppercase">Normal</span></div>
            </div>
          </div>
        </div>

        {/* Branch Performance Table (Full Width) */}
        <div className="lg:col-span-12 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Branch Performance Matrix</h2>
            <div className="flex gap-2">
              <button className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500">Weekly</button>
              <button className="px-2 py-1 bg-teal-600 rounded text-[10px] font-bold text-white">Monthly</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3">Branch</th>
                  <th className="pb-3">Revenue</th>
                  <th className="pb-3">Growth</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                {branchPerformance.map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 text-xs font-bold text-slate-800 dark:text-slate-200">{b.name}</td>
                    <td className="py-3 text-xs font-medium text-slate-600 dark:text-slate-400">RS {b.sales.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold flex items-center gap-0.5 ${b.growth > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {b.growth > 0 ? <ArrowUpRight size={10}/> : <ArrowDownRight size={10}/>}
                        {Math.abs(b.growth)}%
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{b.rating}</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        b.status === 'Peak' ? 'bg-rose-50 text-rose-600' :
                        b.status === 'Busy' ? 'bg-amber-50 text-amber-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors">
                        <MoreHorizontal size={14} className="text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Kitchen Monitor (Full Width) */}
        <div className="lg:col-span-12 glass-card rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-rose-500 animate-pulse" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live Kitchen Monitor</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">4 Active Orders</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {liveOrders.map((order, idx) => (
              <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] font-bold text-teal-600 dark:text-teal-400 uppercase">{order.id}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                    order.status === 'Baking' ? 'bg-orange-100 text-orange-600' :
                    order.status === 'Prep' ? 'bg-blue-100 text-blue-600' :
                    order.status === 'Out for Delivery' ? 'bg-purple-100 text-purple-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">{order.branch}</h4>
                <p className="text-[10px] text-slate-500 mb-2 line-clamp-1 italic">"{order.items}"</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{order.total}</span>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1"><Clock size={10} /> {order.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
};
