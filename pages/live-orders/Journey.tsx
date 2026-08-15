import React, { useState, useEffect, useRef } from 'react';
import { 
  History, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  MapPin, 
  Phone, 
  Save, 
  Volume2, 
  VolumeX, 
  FileText,
  ChevronLeft
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';
import { fetchCustomerJourney, updateCustomerJourney, type CustomerJourneyItem } from '../../services/ordersApi';
import { useNavigate } from 'react-router-dom';

export const CustomerJourney: React.FC = () => {
  const token = useAppSelector(selectToken);
  const navigate = useNavigate();

  const [items, setItems] = useState<CustomerJourneyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Pending');

  // Audio Alerts
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevCountRef = useRef<number>(0);
  
  // Updating states (row-level loader)
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  
  // Edit state for remarks & status per row
  const [editedRows, setEditedRows] = useState<Record<number, { status: string; remarks: string }>>({});

  const loadData = async (isPoll = false) => {
    if (!token) return;
    if (!isPoll) setIsLoading(true);
    try {
      const res = await fetchCustomerJourney(token, 1, 100);
      const dataList = res.data ?? [];
      setItems(dataList);
      
      // Initialize edit states for row values if not already touched
      setEditedRows(prev => {
        const next = { ...prev };
        dataList.forEach(item => {
          if (!next[item.ID]) {
            next[item.ID] = {
              status: item.Status || 'Pending',
              remarks: item.Remarks || ''
            };
          }
        });
        return next;
      });

      // Sound Alarm logic on new pending items
      const pendingCount = dataList.filter(d => d.Status === 'Pending').length;
      if (isPoll && pendingCount > prevCountRef.current && soundEnabled) {
        playAlertSound();
      }
      prevCountRef.current = pendingCount;
      setError(null);
    } catch (err) {
      if (!isPoll) setError(err instanceof Error ? err.message : 'Failed to load customer journey.');
    } finally {
      if (!isPoll) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup auto-polling every 30 seconds
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [token, soundEnabled]);

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Generate a pleasant synth alarm sequence
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
      
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0.15, audioCtx.currentTime);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.25);
      }, 200);
    } catch (e) {
      console.warn('Audio alert failed to play:', e);
    }
  };

  const handleRowChange = (id: number, key: 'status' | 'remarks', value: string) => {
    setEditedRows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value
      }
    }));
  };

  const handleUpdate = async (id: number) => {
    if (!token) return;
    const editState = editedRows[id];
    if (!editState) return;

    setUpdatingId(id);
    try {
      await updateCustomerJourney(token, id, editState.status, editState.remarks);
      
      // Update local state item values
      setItems(prev => prev.map(item => {
        if (item.ID === id) {
          return {
            ...item,
            Status: editState.status,
            Remarks: editState.remarks
          };
        }
        return item;
      }));

      alert('Journey status updated successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Cannot update status at the moment');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter items based on search and status tab
  const filteredItems = items.filter(item => {
    const editState = editedRows[item.ID] || { status: item.Status || 'Pending' };
    
    // Status Filter
    if (statusFilter !== 'All' && editState.status !== statusFilter) {
      return false;
    }
    
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (item.Name || '').toLowerCase().includes(q);
      const phoneMatch = (item.Phone || '').includes(q);
      const cityMatch = (item.City || '').toLowerCase().includes(q);
      const areaMatch = (item.Area || '').toLowerCase().includes(q);
      return nameMatch || phoneMatch || cityMatch || areaMatch;
    }

    return true;
  });

  // Calculate Metrics
  const totalAbandoned = items.length;
  const convertedCount = items.filter(i => i.Status === 'Converted').length;
  const pendingCount = items.filter(i => i.Status === 'Pending').length;
  const conversionRate = totalAbandoned > 0 ? (convertedCount / totalAbandoned) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/live-orders')}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-850 dark:text-white tracking-tight flex items-center gap-2">
              <History className="text-teal-500" size={24} />
              Abandon Leads Journey
            </h2>
            <p className="text-xs font-semibold text-slate-450 dark:text-slate-500">
              Track abandoned checkouts, update recovery status, and follow up with leads.
            </p>
          </div>
        </div>

        {/* Audio and Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all ${
              soundEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {soundEnabled ? 'Alarm Active' : 'Alarm Muted'}
          </button>

          <button
            onClick={() => loadData(false)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/30">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Abandoned</p>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">{totalAbandoned}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <FileText size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Pending Recovery</p>
            <h4 className="text-xl font-black text-amber-500 mt-1">{pendingCount}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Recovered Leads</p>
            <h4 className="text-xl font-black text-emerald-500 mt-1">{convertedCount}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle size={18} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Recovery Rate</p>
            <h4 className="text-xl font-black text-teal-500 mt-1">{conversionRate.toFixed(1)}%</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
            <CheckCircle size={18} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
        {/* Status Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
          {['Pending', 'Converted', 'NotConverted', 'All'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex-1 sm:flex-none px-4 py-2 text-xs font-black rounded-lg transition-all ${
                statusFilter === tab 
                  ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {tab === 'NotConverted' ? 'Not Converted' : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Content Area / Table */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="animate-spin text-teal-500" size={32} />
            <p className="text-slate-450 text-sm font-semibold">Loading journey logs...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-rose-500 gap-3">
            <XCircle size={32} />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
            <History size={40} />
            <p className="text-sm">No abandon journeys found matching filter criteria.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-extrabold uppercase tracking-wider text-slate-450">
                  <th className="px-6 py-4">Lead ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Journey Progress</th>
                  <th className="px-6 py-4">Status & Action</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4 text-center">Save</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 font-semibold text-slate-700 dark:text-slate-200">
                {filteredItems.map(item => {
                  const editState = editedRows[item.ID] || { status: item.Status || 'Pending', remarks: item.Remarks || '' };
                  const isPending = editState.status === 'Pending';
                  const isConverted = editState.status === 'Converted';

                  return (
                    <tr key={item.ID} className="hover:bg-slate-50/20 dark:hover:bg-slate-950/5 transition-all align-middle">
                      {/* Lead ID */}
                      <td className="px-6 py-4 font-extrabold text-slate-850 dark:text-white">
                        #{item.ID}
                      </td>

                      {/* Customer Name */}
                      <td className="px-6 py-4">
                        <span className="block font-black text-slate-850 dark:text-white">
                          {item.Name || 'Anonymous User'}
                        </span>
                        <span className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold block mt-0.5">
                          Created: {item.Created ? new Date(item.Created).toLocaleString() : 'N/A'}
                        </span>
                      </td>

                      {/* Contact & Location */}
                      <td className="px-6 py-4 space-y-1">
                        <span className="flex items-center gap-1.5 text-xs">
                          <Phone size={12} className="text-slate-400" />
                          {item.Phone || 'N/A'}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-450 dark:text-slate-500 font-medium">
                          <MapPin size={12} className="text-slate-400" />
                          {item.Area ? `${item.Area}, ${item.City}` : item.City || 'N/A'}
                        </span>
                      </td>

                      {/* Journey Milestones Progress */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                              item.AddAddress ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}>1</span>
                            <span className="text-[9px] font-extrabold mt-1 text-slate-450">Address</span>
                          </div>
                          
                          <div className="h-0.5 w-6 bg-slate-200 dark:bg-slate-700 -mt-3" />

                          <div className="flex flex-col items-center">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                              item.AddtoCart ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}>2</span>
                            <span className="text-[9px] font-extrabold mt-1 text-slate-450">Cart</span>
                          </div>

                          <div className="h-0.5 w-6 bg-slate-200 dark:bg-slate-700 -mt-3" />

                          <div className="flex flex-col items-center">
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                              item.CheckOut ? 'bg-teal-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                            }`}>3</span>
                            <span className="text-[9px] font-extrabold mt-1 text-slate-450">Checkout</span>
                          </div>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={editState.status}
                          onChange={(e) => handleRowChange(item.ID, 'status', e.target.value)}
                          className={`px-3 py-1.5 text-xs font-black rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                            isPending 
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                              : isConverted 
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                          }`}
                        >
                          <option value="Pending" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Pending</option>
                          <option value="Converted" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Converted</option>
                          <option value="NotConverted" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">Not Converted</option>
                        </select>
                      </td>

                      {/* Remarks Textbox */}
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editState.remarks}
                          onChange={(e) => handleRowChange(item.ID, 'remarks', e.target.value)}
                          placeholder="Add followup remarks..."
                          className="w-full min-w-[150px] px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-850 dark:text-slate-200"
                        />
                      </td>

                      {/* Action Update Button */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleUpdate(item.ID)}
                          disabled={updatingId === item.ID}
                          className="w-10 h-10 rounded-xl bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center transition-all mx-auto disabled:opacity-50 hover:shadow-lg hover:shadow-teal-500/20"
                        >
                          {updatingId === item.ID ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
