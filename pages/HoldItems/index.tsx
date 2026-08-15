import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  Save, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  ChevronRight,
  History,
  User
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';
import { fetchOutletList, type OutletListItem } from '../../services/outletsApi';
import { fetchMenuItems, type ApiMenuItem } from '../../services/menuItemsApi';
import { 
  fetchHoldItems, 
  saveHoldItem, 
  saveHoldItemBulk, 
  fetchHoldItemLogs,
  type HoldItem,
  type HoldItemLog 
} from '../../services/holdItemsApi';

// Generates time slots for dropdown (e.g. 12:00 AM, 12:30 AM, etc. or hour intervals)
const TIME_SLOTS = [
  '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM',
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:05 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM',
  '00:00', '03:00'
];

export const HoldItems: React.FC = () => {
  const token = useAppSelector(selectToken);

  // Sub-navigation active state
  const [activeSubTab, setActiveSubTab] = useState<'hold-items' | 'hold-items-logs' | null>(null);

  // ==========================================
  // STATE FOR HOLD ITEMS SUB-TAB
  // ==========================================
  const [outlets, setOutlets] = useState<OutletListItem[]>([]);
  const [products, setProducts] = useState<ApiMenuItem[]>([]);
  const [holdList, setHoldList] = useState<HoldItem[]>([]);
  
  const [activeFormTab, setActiveFormTab] = useState<'create' | 'list'>('create');
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isListLoading, setIsListLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [holdMessage, setHoldMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Single Hold Form State
  const [holdId, setHoldId] = useState<number | null>(null);
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('12:00 AM');
  const [endTime, setEndTime] = useState<string>('12:00 AM');

  // Bulk Hold Form State
  const [bulkItemId, setBulkItemId] = useState<string>('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // Hold Items Pagination states
  const [holdCurrentPage, setHoldCurrentPage] = useState(1);
  const [holdPageSize, setHoldPageSize] = useState(10);
  const [holdTotalCount, setHoldTotalCount] = useState(0);

  // Hold Items Search filter
  const [holdSearchTerm, setHoldSearchTerm] = useState('');
  const [holdDebouncedSearch, setHoldDebouncedSearch] = useState('');

  // ==========================================
  // STATE FOR HOLD ITEMS LOGS SUB-TAB
  // ==========================================
  const [logsList, setLogsList] = useState<HoldItemLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [logsMessage, setLogsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Logs Pagination states
  const [logsCurrentPage, setLogsCurrentPage] = useState(1);
  const [logsPageSize, setLogsPageSize] = useState(10);
  const [logsTotalCount, setLogsTotalCount] = useState(0);

  // Logs Search filter
  const [logsSearchTerm, setLogsSearchTerm] = useState('');
  const [logsDebouncedSearch, setLogsDebouncedSearch] = useState('');

  // ==========================================
  // EFFECT DEBOUNCERS
  // ==========================================
  useEffect(() => {
    const handler = setTimeout(() => {
      setHoldDebouncedSearch(holdSearchTerm);
      setHoldCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [holdSearchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setLogsDebouncedSearch(logsSearchTerm);
      setLogsCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [logsSearchTerm]);

  // ==========================================
  // API DATA FETCHERS
  // ==========================================
  
  // Fetch Hold Items
  const fetchHoldListData = async (p = holdCurrentPage, ps = holdPageSize, s = holdDebouncedSearch) => {
    if (!token) return;
    setIsListLoading(true);
    try {
      const response = await fetchHoldItems(token, p, ps, s);
      setHoldList(response.data || []);
      setHoldTotalCount(response.totalCount || 0);
    } catch (err) {
      console.error('Failed to load hold items:', err);
    } finally {
      setIsListLoading(false);
    }
  };

  // Fetch Outlets & Products (Options)
  const loadHoldOptionsData = async () => {
    if (!token) return;
    setIsLoadingOptions(true);
    try {
      const [outletsData, menuItemsData] = await Promise.all([
        fetchOutletList(token),
        fetchMenuItems(token, { page: 1, pageSize: 500, includeSizes: false })
      ]);
      setOutlets(outletsData || []);
      setProducts(menuItemsData || []);
      setHoldMessage(null);
    } catch (err) {
      setHoldMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to load options.'
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  // Fetch Logs
  const fetchLogsData = async (p = logsCurrentPage, ps = logsPageSize, s = logsDebouncedSearch) => {
    if (!token) return;
    setIsLogsLoading(true);
    try {
      const response = await fetchHoldItemLogs(token, p, ps, s);
      setLogsList(response.data || []);
      setLogsTotalCount(response.totalCount || 0);
      setLogsMessage(null);
    } catch (err) {
      console.error('Failed to load hold logs:', err);
      setLogsMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to fetch logs.'
      });
    } finally {
      setIsLogsLoading(false);
    }
  };

  // Trigger Hold Items load on change of pag/search if active
  useEffect(() => {
    if (token && activeSubTab === 'hold-items') {
      fetchHoldListData(holdCurrentPage, holdPageSize, holdDebouncedSearch);
    }
  }, [token, activeSubTab, holdCurrentPage, holdPageSize, holdDebouncedSearch]);

  // Trigger Hold Logs load on change of pag/search if active
  useEffect(() => {
    if (token && activeSubTab === 'hold-items-logs') {
      fetchLogsData(logsCurrentPage, logsPageSize, logsDebouncedSearch);
    }
  }, [token, activeSubTab, logsCurrentPage, logsPageSize, logsDebouncedSearch]);

  // ==========================================
  // CLICK INITIATORS (CRITICAL: API only called unless clicked)
  // ==========================================
  const handleSubTabChange = (tab: 'hold-items' | 'hold-items-logs') => {
    setActiveSubTab(tab);
    if (tab === 'hold-items') {
      // Trigger API fetch for Hold items and options
      loadHoldOptionsData();
      fetchHoldListData(1, holdPageSize, '');
      setHoldCurrentPage(1);
      setHoldSearchTerm('');
    } else if (tab === 'hold-items-logs') {
      // Trigger API fetch for Logs
      fetchLogsData(1, logsPageSize, '');
      setLogsCurrentPage(1);
      setLogsSearchTerm('');
    }
  };

  // ==========================================
  // FORM MUTATIONS
  // ==========================================
  const showHoldMsg = (type: 'success' | 'error', text: string) => {
    setHoldMessage({ type, text });
    setTimeout(() => setHoldMessage(null), 5000);
  };

  const handleSingleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!selectedOutletId || !selectedItemId || !selectedAction) {
      showHoldMsg('error', 'Please Select All Fields (Branch, Item, and Action)');
      return;
    }

    const outlet = outlets.find(o => String(o.id) === selectedOutletId);
    const item = products.find(p => String(p.ID) === selectedItemId);

    if (!outlet || !item) {
      showHoldMsg('error', 'Selected branch or item is invalid.');
      return;
    }

    setIsSaving(true);
    try {
      await saveHoldItem(token, {
        HoldID: holdId,
        OutletID: outlet.id,
        OutletName: outlet.name,
        ItemID: item.ID,
        ItemName: item.Name,
        Action: selectedAction,
        StartTime: startTime,
        EndTime: endTime
      });

      showHoldMsg('success', 'Record updated successfully');
      
      // Reset form
      setHoldId(null);
      setSelectedOutletId('');
      setSelectedItemId('');
      setSelectedAction('');
      setStartTime('12:00 AM');
      setEndTime('12:00 AM');

      // Refresh list
      await fetchHoldListData(holdCurrentPage, holdPageSize, holdDebouncedSearch);
    } catch (err) {
      showHoldMsg('error', err instanceof Error ? err.message : 'Failed to process operation.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBulkAction = async (action: 'Hold' | 'Start') => {
    if (!token) return;
    if (!bulkItemId) {
      showHoldMsg('error', 'Please select an item for bulk action');
      return;
    }

    const item = products.find(p => String(p.ID) === bulkItemId);
    if (!item) {
      showHoldMsg('error', 'Invalid item selected');
      return;
    }

    setIsBulkSaving(true);
    try {
      await saveHoldItemBulk(token, {
        ItemID: item.ID,
        ItemName: item.Name,
        Action: action
      });

      showHoldMsg('success', `${action} applied on all outlets successfully`);
      setBulkItemId('');
      await fetchHoldListData(holdCurrentPage, holdPageSize, holdDebouncedSearch);
    } catch (err) {
      showHoldMsg('error', err instanceof Error ? err.message : 'Bulk operation failed.');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const handleEditClick = (item: HoldItem) => {
    setHoldId(item.ID);
    setSelectedOutletId(String(item.OutletID));
    setSelectedItemId(String(item.ItemID));
    setSelectedAction(item.Action || 'Hold');
    setStartTime(item.starttime || '12:00 AM');
    setEndTime(item.endtime || '12:00 AM');
    setActiveFormTab('create');
  };

  const holdTotalPages = Math.ceil(holdTotalCount / holdPageSize);
  const logsTotalPages = Math.ceil(logsTotalCount / logsPageSize);

  const getActionBadgeClass = (action: string) => {
    const lower = (action || '').toLowerCase();
    if (lower.includes('start')) {
      return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    }
    if (lower.includes('hold')) {
      return 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400';
    }
    return 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400';
  };

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Upper Title Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20 animate-pulse">
            <Pause className="text-white" size={32} />
          </div>
          Hold Management
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Temporarily stop item sales at outlets, view audit trail history, or manage availability logs.
        </p>
      </div>

      {/* Main Grid Layout with Left Navigation Menu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Page Sidebar (Sub-menu Navigation) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 mb-4 px-2 tracking-wider">Submenu</h3>
            <nav className="space-y-1">
              <button
                onClick={() => handleSubTabChange('hold-items')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-3 ${
                  activeSubTab === 'hold-items'
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <Pause size={16} />
                <span>Hold Items</span>
              </button>
              <button
                onClick={() => handleSubTabChange('hold-items-logs')}
                className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-black transition-all flex items-center gap-3 ${
                  activeSubTab === 'hold-items-logs'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <History size={16} />
                <span>Hold Items Logs</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="lg:col-span-9">
          
          {/* Welcome Screen when no submenu clicked */}
          {activeSubTab === null && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl mb-4">
                <Pause size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hold Management Modules</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm font-medium text-xs leading-relaxed">
                Click on the side menu items to load either the active <strong>Hold Items</strong> manager or the <strong>Hold Items Logs</strong> audit trail. No queries are run until selected.
              </p>
            </div>
          )}

          {/* MODULE: HOLD ITEMS */}
          {activeSubTab === 'hold-items' && (
            <div className="space-y-6">
              
              {/* Alert message */}
              {holdMessage && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 border transition-all ${
                  holdMessage.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                }`}>
                  {holdMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                  <span className="text-sm font-extrabold">{holdMessage.text}</span>
                </div>
              )}

              {isLoadingOptions ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800">
                  <RefreshCw className="animate-spin text-amber-500" size={32} />
                  <p className="text-slate-450 text-sm font-semibold">Loading data options...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  
                  {/* Forms column */}
                  <div className="xl:col-span-7 space-y-6">
                    
                    {/* Hold items editor form */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-sm overflow-hidden">
                      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20 flex justify-between items-center">
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                          <button
                            onClick={() => setActiveFormTab('create')}
                            className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
                              activeFormTab === 'create'
                                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-650'
                            }`}
                          >
                            {holdId ? 'Edit Hold Item' : 'Hold Items'}
                          </button>
                          <button
                            onClick={() => setActiveFormTab('list')}
                            className={`px-4 py-2 text-xs font-black rounded-lg transition-all ${
                              activeFormTab === 'list'
                                ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                                : 'text-slate-400 hover:text-slate-650'
                            }`}
                          >
                            Hold Items List ({holdList.length})
                          </button>
                        </div>
                      </div>

                      {activeFormTab === 'create' ? (
                        <form onSubmit={handleSingleSave} className="p-6 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Outlet */}
                            <div>
                              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">Select Branch</label>
                              <select
                                value={selectedOutletId}
                                onChange={(e) => setSelectedOutletId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold"
                              >
                                <option value="">Select Branch</option>
                                {outlets.map(o => (
                                  <option key={o.id} value={o.id}>{o.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Menu Item */}
                            <div>
                              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">Select Item</label>
                              <select
                                value={selectedItemId}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold"
                              >
                                <option value="">Select Item</option>
                                {products.map(p => (
                                  <option key={p.ID} value={p.ID}>{p.Name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Action */}
                            <div>
                              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">Select Action</label>
                              <select
                                value={selectedAction}
                                onChange={(e) => setSelectedAction(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold"
                              >
                                <option value="">Select Action</option>
                                <option value="Hold">Hold</option>
                                <option value="Start">Start</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Start Time */}
                            <div>
                              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">Start Time</label>
                              <select
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold"
                              >
                                {TIME_SLOTS.map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>

                            {/* End Time */}
                            <div>
                              <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">End Time</label>
                              <select
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold"
                              >
                                {TIME_SLOTS.map(t => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="pt-2 flex gap-3">
                            <button
                              type="submit"
                              disabled={isSaving}
                              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-emerald-600/10 flex items-center gap-2"
                            >
                              {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                              Save Record
                            </button>

                            {holdId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setHoldId(null);
                                  setSelectedOutletId('');
                                  setSelectedItemId('');
                                  setSelectedAction('');
                                  setStartTime('12:00 AM');
                                  setEndTime('12:00 AM');
                                }}
                                className="px-6 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs tracking-wider uppercase hover:bg-slate-350 transition-all"
                              >
                                Cancel Edit
                              </button>
                            )}
                          </div>
                        </form>
                      ) : (
                        <div className="p-6">
                          <div className="relative mb-4 flex items-center">
                            <Search className="absolute left-3 text-slate-400" size={16} />
                            <input
                              type="text"
                              placeholder="Search by item name or branch name..."
                              value={holdSearchTerm}
                              onChange={(e) => setHoldSearchTerm(e.target.value)}
                              className="w-full pl-9 pr-10 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs font-semibold"
                            />
                            {isListLoading && (
                              <RefreshCw className="absolute right-3 animate-spin text-amber-500" size={14} />
                            )}
                          </div>

                          {isListLoading && holdList.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                              <RefreshCw className="animate-spin text-amber-500" size={32} />
                              <p className="text-slate-450 text-sm font-semibold">Searching held items...</p>
                            </div>
                          ) : holdList.length === 0 ? (
                            <div className="py-12 text-center text-slate-450">
                              <AlertTriangle className="mx-auto mb-2 text-slate-350" size={32} />
                              <p className="text-xs">No active hold items found matching search query.</p>
                            </div>
                          ) : (
                            <>
                              <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-2xl">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-950/40 text-[9px] font-black uppercase text-slate-450 border-b border-slate-150 dark:border-slate-800">
                                      <th className="p-3">ID</th>
                                      <th className="p-3">Item</th>
                                      <th className="p-3">Branch</th>
                                      <th className="p-3">Schedule</th>
                                      <th className="p-3 font-right text-right pr-4">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-semibold text-slate-700 dark:text-slate-350">
                                    {holdList.map(item => (
                                      <tr key={item.ID} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10">
                                        <td className="p-3 font-extrabold text-slate-850 dark:text-white">#{item.ID}</td>
                                        <td className="p-3 font-black text-slate-850 dark:text-white">{item.ItemName}</td>
                                        <td className="p-3">{item.OutletName}</td>
                                        <td className="p-3 space-y-0.5">
                                          <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                            <Clock size={10} />
                                            <span>{item.starttime} - {item.endtime}</span>
                                          </div>
                                        </td>
                                        <td className="p-3 text-right pr-4">
                                          <button
                                            onClick={() => handleEditClick(item)}
                                            className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] uppercase shadow-sm"
                                          >
                                            Edit
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Pagination Section */}
                              <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Showing <span className="text-slate-900 dark:text-white">{(holdCurrentPage - 1) * holdPageSize + 1}–{Math.min(holdCurrentPage * holdPageSize, holdTotalCount)}</span> of <span className="text-slate-900 dark:text-white">{holdTotalCount}</span> entries
                                  </p>
                                  <select
                                    value={holdPageSize}
                                    onChange={(e) => {
                                      setHoldPageSize(Number(e.target.value));
                                      setHoldCurrentPage(1);
                                    }}
                                    className="px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500"
                                  >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                  </select>
                                </div>

                                {holdTotalPages > 1 && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      disabled={holdCurrentPage === 1}
                                      onClick={() => setHoldCurrentPage(prev => Math.max(1, prev - 1))}
                                      className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-amber-500/50 disabled:opacity-50 transition-all"
                                    >
                                      Prev
                                    </button>
                                    {Array.from({ length: holdTotalPages }, (_, i) => i + 1)
                                      .filter(p => p === 1 || p === holdTotalPages || Math.abs(p - holdCurrentPage) <= 1)
                                      .map((p, idx, arr) => {
                                        const showDots = idx > 0 && p - arr[idx - 1] > 1;
                                        return (
                                          <React.Fragment key={p}>
                                            {showDots && <span className="text-slate-400 text-xs px-1">...</span>}
                                            <button
                                              onClick={() => setHoldCurrentPage(p)}
                                              className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                                                p === holdCurrentPage
                                                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                                                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-amber-500/50'
                                              }`}
                                            >
                                              {p}
                                            </button>
                                          </React.Fragment>
                                        );
                                      })}
                                    <button
                                      disabled={holdCurrentPage === holdTotalPages}
                                      onClick={() => setHoldCurrentPage(prev => Math.min(holdTotalPages, prev + 1))}
                                      className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-amber-500/50 disabled:opacity-50 transition-all"
                                    >
                                      Next
                                    </button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bulk Actions Form */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-sm overflow-hidden">
                      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                          Hold Items on All Outlets
                        </h4>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <label className="block text-xs font-extrabold uppercase text-slate-400 mb-2">Select Item</label>
                          <select
                            value={bulkItemId}
                            onChange={(e) => setBulkItemId(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold"
                          >
                            <option value="">Select Item</option>
                            {products.map(p => (
                              <option key={p.ID} value={p.ID}>{p.Name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="pt-2 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={isBulkSaving}
                            onClick={() => handleBulkAction('Hold')}
                            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-amber-500/10 flex items-center gap-2"
                          >
                            {isBulkSaving ? <RefreshCw size={14} className="animate-spin" /> : <Pause size={14} />}
                            Hold on All Branches
                          </button>

                          <button
                            type="button"
                            disabled={isBulkSaving}
                            onClick={() => handleBulkAction('Start')}
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase transition-all shadow-md shadow-emerald-600/10 flex items-center gap-2"
                          >
                            {isBulkSaving ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
                            Start on All Branches
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Sidebar instructions column */}
                  <div className="xl:col-span-5 space-y-6">
                    
                    <div className="bg-gradient-to-tr from-slate-900 to-slate-950 text-white border border-slate-850 rounded-[24px] p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full"></div>
                      
                      <h4 className="text-sm font-black uppercase tracking-wider text-amber-500 mb-2 flex items-center gap-1.5">
                        <AlertTriangle size={16} />
                        Operational Notice
                      </h4>
                      <p className="text-xs text-slate-400 font-semibold leading-relaxed mb-4">
                        Putting an item on <strong>Hold</strong> will prevent customers from adding it to their carts or purchasing it from the selected outlets. Changing the action to <strong>Start</strong> will resume sales immediately.
                      </p>

                      <div className="border-t border-white/10 pt-4 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Currently Held Items:</span>
                          <span className="font-extrabold text-amber-500">{holdTotalCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Connected Branches:</span>
                          <span className="font-extrabold text-white">{outlets.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Active Menu Items:</span>
                          <span className="font-extrabold text-white">{products.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] p-6 shadow-sm">
                      <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4">
                        How to Use Hold Items
                      </h4>
                      <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <li className="flex items-start gap-2">
                          <ChevronRight size={14} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>To hold an item for a specific branch, fill out the form under the <strong>Hold Items</strong> tab. Choose Action = <strong>Hold</strong>, specify the times and click <strong>Save</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight size={14} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>To release a hold, find the item in the <strong>Hold Items List</strong> tab, click <strong>Edit</strong>, change the Action to <strong>Start</strong>, and click <strong>Save</strong>.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight size={14} className="text-amber-500 shrink-0 mt-0.5" />
                          <span>To hold or release items for ALL outlets in one click, use the <strong>Hold Items on All Outlets</strong> section below the main form.</span>
                        </li>
                      </ul>
                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* MODULE: HOLD ITEMS LOGS */}
          {activeSubTab === 'hold-items-logs' && (
            <div className="space-y-6">
              
              {/* Alert message */}
              {logsMessage && (
                <div className="p-4 rounded-2xl flex items-center gap-3 border bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 transition-all">
                  <AlertTriangle size={20} />
                  <span className="text-sm font-extrabold">{logsMessage.text}</span>
                </div>
              )}

              {/* Logs Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-sm overflow-hidden p-6">
                
                {/* Search Bar */}
                <div className="relative mb-6 flex items-center max-w-md">
                  <Search className="absolute left-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search logs by item name, branch, or action..."
                    value={logsSearchTerm}
                    onChange={(e) => setLogsSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-semibold"
                  />
                  {isLogsLoading && (
                    <RefreshCw className="absolute right-3 animate-spin text-indigo-500" size={14} />
                  )}
                </div>

                {isLogsLoading && logsList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw className="animate-spin text-indigo-600" size={32} />
                    <p className="text-slate-450 text-sm font-semibold">Searching logs history...</p>
                  </div>
                ) : logsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-450">
                    <AlertTriangle className="mx-auto mb-2 text-slate-350" size={32} />
                    <p className="text-xs">No hold item logs found matching search query.</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto border border-slate-100 dark:border-slate-850 rounded-2xl">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-950/40 text-[9px] font-black uppercase text-slate-450 border-b border-slate-150 dark:border-slate-800">
                            <th className="p-3">Log ID</th>
                            <th className="p-3">Item</th>
                            <th className="p-3">Branch</th>
                            <th className="p-3">Action</th>
                            <th className="p-3">Time Schedule</th>
                            <th className="p-3 text-right pr-4">Performed By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-semibold text-slate-700 dark:text-slate-350">
                          {logsList.map(log => (
                            <tr key={log.ID} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10">
                              <td className="p-3 font-extrabold text-slate-850 dark:text-white">#{log.ID}</td>
                              <td className="p-3">
                                <div className="flex flex-col">
                                  <span className="font-black text-slate-850 dark:text-white">{log.ItemName}</span>
                                  <span className="text-[10px] text-slate-400">ID: #{log.ItemID}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex flex-col">
                                  <span>{log.OutletName || 'All Outlets'}</span>
                                  {log.OutletID > 0 && (
                                    <span className="text-[10px] text-slate-400">ID: #{log.OutletID}</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase ${getActionBadgeClass(log.Action)}`}>
                                  {log.Action.toLowerCase().includes('start') ? <Play size={10} fill="currentColor" /> : <Pause size={10} fill="currentColor" />}
                                  {log.Action}
                                </span>
                              </td>
                              <td className="p-3 space-y-1">
                                {log.starttime || log.endtime ? (
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <Clock size={10} />
                                    <span>{log.starttime} - {log.endtime}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 text-[10px]">Indefinite</span>
                                )}
                              </td>
                              <td className="p-3 text-right pr-4">
                                <div className="flex flex-col items-end">
                                  <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                    <User size={10} className="text-slate-400" />
                                    {log.User || 'System'}
                                  </span>
                                  <span className="text-[9px] text-slate-400 mt-0.5">
                                    {log.Created ? new Date(log.Created).toLocaleString() : 'N/A'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Logs Pagination Section */}
                    <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-slate-450 text-[11px] font-bold">
                        Showing <span className="text-slate-800 dark:text-slate-200">{((logsCurrentPage - 1) * logsPageSize) + 1}</span> to{' '}
                        <span className="text-slate-800 dark:text-slate-200">
                          {Math.min(logsCurrentPage * logsPageSize, logsTotalCount)}
                        </span>{' '}
                        of <span className="text-slate-800 dark:text-slate-200">{logsTotalCount}</span> entries
                      </div>

                      <div className="flex items-center gap-6">
                        {/* Page Size selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-slate-450 text-[11px] font-bold">Show</span>
                          <select
                            value={logsPageSize}
                            onChange={(e) => {
                              setLogsPageSize(Number(e.target.value));
                              setLogsCurrentPage(1);
                            }}
                            className="px-2 py-1.5 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                          </select>
                        </div>

                        {/* Navigation buttons */}
                        {logsTotalPages > 1 && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setLogsCurrentPage(prev => Math.max(prev - 1, 1))}
                              disabled={logsCurrentPage === 1 || isLogsLoading}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-500 hover:text-slate-850 dark:hover:text-white disabled:opacity-50 transition-all"
                            >
                              Prev
                            </button>
                            
                            {Array.from({ length: logsTotalPages }, (_, i) => i + 1)
                              .filter(p => p === 1 || p === logsTotalPages || Math.abs(p - logsCurrentPage) <= 1)
                              .map((p, idx, arr) => {
                                const showDots = idx > 0 && p - arr[idx - 1] > 1;
                                return (
                                  <React.Fragment key={p}>
                                    {showDots && <span className="text-slate-400 text-xs px-1">...</span>}
                                    <button
                                      onClick={() => setLogsCurrentPage(p)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                                        logsCurrentPage === p
                                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                                          : 'border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-850 dark:hover:text-white'
                                      }`}
                                    >
                                      {p}
                                    </button>
                                  </React.Fragment>
                                );
                              })}

                            <button
                              onClick={() => setLogsCurrentPage(prev => Math.min(prev + 1, logsTotalPages))}
                              disabled={logsCurrentPage === logsTotalPages || isLogsLoading}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-extrabold text-slate-500 hover:text-slate-850 dark:hover:text-white disabled:opacity-50 transition-all"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
