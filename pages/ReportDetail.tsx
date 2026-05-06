import React, { useMemo, useState } from 'react';
import { 
  AlertCircle,
  ArrowLeft, 
  Download, 
  LayoutGrid, 
  Loader2,
  Table as TableIcon, 
  Search, 
  Calendar,
  Printer,
  Settings2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectToken } from '../store/selectors/appSelectors';
import { fetchReportDetail, type ApiReportRow } from '../services/reportsApi';

type ReportRow = ApiReportRow;

interface ReportDetailProps {
  onBack: () => void;
}

type PivotField = string;
type PivotValue = string;

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatReportTitle = (slug: string) =>
  slug.replace(/^ReportsNewAdmin_/, '').replace(/([a-z])([A-Z])/g, '$1 $2');

const DATE_KEY_CANDIDATES = ['created', 'date', 'createddate', 'modifieddate'];
const CHANNEL_KEY_CANDIDATES = ['channel'];
const AMOUNT_KEY_CANDIDATES = ['amount', 'orderamount', 'total', 'value'];
const ORDER_KEY_CANDIDATES = ['orders', 'ordercount', 'quantity', 'count'];

const PREFERRED_COLUMN_ORDER = [
  'ID',
  'CustomerID',
  'CustomerName',
  'CustomerMobile',
  'City',
  'OutletID',
  'BranchName',
  'OrderAmount',
  'OrderType',
  'Channel',
  'PaymentType',
  'Status',
  'RejectionTitle',
  'Notes',
  'Created',
  'ModifiedDate',
  'VoucherValue1',
  'IsLoyaltyItemAdded',
  'UserArea',
  'GeoCode',
];

const isPlainRecord = (value: unknown): value is ReportRow =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/,/g, '').trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const formatColumnLabel = (key: string) =>
  key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');

const formatCellValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'string') return value;
  try {
    const json = JSON.stringify(value);
    return json === undefined ? String(value) : json;
  } catch {
    return String(value);
  }
};

const getDateValue = (value: unknown) => {
  if (typeof value !== 'string') return '';
  if (value.length >= 10 && value[4] === '-' && value[7] === '-') {
    return value.slice(0, 10);
  }
  return value;
};

const getColumnKeys = (rows: ReportRow[]) => {
  const keys = new Set<string>();
  rows.forEach((row) => {
    Object.keys(row).forEach((key) => keys.add(key));
  });
  return Array.from(keys);
};

const orderColumnKeys = (keys: string[]) => {
  const keySet = new Set(keys);
  const preferred = PREFERRED_COLUMN_ORDER.filter((key) => keySet.has(key));
  const remaining = keys.filter((key) => !preferred.includes(key)).sort();
  return [...preferred, ...remaining];
};

const findKeyByCandidates = (keys: string[], candidates: string[]) =>
  keys.find((key) => candidates.includes(key.toLowerCase()));

const getRowKey = (row: ReportRow, index: number) => {
  const idValue = row.ID ?? row.Id ?? row.id;
  return idValue ? `${String(idValue)}-${index}` : `row-${index}`;
};

