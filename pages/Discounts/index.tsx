import React, { useState } from 'react';
import { Plus, Tag, ArrowRight } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { DiscountList } from './components/DiscountList';
import { DiscountEditor } from './components/DiscountEditor';
import { INITIAL_DISCOUNTS, generateId } from './constants';
import type { Discount } from './types';

export const Discounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<Discount[]>(INITIAL_DISCOUNTS);
  const [current, setCurrent] = useState<Discount | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = discounts.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNew = () => {
    setCurrent({ id: generateId('disc'), name: '', description: '', type: 'PERCENTAGE', value: 0, isActive: true, startDate: new Date().toISOString().split('T')[0], endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] });
    setIsEditing(true);
  };

  const handleDelete = () => {
    if (!current) return;
    if (!window.confirm('Are you sure you want to delete this discount?')) return;
    setDiscounts(prev => prev.filter(d => d.id !== current.id));
    setIsEditing(false);
    setCurrent(null);
  };

  const handleSave = () => {
    if (!current) return;
    if (!current.name) { alert('Please enter a discount name'); return; }
    const isNew = !discounts.find(d => d.id === current.id);
    setDiscounts(prev => isNew ? [...prev, current] : prev.map(d => d.id === current.id ? current : d));
    setIsEditing(false);
    setCurrent(null);
  };

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20"><Tag className="text-white md:w-8 md:h-8" size={24} /></div>
            Discount Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Configure store-wide or targeted discounts</p>
        </div>
        <button onClick={handleCreateNew} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95">
          <Plus size={20} /> Create New Discount
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <DiscountList discounts={filtered} selectedId={current?.id} searchQuery={searchQuery} onSearchChange={setSearchQuery} onSelect={d => { setCurrent({ ...d }); setIsEditing(true); }} />
        </div>

        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isEditing && current ? (
              <DiscountEditor
                key={current.id}
                discount={current}
                isNew={!discounts.find(d => d.id === current.id)}
                onChange={setCurrent}
                onSave={handleSave}
                onDelete={handleDelete}
                onCancel={() => { setIsEditing(false); setCurrent(null); }}
              />
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-8 animate-bounce"><Tag size={48} /></div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Select a Discount to Configure</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-10">Create store-wide or targeted discounts. Set values, schedules, and active status to drive more sales.</p>
                <button onClick={handleCreateNew} className="flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all group">
                  <Plus size={24} /> Create Your First Discount <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
