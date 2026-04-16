import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Ticket, 
  Save,
  X,
  Settings2,
  ArrowRight,
  Calendar,
  Image as ImageIcon,
  Upload,
  Tag,
  Percent,
  Globe,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Voucher {
  id: string;
  code: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  image?: string;
  cityId?: string;
  platforms: string[];
}

const CITIES = [
  { id: 'c1', name: 'Karachi' },
  { id: 'c2', name: 'Lahore' },
  { id: 'c3', name: 'Islamabad' },
];

const PLATFORMS = [
  { id: 'web', name: 'Web' },
  { id: 'ios', name: 'iOS' },
  { id: 'android', name: 'Android' },
];

const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    code: 'WELCOME50',
    description: 'Get 50% off on your first order',
    type: 'PERCENTAGE',
    value: 50,
    minOrderValue: 500,
    maxDiscount: 200,
    isActive: true,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    image: 'https://picsum.photos/seed/voucher1/800/200',
    cityId: 'c1',
    platforms: ['web', 'ios', 'android']
  },
  {
    id: 'v2',
    code: 'FLAT100',
    description: 'Flat 100 PKR off on orders above 1000',
    type: 'FIXED',
    value: 100,
    minOrderValue: 1000,
    isActive: true,
    startDate: '2024-03-01',
    endDate: '2024-06-30',
    image: 'https://picsum.photos/seed/voucher2/800/200',
    platforms: ['web']
  }
];

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const Vouchers: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState<Voucher | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNew = () => {
    const newVoucher: Voucher = {
      id: generateId('vouch'),
      code: '',
      description: '',
      type: 'PERCENTAGE',
      value: 0,
      minOrderValue: 0,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      platforms: ['web', 'ios', 'android']
    };
    setCurrentVoucher(newVoucher);
    setIsEditing(true);
  };

  const handleEdit = (voucher: Voucher) => {
    setCurrentVoucher({ ...voucher });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      setVouchers(vouchers.filter(v => v.id !== id));
      if (currentVoucher?.id === id) {
        setIsEditing(false);
        setCurrentVoucher(null);
      }
    }
  };

  const handleSave = async () => {
    if (!currentVoucher) return;
    if (!currentVoucher.code) {
      alert('Please enter a voucher code');
      return;
    }
    
    setIsSaving(true);
    const payload = {
      type: 'voucher',
      action: vouchers.find(v => v.id === currentVoucher.id) ? 'update' : 'create',
      data: currentVoucher,
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
        if (vouchers.find(v => v.id === currentVoucher.id)) {
          setVouchers(vouchers.map(v => v.id === currentVoucher.id ? currentVoucher : v));
        } else {
          setVouchers([...vouchers, currentVoucher]);
        }
        setIsEditing(false);
        setCurrentVoucher(null);
        alert('Voucher saved and submitted successfully!');
      } else {
        throw new Error('Failed to submit to webhook');
      }
    } catch (error) {
      console.error('Error saving voucher:', error);
      alert('Voucher saved locally, but webhook submission failed.');
      if (vouchers.find(v => v.id === currentVoucher.id)) {
        setVouchers(vouchers.map(v => v.id === currentVoucher.id ? currentVoucher : v));
      } else {
        setVouchers([...vouchers, currentVoucher]);
      }
      setIsEditing(false);
      setCurrentVoucher(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentVoucher) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentVoucher({
          ...currentVoucher,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredVouchers = vouchers.filter(v => 
    v.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
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
        <button 
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <Plus size={20} />
          Create New Voucher
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search vouchers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl shadow-sm outline-none transition-all dark:text-white"
            />
          </div>

          <div className="space-y-4">
            {filteredVouchers.map(voucher => (
              <motion.div 
                layout
                key={voucher.id}
                onClick={() => handleEdit(voucher)}
                className={`p-5 bg-white dark:bg-slate-900 rounded-[32px] border-2 transition-all cursor-pointer group ${currentVoucher?.id === voucher.id ? 'border-teal-500 shadow-lg' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center ${currentVoucher?.id === voucher.id ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {voucher.image ? (
                        <img src={voucher.image} alt={voucher.code} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Ticket size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{voucher.code}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {voucher.type === 'PERCENTAGE' ? `${voucher.value}% Off` : `${voucher.value} PKR Off`}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${voucher.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                    {voucher.isActive ? 'Active' : 'Draft'}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{voucher.startDate} - {voucher.endDate}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Management Section */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isEditing && currentVoucher ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                      <Settings2 size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">
                        {vouchers.find(v => v.id === currentVoucher.id) ? 'Edit Voucher' : 'New Voucher'}
                      </h2>
                      <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure voucher details and rules</p>
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
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Voucher Code</label>
                        <input 
                          type="text" 
                          value={currentVoucher.code}
                          onChange={(e) => setCurrentVoucher({...currentVoucher, code: e.target.value.toUpperCase()})}
                          placeholder="e.g. SAVE50"
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white font-mono"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                        <textarea 
                          value={currentVoucher.description}
                          onChange={(e) => setCurrentVoucher({...currentVoucher, description: e.target.value})}
                          placeholder="Describe this voucher..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none h-24 resize-none dark:text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Discount Type</label>
                          <select 
                            value={currentVoucher.type}
                            onChange={(e) => setCurrentVoucher({...currentVoucher, type: e.target.value as Voucher['type']})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                          >
                            <option value="PERCENTAGE">Percentage (%)</option>
                            <option value="FIXED">Fixed Amount (PKR)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Value</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                              {currentVoucher.type === 'PERCENTAGE' ? <Percent size={16} /> : <Tag size={16} />}
                            </div>
                            <input 
                              type="number" 
                              value={currentVoucher.value}
                              onChange={(e) => setCurrentVoucher({...currentVoucher, value: parseFloat(e.target.value) || 0})}
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl text-sm transition-all outline-none dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={16} className="text-teal-500" />
                            Voucher Banner
                          </h3>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold text-teal-500 uppercase tracking-widest hover:text-teal-600 transition-colors flex items-center gap-1"
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
                          {currentVoucher.image ? (
                            <>
                              <img src={currentVoucher.image} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                <button 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-2 bg-white text-slate-900 rounded-lg hover:scale-110 transition-transform"
                                >
                                  <Upload size={18} />
                                </button>
                                <button 
                                  onClick={() => setCurrentVoucher({...currentVoucher, image: undefined})}
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
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Enable or disable this voucher</p>
                          </div>
                          <button 
                            onClick={() => setCurrentVoucher({...currentVoucher, isActive: !currentVoucher.isActive})}
                            className={`w-14 h-8 rounded-full transition-all relative ${currentVoucher.isActive ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${currentVoucher.isActive ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Targeting Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                          <MapPin size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">City Targeting</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select City</label>
                        <select 
                          value={currentVoucher.cityId || ''}
                          onChange={(e) => setCurrentVoucher({...currentVoucher, cityId: e.target.value || undefined})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                        >
                          <option value="">All Cities</option>
                          {CITIES.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                          <Globe size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Platforms</h3>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {PLATFORMS.map(platform => (
                          <button
                            key={platform.id}
                            onClick={() => {
                              const platforms = currentVoucher.platforms.includes(platform.id)
                                ? currentVoucher.platforms.filter(p => p !== platform.id)
                                : [...currentVoucher.platforms, platform.id];
                              setCurrentVoucher({...currentVoucher, platforms});
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              currentVoucher.platforms.includes(platform.id)
                                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                            }`}
                          >
                            {platform.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Rules & Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                          <Settings2 size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Usage Rules</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Min Order Value</label>
                          <input 
                            type="number" 
                            value={currentVoucher.minOrderValue}
                            onChange={(e) => setCurrentVoucher({...currentVoucher, minOrderValue: parseFloat(e.target.value) || 0})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Max Discount</label>
                          <input 
                            type="number" 
                            value={currentVoucher.maxDiscount || ''}
                            onChange={(e) => setCurrentVoucher({...currentVoucher, maxDiscount: parseFloat(e.target.value) || undefined})}
                            placeholder="Optional"
                            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                          <Calendar size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Validity Period</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
                          <input 
                            type="date" 
                            value={currentVoucher.startDate}
                            onChange={(e) => setCurrentVoucher({...currentVoucher, startDate: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date</label>
                          <input 
                            type="date" 
                            value={currentVoucher.endDate}
                            onChange={(e) => setCurrentVoucher({...currentVoucher, endDate: e.target.value})}
                            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 md:p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <button 
                    onClick={() => handleDelete(currentVoucher.id)}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all"
                  >
                    <Trash2 size={20} />
                    Delete Voucher
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
                      <span>{isSaving ? 'Saving...' : 'Save Voucher'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 bg-teal-500/10 text-teal-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
                  <Ticket size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Select a Voucher to Configure</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-10">
                  Create discount codes for your customers. Set usage rules, validity periods, and minimum order requirements.
                </p>
                <button 
                  onClick={handleCreateNew}
                  className="flex items-center gap-3 px-8 py-4 bg-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all group"
                >
                  <Plus size={24} />
                  Create Your First Voucher
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
