import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Layout, 
  Save,
  X,
  Settings2,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  MousePointer2,
  Eye,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Banner {
  id: string;
  name: string;
  type: 'BANNER' | 'POPUP';
  placement: 'HOME_TOP' | 'HOME_MIDDLE' | 'CATEGORY_PAGE' | 'CHECKOUT';
  image: string;
  link?: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  priority: number;
  cityId?: string;
  branchId?: string;
}

const CITIES = [
  { id: 'c1', name: 'Karachi' },
  { id: 'c2', name: 'Lahore' },
  { id: 'c3', name: 'Islamabad' },
];

const BRANCHES = [
  { id: 'b1', name: 'DHA Phase 6', cityId: 'c1' },
  { id: 'b2', name: 'Gulshan-e-Iqbal', cityId: 'c1' },
  { id: 'b3', name: 'Gulberg', cityId: 'c2' },
  { id: 'b4', name: 'DHA Phase 5', cityId: 'c2' },
  { id: 'b5', name: 'F-7 Markaz', cityId: 'c3' },
];

const PLACEMENTS = [
  { id: 'HOME_TOP', label: 'Home Top Slider' },
  { id: 'HOME_MIDDLE', label: 'Home Middle Section' },
  { id: 'CATEGORY_PAGE', label: 'Category Pages' },
  { id: 'CHECKOUT', label: 'Checkout Page' },
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'b1',
    name: 'Summer Sale 2024',
    type: 'BANNER',
    placement: 'HOME_TOP',
    image: 'https://picsum.photos/seed/summer/1200/400',
    link: 'https://example.com/sale',
    isActive: true,
    priority: 1,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    cityId: 'c1',
    branchId: 'b1'
  },
  {
    id: 'b2',
    name: 'Welcome Discount Popup',
    type: 'POPUP',
    placement: 'HOME_TOP',
    image: 'https://picsum.photos/seed/welcome/600/600',
    link: '/signup',
    isActive: true,
    priority: 2
  }
];

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const Banners: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BANNER' | 'POPUP'>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNew = () => {
    const newBanner: Banner = {
      id: generateId('bn'),
      name: '',
      type: 'BANNER',
      placement: 'HOME_TOP',
      image: '',
      isActive: true,
      priority: 1,
      cityId: '',
      branchId: ''
    };
    setCurrentBanner(newBanner);
    setIsEditing(true);
  };

  const handleEdit = (banner: Banner) => {
    setCurrentBanner({ ...banner });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      setBanners(banners.filter(b => b.id !== id));
      if (currentBanner?.id === id) {
        setIsEditing(false);
        setCurrentBanner(null);
      }
    }
  };

  const handleSave = async () => {
    if (!currentBanner || !currentBanner.name || !currentBanner.image) {
      alert('Please provide a name and an image for the banner.');
      return;
    }
    
    setIsSaving(true);
    const payload = {
      type: 'banner_management',
      action: banners.find(b => b.id === currentBanner.id) ? 'update' : 'create',
      data: currentBanner,
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
        if (banners.find(b => b.id === currentBanner.id)) {
          setBanners(banners.map(b => b.id === currentBanner.id ? currentBanner : b));
        } else {
          setBanners([...banners, currentBanner]);
        }
        setIsEditing(false);
        setCurrentBanner(null);
        alert('Banner saved and submitted successfully!');
      } else {
        throw new Error('Failed to submit to webhook');
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Banner saved locally, but webhook submission failed.');
      if (banners.find(b => b.id === currentBanner.id)) {
        setBanners(banners.map(b => b.id === currentBanner.id ? currentBanner : b));
      } else {
        setBanners([...banners, currentBanner]);
      }
      setIsEditing(false);
      setCurrentBanner(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentBanner) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentBanner({
          ...currentBanner,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredBanners = banners.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || b.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
              <Layout className="text-white" size={32} />
            </div>
            Banners & Popups
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage promotional banners and engagement popups</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <Plus size={20} />
          Create New Asset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List Section - Visual Grid */}
        <div className="lg:col-span-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none transition-all dark:text-white text-sm"
              />
            </div>
            <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {(['ALL', 'BANNER', 'POPUP'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filterType === type ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBanners.map(banner => (
              <motion.div 
                layout
                key={banner.id}
                className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
              >
                {/* Image Preview */}
                <div className="relative aspect-[21/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {banner.image ? (
                    <img src={banner.image} alt={banner.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${banner.type === 'BANNER' ? 'bg-blue-500 text-white' : 'bg-purple-500 text-white'}`}>
                      {banner.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${banner.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                      {banner.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => handleEdit(banner)}
                      className="p-3 bg-white text-slate-900 rounded-2xl hover:scale-110 transition-transform shadow-xl"
                    >
                      <Settings2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(banner.id)}
                      className="p-3 bg-rose-500 text-white rounded-2xl hover:scale-110 transition-transform shadow-xl"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{banner.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        Placement: {PLACEMENTS.find(p => p.id === banner.placement)?.label}
                      </p>
                      {(banner.cityId || banner.branchId) && (
                        <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-0.5">
                          {banner.cityId && CITIES.find(c => c.id === banner.cityId)?.name}
                          {banner.branchId && ` • ${BRANCHES.find(b => b.id === banner.branchId)?.name}`}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Priority</p>
                      <p className="text-lg font-black text-indigo-500">#{banner.priority}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span className="text-xs font-bold">1.2k</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MousePointer2 size={14} />
                        <span className="text-xs font-bold">84</span>
                      </div>
                    </div>
                    {banner.link && (
                      <a href={banner.link} target="_blank" rel="noreferrer" className="text-indigo-500 hover:text-indigo-600 transition-colors">
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Editor Modal / Overlay */}
      <AnimatePresence>
        {isEditing && currentBanner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                    <Settings2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {banners.find(b => b.id === currentBanner.id) ? 'Edit Asset' : 'New Asset'}
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure asset visual and behavior</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:scale-110 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Left Column: Config */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Asset Name</label>
                      <input 
                        type="text" 
                        value={currentBanner.name}
                        onChange={(e) => setCurrentBanner({...currentBanner, name: e.target.value})}
                        placeholder="e.g. Summer Sale Banner"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Type</label>
                        <select 
                          value={currentBanner.type}
                          onChange={(e) => setCurrentBanner({...currentBanner, type: e.target.value as Banner['type']})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                        >
                          <option value="BANNER">Banner</option>
                          <option value="POPUP">Popup</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Priority</label>
                        <input 
                          type="number" 
                          value={currentBanner.priority}
                          onChange={(e) => setCurrentBanner({...currentBanner, priority: parseInt(e.target.value) || 1})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">City</label>
                        <select 
                          value={currentBanner.cityId || ''}
                          onChange={(e) => setCurrentBanner({...currentBanner, cityId: e.target.value, branchId: ''})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                        >
                          <option value="">All Cities</option>
                          {CITIES.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Branch</label>
                        <select 
                          value={currentBanner.branchId || ''}
                          onChange={(e) => setCurrentBanner({...currentBanner, branchId: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                          disabled={!currentBanner.cityId}
                        >
                          <option value="">All Branches</option>
                          {BRANCHES.filter(b => b.cityId === currentBanner.cityId).map(branch => (
                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Placement</label>
                      <select 
                        value={currentBanner.placement}
                        onChange={(e) => setCurrentBanner({...currentBanner, placement: e.target.value as Banner['placement']})}
                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                      >
                        {PLACEMENTS.map(p => (
                          <option key={p.id} value={p.id}>{p.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Action Link (Optional)</label>
                      <div className="relative">
                        <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          value={currentBanner.link || ''}
                          onChange={(e) => setCurrentBanner({...currentBanner, link: e.target.value})}
                          placeholder="https://..."
                          className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="date" 
                            value={currentBanner.startDate || ''}
                            onChange={(e) => setCurrentBanner({...currentBanner, startDate: e.target.value})}
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm transition-all outline-none dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                          <input 
                            type="date" 
                            value={currentBanner.endDate || ''}
                            onChange={(e) => setCurrentBanner({...currentBanner, endDate: e.target.value})}
                            className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl text-sm transition-all outline-none dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Preview & Status */}
                  <div className="space-y-8">
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                          <ImageIcon size={16} className="text-indigo-500" />
                          Creative Asset
                        </h3>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs font-bold text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors flex items-center gap-1"
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
                      
                      <div className={`w-full relative rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center group transition-all ${currentBanner.type === 'BANNER' ? 'aspect-[21/9]' : 'aspect-square max-w-[300px] mx-auto'}`}>
                        {currentBanner.image ? (
                          <>
                            <img src={currentBanner.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                              <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 bg-white text-slate-900 rounded-xl hover:scale-110 transition-transform"
                              >
                                <Upload size={20} />
                              </button>
                              <button 
                                onClick={() => setCurrentBanner({...currentBanner, image: ''})}
                                className="p-3 bg-rose-500 text-white rounded-xl hover:scale-110 transition-transform"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-slate-300">
                            <ImageIcon size={48} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">No Image Uploaded</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-6 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex gap-3">
                        <AlertCircle size={18} className="text-indigo-500 shrink-0" />
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {currentBanner.type === 'BANNER' 
                            ? 'Banners are displayed in a wide format. Recommended: 1920x600px.' 
                            : 'Popups are displayed in a square or portrait format. Recommended: 800x800px.'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Active Status</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Enable or pause this asset</p>
                        </div>
                        <button 
                          onClick={() => setCurrentBanner({...currentBanner, isActive: !currentBanner.isActive})}
                          className={`w-14 h-8 rounded-full transition-all relative ${currentBanner.isActive ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${currentBanner.isActive ? 'left-7' : 'left-1'}`}></div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between sticky bottom-0">
                <button 
                  onClick={() => handleDelete(currentBanner.id)}
                  className="flex items-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all"
                >
                  <Trash2 size={20} />
                  Delete Asset
                </button>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-10 py-4 bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save size={20} />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save Asset'}</span>
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
