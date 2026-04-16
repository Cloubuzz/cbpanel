import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, 
  Download, 
  LayoutGrid, 
  Table as TableIcon, 
  Search, 
  Calendar,
  Printer,
  Settings2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SalesRecord {
  id: number;
  date: string;
  category: string;
  item: string;
  quantity: number;
  revenue: number;
  payment: string;
}

const SALES_DATA: SalesRecord[] = [
  { id: 1, date: '2026-03-20', category: 'Main Course', item: 'Beef Burger', quantity: 12, revenue: 180, payment: 'Card' },
  { id: 2, date: '2026-03-20', category: 'Drinks', item: 'Fresh Orange Juice', quantity: 25, revenue: 125, payment: 'Cash' },
  { id: 3, date: '2026-03-21', category: 'Main Course', item: 'Chicken Pasta', quantity: 8, revenue: 120, payment: 'Card' },
  { id: 4, date: '2026-03-21', category: 'Desserts', item: 'Chocolate Lava Cake', quantity: 15, revenue: 105, payment: 'Online' },
  { id: 5, date: '2026-03-22', category: 'Main Course', item: 'Beef Burger', quantity: 20, revenue: 300, payment: 'Card' },
  { id: 6, date: '2026-03-22', category: 'Appetizers', item: 'Garlic Bread', quantity: 10, revenue: 50, payment: 'Cash' },
  { id: 7, date: '2026-03-23', category: 'Drinks', item: 'Iced Coffee', quantity: 30, revenue: 150, payment: 'Online' },
  { id: 8, date: '2026-03-23', category: 'Main Course', item: 'Veggie Pizza', quantity: 14, revenue: 210, payment: 'Card' },
  { id: 9, date: '2026-03-24', category: 'Desserts', item: 'Fruit Salad', quantity: 12, revenue: 72, payment: 'Cash' },
  { id: 10, date: '2026-03-24', category: 'Appetizers', item: 'Chicken Wings', quantity: 18, revenue: 144, payment: 'Card' },
  { id: 11, date: '2026-03-25', category: 'Main Course', item: 'Steak', quantity: 10, revenue: 350, payment: 'Card' },
  { id: 12, date: '2026-03-25', category: 'Drinks', item: 'Lemonade', quantity: 22, revenue: 88, payment: 'Online' },
  { id: 13, date: '2026-03-20', category: 'Main Course', item: 'Chicken Pasta', quantity: 5, revenue: 75, payment: 'Cash' },
  { id: 14, date: '2026-03-21', category: 'Drinks', item: 'Iced Coffee', quantity: 10, revenue: 50, payment: 'Card' },
  { id: 15, date: '2026-03-22', category: 'Desserts', item: 'Fruit Salad', quantity: 8, revenue: 48, payment: 'Online' },
  { id: 16, date: '2026-03-23', category: 'Appetizers', item: 'Garlic Bread', quantity: 15, revenue: 75, payment: 'Card' },
  { id: 17, date: '2026-03-24', category: 'Main Course', item: 'Veggie Pizza', quantity: 6, revenue: 90, payment: 'Online' },
  { id: 18, date: '2026-03-25', category: 'Drinks', item: 'Fresh Orange Juice', quantity: 12, revenue: 60, payment: 'Card' },
];

interface ReportDetailProps {
  onBack: () => void;
}

type PivotField = 'category' | 'date' | 'payment' | 'item';
type PivotValue = 'revenue' | 'quantity' | 'count';

