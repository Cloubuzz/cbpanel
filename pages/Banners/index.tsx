import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Eye,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';
import { fetchOutletList } from '../../services/outletsApi';
import {
  fetchBanners,
  addBanner,
  updateBanner,
  deleteBanner,
  ApiBanner
} from '../../services/bannersApi';

interface Banner {
  id: number;
  city: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  days: string;
  order: number;
  startTime: string;
  endTime: string;
  imageType: string; // Banner, Popup
  channel: string; // Web, App
  link1: string;
}

export const Banners: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'BANNER' | 'POPUP'>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mapApiBannerToBanner = useCallback((b: ApiBanner): Banner => {
    const cleanString = (val: any): string => {
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') {
        if (Object.keys(val).length === 0) return '';
        return JSON.stringify(val);
      }
      return String(val);
    };

    let img = cleanString(b.ImageURL);
    if (img && !img.startsWith('http://') && !img.startsWith('https://')) {
      img = 'https://services-pizzamax.cloubuzz.com' + (img.startsWith('/') ? '' : '/') + img;
    }
    return {
      id: b.ID || 0,
      city: cleanString(b.City) || 'All',
      imageUrl: img,
      link: cleanString(b.Link),
      isActive: !!b.IsActive,
      days: cleanString(b.Days) || 'All',
      order: typeof b.Order === 'number' ? b.Order : (parseInt(cleanString(b.Order)) || 0),
      startTime: cleanString(b.StartTime) || '0',
      endTime: cleanString(b.EndTime) || '24',
      imageType: cleanString(b.ImageType) || 'Banner',
      channel: cleanString(b.Channel) || 'Web',
      link1: cleanString(b.Link1)
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const bannerData = await fetchBanners(token);
      setBanners(bannerData.map(mapApiBannerToBanner));

      const outlets = await fetchOutletList(token);
      const uniqueCities = Array.from(new Set(outlets.map(o => o.city).filter(Boolean)));
      setCities(uniqueCities);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load banners.');
    } finally {
      setIsLoading(false);
    }
  }, [token, mapApiBannerToBanner]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateNew = () => {
    const newBanner: Banner = {
      id: 0,
      city: 'All',
      imageUrl: '',
      link: '',
      isActive: true,
      days: 'All',
      order: banners.length + 1,
      startTime: '0',
      endTime: '24',
      imageType: 'Banner',
      channel: 'Web',
      link1: ''
    };
    setCurrentBanner(newBanner);
    setIsEditing(true);
  };

  const handleEdit = (banner: Banner) => {
    setCurrentBanner({ ...banner });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(token, id);
        setBanners(banners.filter(b => b.id !== id));
        if (currentBanner?.id === id) {
          setIsEditing(false);
          setCurrentBanner(null);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete banner.');
      }
    }
  };

  const handleSave = async () => {
    if (!token || !currentBanner) return;
    if (!currentBanner.imageUrl) {
      alert('Please upload an image.');
      return;
    }

    const payload: ApiBanner = {
      ID: currentBanner.id !== 0 ? currentBanner.id : undefined,
      City: currentBanner.city,
      ImageURL: currentBanner.imageUrl,
      Link: currentBanner.link,
      IsActive: currentBanner.isActive,
      Days: currentBanner.days,
      Order: currentBanner.order,
      StartTime: currentBanner.startTime,
      EndTime: currentBanner.endTime,
      ImageType: currentBanner.imageType,
      Channel: currentBanner.channel,
      Link1: currentBanner.link1
    };

    try {
      if (currentBanner.id !== 0) {
        await updateBanner(token, payload);
      } else {
        await addBanner(token, payload);
      }
      await loadData();
      setIsEditing(false);
      setCurrentBanner(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save banner.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentBanner) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentBanner({
          ...currentBanner,
          imageUrl: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredBanners = banners.filter(b => {
    const matchesSearch = b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.imageType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.channel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || b.imageType.toUpperCase() === filterType;
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
            Banner Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage app & web promotional banners and popup advertisements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-indigo-500 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={20} />
            Add New Banner
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-40">
          <RefreshCw size={40} className="animate-spin text-indigo-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={40} />
          <p>{error}</p>
          <button onClick={loadData} className="px-4 py-2 bg-indigo-500 text-white rounded-xl">Try Again</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-12 space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Search by city, type, or channel..."
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

            {filteredBanners.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center gap-2 text-slate-400 py-16">
                <Layout size={32} className="opacity-50" />
                <p className="text-sm font-medium">No banners found.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBanners.map(banner => (
                <motion.div
                  layout
                  key={banner.id}
                  className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
                >
                  {/* Image Preview */}
                  <div className="relative aspect-[21/9] overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {banner.imageUrl ? (
                      <img src={banner.imageUrl} alt={banner.city} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg bg-blue-500 text-white">
                        {banner.imageType}
                      </span>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg bg-indigo-500 text-white">
                        {banner.channel}
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
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">City: {banner.city}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          Active Hours: {banner.startTime}:00 - {banner.endTime}:00
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          Days: {banner.days}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order</p>
                        <p className="text-lg font-black text-indigo-500">#{banner.order}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-slate-400">
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span className="text-xs font-bold">Views Active</span>
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
      )}

      {/* Editor Modal */}
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
                      {currentBanner.id !== 0 ? 'Edit Banner' : 'Add New Banner'}
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure banner details</p>
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
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">City</label>
                        <select
                          value={currentBanner.city}
                          onChange={(e) => setCurrentBanner({...currentBanner, city: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                        >
                          <option value="All">All</option>
                          {cities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Order</label>
                        <input
                          type="number"
                          value={currentBanner.order}
                          onChange={(e) => setCurrentBanner({...currentBanner, order: parseInt(e.target.value) || 0})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image Type</label>
                        <select
                          value={currentBanner.imageType}
                          onChange={(e) => setCurrentBanner({...currentBanner, imageType: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                        >
                          <option value="Banner">Banner</option>
                          <option value="Popup">Popup</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Channel</label>
                        <select
                          value={currentBanner.channel}
                          onChange={(e) => setCurrentBanner({...currentBanner, channel: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                        >
                          <option value="Web">Web</option>
                          <option value="App">App</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Hour (0-24)</label>
                        <input
                          type="text"
                          value={currentBanner.startTime}
                          onChange={(e) => setCurrentBanner({...currentBanner, startTime: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Hour (0-24)</label>
                        <input
                          type="text"
                          value={currentBanner.endTime}
                          onChange={(e) => setCurrentBanner({...currentBanner, endTime: e.target.value})}
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Days</label>
                      <input
                        type="text"
                        value={currentBanner.days}
                        onChange={(e) => setCurrentBanner({...currentBanner, days: e.target.value})}
                        placeholder="e.g. All, or Mon,Tue,Wed"
                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Link URL</label>
                      <input
                        type="text"
                        value={currentBanner.link}
                        onChange={(e) => setCurrentBanner({...currentBanner, link: e.target.value})}
                        placeholder="https://..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Alternative Link (Link1)</label>
                      <input
                        type="text"
                        value={currentBanner.link1}
                        onChange={(e) => setCurrentBanner({...currentBanner, link1: e.target.value})}
                        placeholder="https://..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Right Column: Preview & Status */}
                  <div className="space-y-8">
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                          <ImageIcon size={16} className="text-indigo-500" />
                          Banner Image
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

                      <div className={`w-full relative rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center group transition-all ${currentBanner.imageType === 'Banner' ? 'aspect-[21/9]' : 'aspect-square max-w-[300px] mx-auto'}`}>
                        {currentBanner.imageUrl ? (
                          <>
                            <img src={currentBanner.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 bg-white text-slate-900 rounded-xl hover:scale-110 transition-transform"
                              >
                                <Upload size={20} />
                              </button>
                              <button
                                onClick={() => setCurrentBanner({...currentBanner, imageUrl: ''})}
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
                          Recommended format for banners: 1920x600px. Popups: 800x800px.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Active Status</p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Enable or pause this banner</p>
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
                {currentBanner.id !== 0 ? (
                  <button
                    onClick={() => handleDelete(currentBanner.id)}
                    className="flex items-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all"
                  >
                    <Trash2 size={20} />
                    Delete Banner
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-10 py-4 bg-indigo-500 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Save size={20} />
                    <span>Save Banner</span>
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
