import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Tag, 
  Save,
  X,
  Settings2,
  ArrowRight,
  Calendar,
  Image as ImageIcon,
  Upload,
  Percent,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Discount {
  id: string;
  name: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  image?: string;
}

const INITIAL_DISCOUNTS: Discount[] = [
  {
    id: 'd1',
    name: 'Ramadan Special',
    description: 'Special 20% off on all items during Ramadan',
    type: 'PERCENTAGE',
    value: 20,
    isActive: true,
    startDate: '2024-03-10',
    endDate: '2024-04-10',
    image: 'https://picsum.photos/seed/discount1/800/200'
  },
  {
    id: 'd2',
    name: 'Weekend Blast',
    description: 'Flat 50 PKR off on every order this weekend',
    type: 'FIXED',
    value: 50,
    isActive: false,
    startDate: '2024-05-01',
    endDate: '2024-05-03',
    image: 'https://picsum.photos/seed/discount2/800/200'
  }
];

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const Discounts: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>(INITIAL_DISCOUNTS);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDiscount, setCurrentDiscount] = useState<Discount | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNew = () => {
    const newDiscount: Discount = {
      id: generateId('disc'),
      name: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    setCurrentDiscount(newDiscount);
    setIsEditing(true);
  };

  const handleEdit = (discount: Discount) => {
    setCurrentDiscount({ ...discount });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this discount?')) {
      setDiscounts(discounts.filter(d => d.id !== id));
      if (currentDiscount?.id === id) {
        setIsEditing(false);
        setCurrentDiscount(null);
      }
    }
  };

  const handleSave = async () => {
    if (!currentDiscount) return;
    if (!currentDiscount.name) {
      alert('Please enter a discount name');
      return;
    }
    
    setIsSaving(true);
    const payload = {
      type: 'discount',
      action: discounts.find(d => d.id === currentDiscount.id) ? 'update' : 'create',
      data: currentDiscount,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch('https://automate.megnus.app/webhook/bwv3api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (discounts.find(d => d.id === currentDiscount.id)) {
          setDiscounts(discounts.map(d => d.id === currentDiscount.id ? currentDiscount : d));
        } else {
          setDiscounts([...discounts, currentDiscount]);
        }
        setIsEditing(false);
        setCurrentDiscount(null);
        alert('Discount saved and submitted successfully!');
      } else {
        throw new Error('Failed to submit to webhook');
      }
    } catch (error) {
      console.error('Error saving discount:', error);
      alert('Discount saved locally, but webhook submission failed.');
      if (discounts.find(d => d.id === currentDiscount.id)) {
        setDiscounts(discounts.map(d => d.id === currentDiscount.id ? currentDiscount : d));
      } else {
        setDiscounts([...discounts, currentDiscount]);
      }
      setIsEditing(false);
      setCurrentDiscount(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentDiscount) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentDiscount({
          ...currentDiscount,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredDiscounts = discounts.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
              <Tag className="text-white md:w-8 md:h-8" size={24} />
            </div>
            Discount Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Configure store-wide or targeted discounts</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95"
        >
          <Plus size={20} />
          Create New Discount
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search discounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-amber-500 rounded-2xl shadow-sm outline-none transition-all dark:text-white"
            />
          </div>

          <div className="space-y-4">
            {filteredDiscounts.map(discount => (
              <motion.div 
                layout
                key={discount.id}
                onClick={() => handleEdit(discount)}
                className={`p-5 bg-white dark:bg-slate-900 rounded-[32px] border-2 transition-all cursor-pointer group ${currentDiscount?.id === discount.id ? 'border-amber-500 shadow-lg' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center ${currentDiscount?.id === discount.id ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {discount.image ? (
                        <img src={discount.image} alt={discount.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Tag size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{discount.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {discount.type === 'PERCENTAGE' ? `${discount.value}% Off` : `${discount.value} PKR Off`}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${discount.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                    {discount.isActive ? 'Active' : 'Draft'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{discount.startDate} - {discount.endDate}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Management Section */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isEditing && currentDiscount ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Settings2 size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">
                        {discounts.find(d => d.id === currentDiscount.id) ? 'Edit Discount' : 'New Discount'}
                      </h2>
                      <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure discount parameters and schedule</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="p-5 md:p-8 space-y-8 md:space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Discount Name</label>
                        <input 
                          type="text" 
                          value={currentDiscount.name}
                          onChange={(e) => setCurrentDiscount({...currentDiscount, name: e.target.value})}
                          placeholder="e.g. Ramadan Special"
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                        <textarea 
                          value={currentDiscount.description}
                          onChange={(e) => setCurrentDiscount({...currentDiscount, description: e.target.value})}
                          placeholder="Describe this discount..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none h-24 resize-none dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Discount Type</label>
                          <select 
                            value={currentDiscount.type}
                            onChange={(e) => setCurrentDiscount({...currentDiscount, type: e.target.value as Discount['type']})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                          >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (PKR)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Value</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              {currentDiscount.type === 'PERCENTAGE' ? <Percent size={16} /> : <Tag size={16} />}
                            </div>
                            <input 
                              type="number" 
                              value={currentDiscount.value}
                              onChange={(e) => setCurrentDiscount({...currentDiscount, value: parseFloat(e.target.value) || 0})}
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl text-sm transition-all outline-none dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={16} className="text-amber-500" />
                            Discount Banner
                          </h3>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-amber-500 uppercase tracking-widest hover:text-amber-600 transition-colors flex items-center gap-1"
                          >
                            <Upload size={14} />
                            Upload
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                        
                        <div className="w-full aspect-[4/1] rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center group relative">
                          {currentDiscount.image ? (
                            <>
                              <img src={currentDiscount.image} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                <button 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-2 bg-white text-slate-900 rounded-lg hover:scale-110 transition-transform"
                                >
                                  <Upload size={18} />
                                </button>
                                <button 
                                  onClick={() => setCurrentDiscount({...currentDiscount, image: undefined})}
                                  className="p-2 bg-rose-500 text-white rounded-lg hover:scale-110 transition-transform"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-300">
                              <ImageIcon size={32} />
                              <span className="text-[10px] font-bold uppercase tracking-widest">No Banner Image</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Active Status</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Enable or disable this discount</p>
                          </div>
                          <button 
                            onClick={() => setCurrentDiscount({...currentDiscount, isActive: !currentDiscount.isActive})}
                            className={`w-14 h-8 rounded-full transition-all relative ${currentDiscount.isActive ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${currentDiscount.isActive ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Validity Period */}
                  <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                        <Calendar size={18} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Validity Period</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
                        <input 
                          type="date" 
                          value={currentDiscount.startDate}
                          onChange={(e) => setCurrentDiscount({...currentDiscount, startDate: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date</label>
                        <input 
                          type="date" 
                          value={currentDiscount.endDate}
                          onChange={(e) => setCurrentDiscount({...currentDiscount, endDate: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex gap-3">
                      <AlertCircle size={18} className="text-amber-500 shrink-0" />
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Store-wide discounts are applied automatically to all eligible items during the validity period. Ensure your start and end dates are correct to avoid overlapping promotions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <button 
                    onClick={() => handleDelete(currentDiscount.id)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all"
                  >
                    <Trash2 size={20} />
                    Delete Discount
                  </button>
                  <div className="w-full md:w-auto flex items-center gap-4">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 md:flex-none px-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save Discount'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
                  <Tag size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Select a Discount to Configure</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-10">
                  Create store-wide or targeted discounts. Set values, schedules, and active status to drive more sales.
                </p>
                <button 
                  onClick={handleCreateNew}
                  className="flex items-center gap-3 px-8 py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all group"
                >
                  <Plus size={24} />
                  Create Your First Discount
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