export const ReportDetail: React.FC<ReportDetailProps> = ({ onBack }) => {
  const [viewType, setViewType] = useState<'table' | 'pivot'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [startDate, setStartDate] = useState('2026-03-20');
  const [endDate, setEndDate] = useState('2026-03-25');

  // Pivot Configuration
  const [pivotRows, setPivotRows] = useState<PivotField[]>(['category']);
  const [pivotCols, setPivotCols] = useState<PivotField[]>(['payment']);
  const [pivotValue, setPivotValue] = useState<PivotValue>('revenue');

  const categories = ['All', ...Array.from(new Set(SALES_DATA.map(d => d.category)))];
  const paymentMethods = ['All', ...Array.from(new Set(SALES_DATA.map(d => d.payment)))];

  const filteredData = useMemo(() => {
    return SALES_DATA.filter(item => {
      const matchesSearch = item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesPayment = paymentFilter === 'All' || item.payment === paymentFilter;
      const matchesDate = item.date >= startDate && item.date <= endDate;
      return matchesSearch && matchesCategory && matchesPayment && matchesDate;
    });
  }, [searchQuery, categoryFilter, paymentFilter, startDate, endDate]);

  const pivotTable = useMemo(() => {
    if (viewType !== 'pivot') return null;

    const rowKeys = Array.from(new Set(filteredData.map(d => pivotRows.map(f => d[f]).join(' | '))));
    const colKeys = Array.from(new Set(filteredData.map(d => pivotCols.map(f => d[f]).join(' | '))));

    const grid: Record<string, Record<string, number>> = {};

    filteredData.forEach(d => {
      const rKey = pivotRows.map(f => d[f]).join(' | ');
      const cKey = pivotCols.map(f => d[f]).join(' | ');

      if (!grid[rKey]) grid[rKey] = {};
      if (!grid[rKey][cKey]) grid[rKey][cKey] = 0;

      if (pivotValue === 'revenue') grid[rKey][cKey] += d.revenue;
      else if (pivotValue === 'quantity') grid[rKey][cKey] += d.quantity;
      else grid[rKey][cKey] += 1;
    });

    return { rowKeys, colKeys, grid };
  }, [filteredData, pivotRows, pivotCols, pivotValue, viewType]);

  const availableFields: PivotField[] = ['category', 'date', 'payment', 'item'];
  const availableValues: PivotValue[] = ['revenue', 'quantity', 'count'];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-teal-500 hover:border-teal-500/50 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Sales <span className="text-teal-500">Summary</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Detailed breakdown of revenue and item performance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download size={18} />
            Export CSV
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-2xl text-sm font-bold hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20">
            <Printer size={18} />
            Print Report
          </button>
        </div>
      </div>

      {/* Top Filters */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] p-6 mb-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Date Range */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar size={12} /> Date Range
            </span>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-teal-500 w-full"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-teal-500 w-full"
              />
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Search size={12} /> Search
            </span>
            <input 
              type="text"
              placeholder="Items or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</span>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-teal-500"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Payment Filter */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</span>
            <select 
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-teal-500"
            >
              {paymentMethods.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex flex-col justify-end">
            <button 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setPaymentFilter('All');
                setStartDate('2026-03-20');
                setEndDate('2026-03-25');
              }}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <X size={14} />
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
           <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setViewType('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewType === 'table' ? 'bg-white dark:bg-slate-900 text-teal-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <TableIcon size={16} />
                Tabular Data
              </button>
              <button 
                onClick={() => setViewType('pivot')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewType === 'pivot' ? 'bg-white dark:bg-slate-900 text-teal-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={16} />
                Pivot Table
              </button>
            </div>
            
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Showing {filteredData.length} records
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative min-h-[600px]">
        <AnimatePresence mode="wait">
          {viewType === 'pivot' ? (
            <motion.div 
              key="pivot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col lg:flex-row gap-8"
            >
              {/* Pivot Controls - Side Panel */}
              <div className="lg:w-72 flex-shrink-0">
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] p-6 sticky top-8 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <Settings2 size={18} className="text-teal-500" />
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Pivot Settings</h2>
                  </div>

                  <div className="space-y-8">
                    {/* Rows */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Rows</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pivotRows.map(field => (
                          <div key={field} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/10 text-teal-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {field}
                            <button onClick={() => setPivotRows(pivotRows.filter(f => f !== field))}><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                      <select 
                        onChange={(e) => {
                          const val = e.target.value as PivotField;
                          if (val && !pivotRows.includes(val)) setPivotRows([...pivotRows, val]);
                          e.target.value = "";
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none"
                      >
                        <option value="">+ Add Row Field</option>
                        {availableFields.filter(f => !pivotRows.includes(f)).map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    {/* Columns */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Columns</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pivotCols.map(field => (
                          <div key={field} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {field}
                            <button onClick={() => setPivotCols(pivotCols.filter(f => f !== field))}><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                      <select 
                        onChange={(e) => {
                          const val = e.target.value as PivotField;
                          if (val && !pivotCols.includes(val)) setPivotCols([...pivotCols, val]);
                          e.target.value = "";
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 outline-none"
                      >
                        <option value="">+ Add Column Field</option>
                        {availableFields.filter(f => !pivotCols.includes(f)).map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>

                    {/* Values */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Values (Sum)</label>
                      <select 
                        value={pivotValue}
                        onChange={(e) => setPivotValue(e.target.value as PivotValue)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-teal-500 outline-none"
                      >
                        {availableValues.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pivot Table Display */}
              <div className="flex-1 min-w-0">
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LayoutGrid size={18} className="text-teal-500" />
                      <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Pivot Analysis</h2>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 text-left">
                            <div className="flex flex-col gap-1">
                              <span className="text-teal-500">Rows:</span>
                              <span>{pivotRows.join(' → ')}</span>
                            </div>
                          </th>
                          {pivotTable?.colKeys.map(col => (
                            <th key={col} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                              {col}
                            </th>
                          ))}
                          <th className="px-6 py-5 text-[10px] font-black text-teal-500 uppercase tracking-widest text-right bg-teal-500/5 min-w-[120px]">
                            Total ({pivotValue})
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {pivotTable?.rowKeys.map(row => {
                          let rowTotal = 0;
                          return (
                            <tr key={row} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                              <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                                {row}
                              </td>
                              {pivotTable.colKeys.map(col => {
                                const val = pivotTable.grid[row]?.[col] || 0;
                                rowTotal += val;
                                return (
                                  <td key={col} className="px-6 py-4 text-center text-sm font-bold text-slate-600 dark:text-slate-300">
                                    {pivotValue === 'revenue' ? `$${val.toFixed(2)}` : val}
                                  </td>
                                );
                              })}
                              <td className="px-6 py-4 text-right text-sm font-black text-teal-500 bg-teal-500/5">
                                {pivotValue === 'revenue' ? `$${rowTotal.toFixed(2)}` : rowTotal}
                              </td>
                            </tr>
                          );
                        })}
                        {/* Grand Total Row */}
                        <tr className="bg-slate-50 dark:bg-slate-950/50 font-black">
                          <td className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                            Grand Total
                          </td>
                          {pivotTable?.colKeys.map(col => {
                            let colTotal = 0;
                            pivotTable.rowKeys.forEach(row => {
                              colTotal += pivotTable.grid[row]?.[col] || 0;
                            });
                            return (
                              <td key={col} className="px-6 py-5 text-center text-sm text-slate-900 dark:text-white">
                                {pivotValue === 'revenue' ? `$${colTotal.toFixed(2)}` : colTotal}
                              </td>
                            );
                          })}
                          <td className="px-6 py-5 text-right text-sm text-teal-500 bg-teal-500/10">
                            {pivotValue === 'revenue' 
                              ? `$${pivotTable?.rowKeys.reduce((acc, row) => acc + Object.values(pivotTable.grid[row] || {}).reduce((a, b) => a + b, 0), 0).toFixed(2)}`
                              : pivotTable?.rowKeys.reduce((acc, row) => acc + Object.values(pivotTable.grid[row] || {}).reduce((a, b) => a + b, 0), 0)
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="table"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TableIcon size={18} className="text-teal-500" />
                  <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Tabular Data</h2>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Revenue</th>
                      <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredData.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
                            <Calendar size={14} className="text-slate-400" />
                            {row.date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-teal-500/10 text-teal-500">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{row.item}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-sm font-black text-slate-700 dark:text-slate-300">{row.quantity}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="text-sm font-black text-teal-500">${row.revenue.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">{row.payment}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredData.length === 0 && (
                <div className="p-20 text-center">
                  <p className="text-slate-500 font-bold">No data matches your filters.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
