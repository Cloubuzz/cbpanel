import React, { useEffect, useState } from 'react';
import {
  Store,
  MapPin,
  Clock,
  ToggleLeft,
  ToggleRight,
  Truck,
  ShoppingBag,
  Search,
  Plus,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';
import { fetchOutletList, updateOutletStatus, type OutletListItem } from '../../services/outletsApi';

interface Outlet {
  id: string;
  name: string;
  city: string;
  deliveryTime: number;
  isDelivers: boolean;
  takeaway: boolean;
  isOpen: boolean;
}

const mapApiOutlet = (outlet: OutletListItem): Outlet => ({
  id: String(outlet.id),
  name: outlet.name,
  city: outlet.city,
  deliveryTime: outlet.deliveryTime,
  isDelivers: outlet.isDelivers,
  takeaway: outlet.takeaway,
  isOpen: outlet.closeReason !== 'AutoAcceptanceClose' && outlet.closeReason !== 'Auto Acceptance Close',
});

interface OutletManagerProps {
  onAddOutlet: () => void;
  onEditOutlet: (id: string) => void;
}

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}> = ({ checked, onChange, disabled, isLoading }) => {
  return (
    <button
      onClick={onChange}
      disabled={disabled || isLoading}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
      } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`flex items-center justify-center h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      >
        {isLoading && <Loader2 size={10} className="animate-spin text-teal-500" />}
      </span>
    </button>
  );
};

export const OutletManager: React.FC<OutletManagerProps> = ({ onAddOutlet, onEditOutlet }) => {
  const token = useAppSelector(selectToken);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusOutlet, setStatusOutlet] = useState<Outlet | null>(null);
  const [updatingType, setUpdatingType] = useState<'Delivery' | 'Takeaway' | 'AutoAcceptance' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadOutlets = async () => {
      if (!token) return;

      setIsLoading(true);
      setError(null);
      try {
        const apiOutlets = await fetchOutletList(token);
        setOutlets(apiOutlets.map(mapApiOutlet));
      } catch (err) {
        console.error('Failed to load outlets:', err);
        setError(err instanceof Error ? err.message : 'Failed to load outlets.');
      } finally {
        setIsLoading(false);
      }
    };

    loadOutlets();
  }, [token]);

  const handleToggleStatus = (outlet: Outlet) => {
    setStatusOutlet(outlet);
  };

  const handleUpdateStatus = async (
    type: 'Delivery' | 'Takeaway' | 'AutoAcceptance',
    currentVal: boolean
  ) => {
    if (!token || !statusOutlet) return;

    setUpdatingType(type);
    const nextVal = !currentVal;
    let actionStr = String(nextVal);
    if (type === 'AutoAcceptance') {
      actionStr = nextVal ? 'Auto Acceptance Open' : 'Auto Acceptance Close';
    }

    try {
      await updateOutletStatus(token, Number(statusOutlet.id), type, actionStr);

      setOutlets(prev => prev.map(o => {
        if (o.id === statusOutlet.id) {
          const updated = { ...o };
          if (type === 'Delivery') updated.isDelivers = nextVal;
          if (type === 'Takeaway') updated.takeaway = nextVal;
          if (type === 'AutoAcceptance') updated.isOpen = nextVal;
          return updated;
        }
        return o;
      }));

      setStatusOutlet(prev => {
        if (!prev) return null;
        const updated = { ...prev };
        if (type === 'Delivery') updated.isDelivers = nextVal;
        if (type === 'Takeaway') updated.takeaway = nextVal;
        if (type === 'AutoAcceptance') updated.isOpen = nextVal;
        return updated;
      });
    } catch (err) {
      console.error(`Failed to update ${type} status:`, err);
      alert(err instanceof Error ? err.message : `Failed to update status`);
    } finally {
      setUpdatingType(null);
    }
  };

  const filteredOutlets = outlets.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.city.toLowerCase().includes(searchQuery.toLowerCase())
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

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <Loader2 size={32} className="animate-spin text-teal-500" />
          <p className="text-sm font-medium">Loading outlets...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <div className="p-3 rounded-full bg-rose-500/10 text-rose-500">
            <AlertCircle size={28} />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">Failed to load outlets</p>
          <p className="text-xs text-slate-500 max-w-sm">{error}</p>
        </div>
      )}

      {!isLoading && !error && (
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
                      onClick={() => handleToggleStatus(outlet)}
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
                    <span className="truncate">{outlet.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Clock size={12} className="text-teal-500" />
                    <span>{outlet.deliveryTime} min delivery</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  {outlet.isDelivers ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                      <Truck size={12} /> Delivery Open
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                      <Truck size={12} /> Delivery Close
                    </span>
                  )}
                  {outlet.takeaway ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                      <ShoppingBag size={12} /> Takeaway Open
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                      <ShoppingBag size={12} /> Takeaway Close
                    </span>
                  )}
                  {outlet.isOpen ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 border border-teal-200 dark:border-teal-900">
                      <CheckCircle2 size={12} /> Auto Acceptance Open
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                      <X size={12} /> Auto Acceptance Close
                    </span>
                  )}
                </div>
              </div>

              {/* Footer / Actions */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end bg-white dark:bg-slate-900/40 mt-auto">
                <button
                  onClick={() => onEditOutlet(outlet.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                   Manage Outlet
                </button>
              </div>
            </div>
          ))}

          {!isLoading && !error && filteredOutlets.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center gap-2 text-slate-400">
              <Store size={32} className="opacity-50" />
              <p className="text-sm font-medium">
                {searchQuery ? 'No outlets match your search.' : 'No outlets found.'}
              </p>
            </div>
          )}

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
      )}

      {/* Manage Outlet Status Popup */}
      <AnimatePresence>
        {statusOutlet && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStatusOutlet(null)}
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
                  <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-500">
                    <Store size={24} />
                  </div>
                  <button
                    onClick={() => setStatusOutlet(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Manage Status</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 truncate">
                  {statusOutlet.name} • {statusOutlet.city}
                </p>

                <div className="space-y-6">
                  {/* Option 1: Delivery */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        <Truck size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Delivery</span>
                        <span className="text-xs text-slate-400 mt-0.5">Toggle delivery services</span>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={statusOutlet.isDelivers}
                      onChange={() => handleUpdateStatus('Delivery', statusOutlet.isDelivers)}
                      isLoading={updatingType === 'Delivery'}
                      disabled={updatingType !== null}
                    />
                  </div>

                  {/* Option 2: Takeaway */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                        <ShoppingBag size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Takeaway / Pickup</span>
                        <span className="text-xs text-slate-400 mt-0.5">Toggle takeaway services</span>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={statusOutlet.takeaway}
                      onChange={() => handleUpdateStatus('Takeaway', statusOutlet.takeaway)}
                      isLoading={updatingType === 'Takeaway'}
                      disabled={updatingType !== null}
                    />
                  </div>

                  {/* Option 3: Auto Acceptance */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">Auto Acceptance</span>
                        <span className="text-xs text-slate-400 mt-0.5">Automatically accept orders</span>
                      </div>
                    </div>
                    <ToggleSwitch
                      checked={statusOutlet.isOpen}
                      onChange={() => handleUpdateStatus('AutoAcceptance', statusOutlet.isOpen)}
                      isLoading={updatingType === 'AutoAcceptance'}
                      disabled={updatingType !== null}
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setStatusOutlet(null)}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Done
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