export const ReportDetail: React.FC<ReportDetailProps> = ({ onBack }) => {
  const { slug } = useParams<{ slug: string }>();
  const token = useAppSelector(selectToken);
  const [viewType, setViewType] = useState<'table' | 'pivot'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('All');
  const today = new Date();
  const [startDate, setStartDate] = useState(formatLocalDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30)));
  const [endDate, setEndDate] = useState(formatLocalDate(today));
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page] = useState(1);
  const [pageSize] = useState(50);

  // Pivot Configuration
  const [pivotRows, setPivotRows] = useState<PivotField[]>([]);
  const [pivotCols, setPivotCols] = useState<PivotField[]>([]);
  const [pivotValue, setPivotValue] = useState<PivotValue>('count');

  React.useEffect(() => {
    if (!token) {
      setRows([]);
      setError('Sign in to load report data.');
      return;
    }

    if (!slug) {
      setRows([]);
      setError('Missing report identifier.');
      return;
    }

    let cancelled = false;

    const loadReport = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchReportDetail(token, slug, {
          startDate,
          endDate,
          page,
          pageSize,
        });

        if (!cancelled) {
          setRows(data.filter(isPlainRecord));
        }
      } catch (fetchError) {
        if (!cancelled) {
          setRows([]);
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load report data.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [token, slug, startDate, endDate, page, pageSize]);

  const columnKeys = useMemo(() => orderColumnKeys(getColumnKeys(rows)), [rows]);
  const dateKey = useMemo(() => findKeyByCandidates(columnKeys, DATE_KEY_CANDIDATES), [columnKeys]);
  const channelKey = useMemo(() => findKeyByCandidates(columnKeys, CHANNEL_KEY_CANDIDATES), [columnKeys]);

  const dimensionKeys = useMemo(() => (
    columnKeys.filter((key) => (
      rows.some((row) => {
        const value = row[key];
        return value !== null && value !== undefined && (
          typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
        );
      })
    ))
  ), [rows, columnKeys]);

  const numericKeys = useMemo(() => (
    columnKeys.filter((key) => rows.some((row) => toNumber(row[key]) !== null))
  ), [rows, columnKeys]);

  const pivotValueOptions = useMemo(() => ['count', ...numericKeys], [numericKeys]);
  const defaultRowKey = useMemo(
    () => findKeyByCandidates(dimensionKeys, DATE_KEY_CANDIDATES) ?? dimensionKeys[0],
    [dimensionKeys],
  );
  const defaultColKey = useMemo(
    () => findKeyByCandidates(dimensionKeys, CHANNEL_KEY_CANDIDATES)
      ?? dimensionKeys.find((key) => key !== defaultRowKey)
      ?? dimensionKeys[0],
    [dimensionKeys, defaultRowKey],
  );
  const defaultValueKey = useMemo(
    () => findKeyByCandidates(numericKeys, AMOUNT_KEY_CANDIDATES)
      ?? findKeyByCandidates(numericKeys, ORDER_KEY_CANDIDATES)
      ?? numericKeys[0]
      ?? 'count',
    [numericKeys],
  );

  React.useEffect(() => {
    if (!dimensionKeys.length) {
      setPivotRows([]);
      setPivotCols([]);
      return;
    }

    setPivotRows((prev) => {
      const next = prev.filter((key) => dimensionKeys.includes(key));
      return next.length ? next : defaultRowKey ? [defaultRowKey] : [];
    });
    setPivotCols((prev) => {
      const next = prev.filter((key) => dimensionKeys.includes(key));
      return next.length ? next : defaultColKey ? [defaultColKey] : [];
    });
  }, [dimensionKeys, defaultRowKey, defaultColKey]);

  React.useEffect(() => {
    if (!pivotValueOptions.includes(pivotValue)) {
      setPivotValue(pivotValueOptions.includes(defaultValueKey) ? defaultValueKey : pivotValueOptions[0]);
    }
  }, [pivotValueOptions, pivotValue, defaultValueKey]);

  React.useEffect(() => {
    setChannelFilter('All');
  }, [channelKey]);

  const channelOptions = useMemo(() => {
    if (!channelKey) return ['All'];
    const values = new Set<string>();
    rows.forEach((row) => {
      values.add(formatCellValue(row[channelKey]));
    });
    return ['All', ...Array.from(values).sort()];
  }, [rows, channelKey]);

  const filteredData = useMemo(() => {
    const searchValue = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch = !searchValue || columnKeys.some((key) =>
        formatCellValue(row[key]).toLowerCase().includes(searchValue),
      );
      const matchesChannel = !channelKey || channelFilter === 'All'
        || formatCellValue(row[channelKey]) === channelFilter;
      const dateValue = dateKey ? getDateValue(row[dateKey]) : '';
      const matchesDate = !dateKey || (dateValue && dateValue >= startDate && dateValue <= endDate);
      return matchesSearch && matchesChannel && matchesDate;
    });
  }, [rows, columnKeys, searchQuery, channelFilter, channelKey, dateKey, startDate, endDate]);

  const showChannelFilter = Boolean(channelKey);
  const isCurrencyPivot = pivotValue !== 'count'
    && AMOUNT_KEY_CANDIDATES.some((candidate) => pivotValue.toLowerCase().includes(candidate));
  const formatPivotMetric = (value: number) => {
    const displayValue = Number.isInteger(value) ? value.toString() : value.toFixed(2);
    return isCurrencyPivot ? `PKR ${displayValue}` : displayValue;
  };

  const pivotTable = useMemo(() => {
    if (viewType !== 'pivot' || !pivotRows.length || !pivotCols.length) return null;

    const rowKeys = Array.from(new Set(
      filteredData.map((row) => pivotRows.map((field) => formatCellValue(row[field])).join(' | ')),
    ));
    const colKeys = Array.from(new Set(
      filteredData.map((row) => pivotCols.map((field) => formatCellValue(row[field])).join(' | ')),
    ));

    const grid: Record<string, Record<string, number>> = {};

    filteredData.forEach((row) => {
      const rKey = pivotRows.map((field) => formatCellValue(row[field])).join(' | ');
      const cKey = pivotCols.map((field) => formatCellValue(row[field])).join(' | ');

      if (!grid[rKey]) grid[rKey] = {};
      if (!grid[rKey][cKey]) grid[rKey][cKey] = 0;

      const value = pivotValue === 'count' ? 1 : (toNumber(row[pivotValue]) ?? 0);
      grid[rKey][cKey] += value;
    });

    return { rowKeys, colKeys, grid };
  }, [filteredData, pivotRows, pivotCols, pivotValue, viewType]);

  const availableFields: PivotField[] = dimensionKeys;
  const availableValues: PivotValue[] = pivotValueOptions;

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
              {slug ? formatReportTitle(slug) : 'Report'} <span className="text-teal-500">Detail</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Detailed breakdown of report performance.
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

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-[24px] border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-5 py-4 text-rose-700 dark:text-rose-300">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

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
              placeholder="Search all fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Channel Filter */}
          {showChannelFilter && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {channelKey ? formatColumnLabel(channelKey) : 'Channel'}
              </span>
              <select 
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-teal-500"
              >
                {channelOptions.map((channel) => (
                  <option key={channel} value={channel}>{channel}</option>
                ))}
              </select>
            </div>
          )}

          {/* Clear Filters */}
          <div className="flex flex-col justify-end">
            <button 
              onClick={() => {
                setSearchQuery('');
                setChannelFilter('All');
                setStartDate(formatLocalDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30)));
                setEndDate(formatLocalDate(today));
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

        {isLoading && (
          <div className="flex items-center justify-center gap-3 rounded-[28px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-10 text-slate-500 dark:text-slate-400 shadow-sm mb-10">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-sm font-medium">Loading report data...</span>
          </div>
        )}

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
                            {formatColumnLabel(field)}
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
                        {availableFields.filter(f => !pivotRows.includes(f)).map(f => (
                          <option key={f} value={f}>{formatColumnLabel(f)}</option>
                        ))}
                      </select>
                    </div>

                    {/* Columns */}
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Columns</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {pivotCols.map(field => (
                          <div key={field} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {formatColumnLabel(field)}
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
                        {availableFields.filter(f => !pivotCols.includes(f)).map(f => (
                          <option key={f} value={f}>{formatColumnLabel(f)}</option>
                        ))}
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
                        {availableValues.map((value) => (
                          <option key={value} value={value}>
                            {value === 'count' ? 'Count' : formatColumnLabel(value)}
                          </option>
                        ))}
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
                  {!pivotTable && (
                    <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      Select pivot fields to view data.
                    </div>
                  )}
                  {pivotTable && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-100 dark:border-slate-800 text-left">
                              <div className="flex flex-col gap-1">
                                <span className="text-teal-500">Rows:</span>
                                <span>{pivotRows.map(formatColumnLabel).join(' → ')}</span>
                              </div>
                            </th>
                            {pivotTable.colKeys.map(col => (
                              <th key={col} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                                {col}
                              </th>
                            ))}
                            <th className="px-6 py-5 text-[10px] font-black text-teal-500 uppercase tracking-widest text-right bg-teal-500/5 min-w-[120px]">
                              Total ({pivotValue === 'count' ? 'Count' : formatColumnLabel(pivotValue)})
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {pivotTable.rowKeys.map(row => {
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
                                      {formatPivotMetric(val)}
                                    </td>
                                  );
                                })}
                                <td className="px-6 py-4 text-right text-sm font-black text-teal-500 bg-teal-500/5">
                                  {formatPivotMetric(rowTotal)}
                                </td>
                              </tr>
                            );
                          })}
                          {/* Grand Total Row */}
                          <tr className="bg-slate-50 dark:bg-slate-950/50 font-black">
                            <td className="px-6 py-5 text-[10px] uppercase tracking-widest text-slate-900 dark:text-white border-r border-slate-100 dark:border-slate-800">
                              Grand Total
                            </td>
                            {pivotTable.colKeys.map(col => {
                              let colTotal = 0;
                              pivotTable.rowKeys.forEach(row => {
                                colTotal += pivotTable.grid[row]?.[col] || 0;
                              });
                              return (
                                <td key={col} className="px-6 py-5 text-center text-sm text-slate-900 dark:text-white">
                                  {formatPivotMetric(colTotal)}
                                </td>
                              );
                            })}
                            <td className="px-6 py-5 text-right text-sm text-teal-500 bg-teal-500/10">
                              {formatPivotMetric(
                                pivotTable.rowKeys.reduce(
                                  (acc, row) => acc + Object.values(pivotTable.grid[row] || {}).reduce((a, b) => a + b, 0),
                                  0,
                                ),
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
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
                      {columnKeys.map((key) => (
                        <th key={key} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {formatColumnLabel(key)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredData.map((row, index) => (
                      <tr key={getRowKey(row, index)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                        {columnKeys.map((key) => (
                          <td key={key} className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            {formatCellValue(row[key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredData.length === 0 && !isLoading && !error && (
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
