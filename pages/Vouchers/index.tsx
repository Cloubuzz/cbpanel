import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Ticket, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { VoucherList } from './components/VoucherList';
import { VoucherEditor } from './components/VoucherEditor';
import { generateId } from './constants';
import type { Voucher } from './types';
import { fetchVouchers, addVoucher, updateVoucher, type ApiVoucher } from '../../services/vouchersApi';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';

function mapApiVoucher(v: ApiVoucher): Voucher {
  return {
    id: String(v.ID),
    code: v.Number,
    description: v.IsUsed && v.OrderID > 0 ? `Used on Order #${v.OrderID}` : 'Not yet used',
    type: v.DiscountType === 'Amount' ? 'FIXED' : 'PERCENTAGE',
    value: parseFloat(v.Amount) || 0,
    minOrderValue: 0,
    isActive: !v.IsUsed,
    startDate: v.Created ? v.Created.split('T')[0] : '',
    endDate: v.Created ? v.Created.split('T')[0] : '',
    platforms: [],
    orderId: v.OrderID > 0 ? v.OrderID : undefined,
  };
}

export const Vouchers: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<Voucher | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchVouchers(token);
      setVouchers(data.map(mapApiVoucher));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vouchers.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const filtered = vouchers.filter(v =>
    v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unusedCount = vouchers.filter(v => v.isActive).length;
  const usedCount = vouchers.filter(v => !v.isActive).length;

  const handleCreateNew = () => {
    setCurrent({
      id: generateId('vouch'),
      code: '',
      description: '',
      type: 'FIXED',
      value: 0,
      minOrderValue: 0,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      platforms: ['web', 'ios', 'android'],
    });
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (!current) return;
    if (!window.confirm('Are you sure you want to delete this voucher?')) return;
    setVouchers(prev => prev.filter(v => v.id !== current.id));
    setIsEditing(false);
    setCurrent(null);
  };

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!current || !token) return;
    setIsSaving(true);
    setSaveError(null);
    const isNew = !vouchers.find(v => v.id === current.id);
    const discountType = current.type === 'FIXED' ? 'Amount' : 'Percentage';
    try {
      if (isNew) {
        const newId = await addVoucher(token, {
          number: current.code,
          amount: current.value,
          discountType,
        });
        setVouchers(prev => [{ ...current, id: String(newId) }, ...prev]);
      } else {
        await updateVoucher(token, {
          id: Number(current.id),
          number: current.code,
          amount: current.value,
          discountType,
        });
        setVouchers(prev => prev.map(v => v.id === current.id ? { ...current } : v));
      }
      setIsEditing(false);
      setCurrent(null);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : `Failed to ${isNew ? 'create' : 'update'} voucher.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
              <Ticket className="text-white md:w-8 md:h-8" size={24} />
            </div>
            Voucher Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Create and manage discount vouchers for your customers</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} disabled={isLoading} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-teal-500 hover:border-teal-500/50 transition-all shadow-sm" title="Refresh">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleCreateNew} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95">
            <Plus size={20} /> Create New Voucher
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total', value: vouchers.length, color: 'text-teal-500' },
          { label: 'Unused', value: unusedCount, color: 'text-emerald-500' },
          { label: 'Used', value: usedCount, color: 'text-rose-500' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 p-5 shadow-sm"
          >
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            {isLoading
              ? <div className="h-7 w-12 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              : <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            }
          </motion.div>
        ))}
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-[24px] border-2 border-rose-100 dark:border-rose-900/50 flex items-center justify-center">
            <AlertCircle size={28} className="text-rose-500" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-black">{error}</p>
          <button onClick={load} className="text-teal-500 text-sm font-bold uppercase tracking-widest hover:underline">Try Again</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-transparent shadow-sm animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      </div>
                    </div>
                    <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <VoucherList
                vouchers={filtered}
                selectedId={current?.id}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSelect={v => { setCurrent({ ...v }); setIsEditing(true); }}
              />
            )}
          </div>

          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {isEditing && current ? (
                <VoucherEditor
                  key={current.id}
                  voucher={current}
                  isNew={!vouchers.find(v => v.id === current.id)}
                  isSaving={isSaving}
                  onChange={setCurrent}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  onCancel={() => { setIsEditing(false); setCurrent(null); }}
                />
              ) : (
                <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <div className="w-24 h-24 bg-teal-500/10 text-teal-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
                    <Ticket size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Select a Voucher to Configure</h2>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-10">Create discount codes for your customers. Set usage rules, validity periods, and minimum order requirements.</p>
                  <button onClick={handleCreateNew} className="flex items-center gap-3 px-8 py-4 bg-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all group">
                    <Plus size={24} /> Create Your First Voucher <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-8 right-8 bg-rose-600 text-white px-8 py-5 rounded-[32px] shadow-2xl flex items-center gap-4 z-50 border border-white/10"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm uppercase tracking-widest">Failed</span>
            <span className="text-[11px] font-bold opacity-80">{saveError}</span>
          </div>
          <button onClick={() => setSaveError(null)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
            <Plus size={18} className="rotate-45" />
          </button>
        </motion.div>
      )}
    </div>
  );
};
