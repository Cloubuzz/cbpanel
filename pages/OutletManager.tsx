import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Clock, 
  ToggleLeft, 
  ToggleRight, 
  Users, 
  DollarSign, 
  Search, 
  Plus, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Outlet {
  id: string;
  name: string;
  address: string;
  phone: string;
  isOpen: boolean;
  status: 'OPEN' | 'CLOSED' | 'BUSY';
  stats: {
    dailyRevenue: number;
    activeOrders: number;
    avgPrepTime: number;
  };
  lastUpdate: string;
}

const mockOutlets: Outlet[] = [
  {
    id: '1',
    name: 'Downtown Central',
    address: '123 Main St, City Center',
    phone: '+1 234 567 8901',
    isOpen: true,
    status: 'OPEN',
    stats: {
      dailyRevenue: 2450,
      activeOrders: 12,
      avgPrepTime: 18
    },
    lastUpdate: '2 mins ago'
  },
  {
    id: '2',
    name: 'Westside Hub',
    address: '456 West Ave, Business District',
    phone: '+1 234 567 8902',
    isOpen: true,
    status: 'BUSY',
    stats: {
      dailyRevenue: 1850,
      activeOrders: 25,
      avgPrepTime: 32
    },
    lastUpdate: 'Just now'
  },
  {
    id: '3',
    name: 'Eastside Express',
    address: '789 East Blvd, Residential Area',
    phone: '+1 234 567 8903',
    isOpen: false,
    status: 'CLOSED',
    stats: {
      dailyRevenue: 0,
      activeOrders: 0,
      avgPrepTime: 0
    },
    lastUpdate: '1 hour ago'
  },
  {
    id: '4',
    name: 'North Point Mall',
    address: '101 Mall Way, Shopping Center',
    phone: '+1 234 567 8904',
    isOpen: true,
    status: 'OPEN',
    stats: {
      dailyRevenue: 3200,
      activeOrders: 8,
      avgPrepTime: 15
    },
    lastUpdate: '5 mins ago'
  }
];

interface OutletManagerProps {
  onAddOutlet: () => void;
  onEditOutlet: (id: string) => void;
}

export const OutletManager: React.FC<OutletManagerProps> = ({ onAddOutlet, onEditOutlet }) => {
  const [outlets, setOutlets] = useState<Outlet[]>(mockOutlets);
  const [closingOutletId, setClosingOutletId] = useState<string | null>(null);
  const [closeMinutes, setCloseMinutes] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    if (currentStatus) {
      // If currently open, we want to close it, so show popup
      setClosingOutletId(id);
    } else {
      // If currently closed, just open it
      setOutlets(prev => prev.map(o => 
        o.id === id ? { ...o, isOpen: true, status: 'OPEN' } : o
      ));
    }
  };

  const confirmClose = () => {
    if (closingOutletId) {
      setOutlets(prev => prev.map(o => 
        o.id === closingOutletId ? { ...o, isOpen: false, status: 'CLOSED' } : o
      ));
      setClosingOutletId(null);
      setCloseMinutes(30);
    }
  };

  const filteredOutlets = outlets.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Outlet Manager</h1>
             <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-xs font-bold">{outlets.length} Outlets</span>
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Monitor and manage your restaurant locations in real-time.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search outlets..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white placeholder:text-slate-500"
             />
          </div>
          <button 
            onClick={onAddOutlet}
            className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all whitespace-nowrap"
          >
             <Plus size={18} />
             <span className="hidden sm:inline">Add Outlet</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOutlets.map(outlet => (
          <div key={outlet.id} className="glass-card rounded-2xl p-0 flex flex-col group transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] overflow-hidden">
            
            {/* Top Section */}
            <div className="p-6 pb-4">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20`}>
                  <Store size={24} />
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleToggleStatus(outlet.id, outlet.isOpen)}
                    className={`transition-colors duration-300 ${outlet.isOpen ? 'text-teal-500' : 'text-slate-400'}`}
                  >
                    {outlet.isOpen ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                  </button>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 truncate">{outlet.name}</h3>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <MapPin size={12} className="text-teal-500" />
                  <span className="truncate">{outlet.address}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Phone size={12} className="text-teal-500" />
                  <span>{outlet.phone}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                {outlet.status === 'OPEN' && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 border border-teal-200 dark:border-teal-900">
                    <CheckCircle2 size={12} /> Open
                  </span>
                )}
                {outlet.status === 'BUSY' && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                    <AlertCircle size={12} /> Busy
                  </span>
                )}
                {outlet.status === 'CLOSED' && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                    <X size={12} /> Closed
                  </span>
                )}
                <span className="text-[10px] text-slate-400 font-medium">Updated {outlet.lastUpdate}</span>
              </div>
            </div>

            {/* Stats Section */}
            <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Revenue</p>
                  <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-sm">
                    <DollarSign size={12} className="text-teal-500"/>
                    {outlet.stats.dailyRevenue.toLocaleString()}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Orders</p>
                  <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-sm">
                    <Users size={12} className="text-blue-500"/>
                    {outlet.stats.activeOrders}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Prep Time</p>
                  <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-sm">
                    <Clock size={12} className="text-amber-500"/>
                    {outlet.stats.avgPrepTime}m
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/40">
              <button className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                 View Analytics
              </button>
              <button 
                onClick={() => onEditOutlet(outlet.id)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                 Manage Outlet
              </button>
            </div>
          </div>
        ))}
        
        {/* 'Add New' Placeholder Card */}
        <button 
          onClick={onAddOutlet}
          className="group relative min-h-[300px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:text-teal-500 dark:hover:text-teal-400 transition-all duration-300"
        >
           <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
             <Plus size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
           </div>
           <span className="font-bold text-lg">Add New Outlet</span>
           <span className="text-xs mt-1 opacity-70">Expand your business reach</span>
        </button>
      </div>

      {/* Close Duration Popup */}
      <AnimatePresence>
        {closingOutletId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClosingOutletId(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                    <Clock size={24} />
                  </div>
                  <button 
                    onClick={() => setClosingOutletId(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Close Outlet Temporary</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
                  For how many minutes would you like to keep this outlet closed? It will automatically reopen after this duration.
                </p>

                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (Minutes)</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="5" 
                        max="240" 
                        step="5"
                        value={closeMinutes}
                        onChange={(e) => setCloseMinutes(parseInt(e.target.value))}
                        className="flex-1 accent-teal-500"
                      />
                      <div className="w-20 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-center font-bold text-slate-900 dark:text-white">
                        {closeMinutes}m
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[15, 30, 60, 120].map(mins => (
                      <button 
                        key={mins}
                        onClick={() => setCloseMinutes(mins)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${closeMinutes === mins ? 'bg-teal-500 text-white' : 'bg-slate-50 dark:bg-slate-950 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-10 flex gap-3">
                  <button 
                    onClick={() => setClosingOutletId(null)}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={confirmClose}
                    className="flex-1 py-3.5 rounded-2xl text-sm font-bold bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all"
                  >
                    Confirm Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
