import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Layers, 
  Save,
  X,
  Settings2,
  ArrowRight,
  Menu as MenuIcon,
  Image as ImageIcon,
  Upload,
  Clock,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSelector } from '../store/hooks';
import { selectToken } from '../store/selectors/appSelectors';
import { fetchCategories, addCategory, updateCategory, type ApiCategory } from '../services/categoriesApi';

interface Availability {
  day: string;
  enabled: boolean;
  slots: { start: string; end: string }[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  menuID: number;
  isActive: boolean;
  order: number;
  image?: string;
  availability: Availability[];
  // raw API fields preserved for save payload
  apiRaw?: ApiCategory;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_AVAILABILITY: Availability[] = DAYS.map(day => ({
  day,
  enabled: true,
  slots: [{ start: '00:00', end: '23:59' }]
}));

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const buildAvailabilityFromApi = (apiCat: ApiCategory): Availability[] => {
  const allDays = apiCat.Days === 'All';
  const timeStart = apiCat.startTime || '00:00';
  const timeEnd = (apiCat.endTime && apiCat.endTime !== '00:00') ? apiCat.endTime : '23:59';
  return DAYS.map(day => ({
    day,
    enabled: allDays,
    slots: [{ start: timeStart, end: timeEnd }],
  }));
};

const mapApiCategory = (apiCat: ApiCategory): Category => ({
  id: String(apiCat.ID),
  name: apiCat.Name,
  description: apiCat.Description || '',
  menuID: apiCat.menuID,
  isActive: apiCat.IsActive,
  order: apiCat.ORDER,
  image: apiCat.CategoryImage && apiCat.CategoryImage !== '' && apiCat.IsCategoryImageActive
    ? `https://adminapi.broadwaypizza.com.pk/images/category/${apiCat.CategoryImage}`
    : undefined,
  availability: buildAvailabilityFromApi(apiCat),
  apiRaw: apiCat,
});

export const Categories: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadCategories = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const apiCategories = await fetchCategories(token, false);
      setCategories(apiCategories.map(mapApiCategory).sort((a, b) => Number(b.id) - Number(a.id)));
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load categories.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleCreateNew = () => {
    const newCategory: Category = {
      id: generateId('cat'),
      name: '',
      description: '',
      menuID: 0,
      isActive: true,
      order: categories.length + 1,
      availability: DEFAULT_AVAILABILITY
    };
    setCurrentCategory(newCategory);
    setIsEditing(true);
  };

  const handleEdit = (category: Category) => {
    setCurrentCategory({ ...category });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(c => c.id !== id));
      if (currentCategory?.id === id) {
        setIsEditing(false);
        setCurrentCategory(null);
      }
    }
  };

  const handleSave = async () => {
    if (!currentCategory || !token) return;

    const isNew = !currentCategory.apiRaw;

    if (!currentCategory.name.trim()) {
      alert('Category name is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (isNew) {
        const firstEnabled = currentCategory.availability.find(a => a.enabled);
        const startTime = firstEnabled?.slots[0]?.start ?? '00:00';
        const endTime = firstEnabled?.slots[0]?.end ?? '00:00';
        const allEnabled = currentCategory.availability.every(a => a.enabled);
        const days = allEnabled
          ? 'All'
          : currentCategory.availability.filter(a => a.enabled).map(a => a.day).join(',');

        await addCategory(token, {
          id: 0,
          menuID: currentCategory.menuID || 4109,
          name: currentCategory.name.trim(),
          description: currentCategory.description,
          isActive: currentCategory.isActive,
          order: currentCategory.order,
          startTime,
          endTime,
          startTime1: '00:00',
          endTime1: '00:00',
          days,
          outlets: 'All',
        });

        await loadCategories();
        setIsEditing(false);
        setCurrentCategory(null);
      } else {
        const firstEnabled = currentCategory.availability.find(a => a.enabled);
        const startTime = firstEnabled?.slots[0]?.start ?? '00:00';
        const endTime = firstEnabled?.slots[0]?.end ?? '00:00';
        const allEnabled = currentCategory.availability.every(a => a.enabled);
        const days = allEnabled
          ? 'All'
          : currentCategory.availability.filter(a => a.enabled).map(a => a.day).join(',');

        await updateCategory(token, {
          id: Number(currentCategory.id),
          menuID: currentCategory.menuID || 4109,
          name: currentCategory.name.trim(),
          description: currentCategory.description,
          isActive: currentCategory.isActive,
          order: currentCategory.order,
          startTime,
          endTime,
          startTime1: '00:00',
          endTime1: '00:00',
          days,
          outlets: 'All',
        });

        await loadCategories();
        setIsEditing(false);
        setCurrentCategory(null);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error instanceof Error ? error.message : 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentCategory) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentCategory({
          ...currentCategory,
          image: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
              <Layers className="text-white" size={32} />
            </div>
            Category Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Organize your menu items into logical categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadCategories}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl font-bold border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <Plus size={20} />
            Create New Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl shadow-sm outline-none transition-all dark:text-white"
            />
          </div>

          {loadError && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-sm font-medium">{loadError}</p>
            </div>
          )}

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-5 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-transparent shadow-sm animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                      <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))
            ) : !isLoading && filteredCategories.map(category => (
              <motion.div 
                layout
                key={category.id}
                onClick={() => handleEdit(category)}
                className={`p-5 bg-white dark:bg-slate-900 rounded-[32px] border-2 transition-all cursor-pointer group ${currentCategory?.id === category.id ? 'border-teal-500 shadow-lg' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center ${currentCategory?.id === category.id ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <Layers size={20} className="text-slate-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{category.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Order #{category.order}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${category.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                    {category.isActive ? 'Active' : 'Draft'}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {category.menuID > 0 && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-teal-500/10 text-teal-500 rounded-lg border border-teal-500/20 flex items-center gap-1">
                      <MenuIcon size={10} />
                      Menu #{category.menuID}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Management Section */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isEditing && currentCategory ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                      <Settings2 size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {currentCategory.id ? 'Edit Category' : 'New Category'}
                      </h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure category details and assignments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-8 space-y-10">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category Name</label>
                        <input 
                          type="text" 
                          value={currentCategory.name}
                          onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                          placeholder="e.g. Main Courses"
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                        <textarea 
                          value={currentCategory.description}
                          onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                          placeholder="Describe this category..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none h-32 resize-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                            <ImageIcon size={16} className="text-teal-500" />
                            Category Banner
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
                          {currentCategory.image ? (
                            <>
                              <img src={currentCategory.image} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                                <button 
                                  onClick={() => fileInputRef.current?.click()}
                                  className="p-2 bg-white text-slate-900 rounded-lg hover:scale-110 transition-transform"
                                >
                                  <Upload size={18} />
                                </button>
                                <button 
                                  onClick={() => setCurrentCategory({...currentCategory, image: undefined})}
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
                        <p className="mt-4 text-[10px] text-slate-500 leading-relaxed text-center">Recommended size: 1200x300px (4:1 aspect ratio)</p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Active Status</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Enable or disable this category</p>
                          </div>
                          <button 
                            onClick={() => setCurrentCategory({...currentCategory, isActive: !currentCategory.isActive})}
                            className={`w-14 h-8 rounded-full transition-all relative ${currentCategory.isActive ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${currentCategory.isActive ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Info */}
                  {currentCategory.menuID > 0 && (
                    <div className="flex items-center gap-3 p-4 bg-teal-500/5 border border-teal-500/20 rounded-2xl">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                        <MenuIcon size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Associated Menu</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Menu ID: {currentCategory.menuID}</p>
                      </div>
                    </div>
                  )}

                  {/* Availability Schedule */}
                  <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                          <Clock size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Availability Schedule</h3>
                      </div>
                      <button 
                        onClick={() => {
                          const firstDay = currentCategory.availability[0];
                          setCurrentCategory({
                            ...currentCategory,
                            availability: currentCategory.availability.map(a => ({
                              ...a,
                              enabled: firstDay.enabled,
                              slots: [...firstDay.slots.map(s => ({ ...s }))]
                            }))
                          });
                        }}
                        className="text-xs font-bold text-teal-500 uppercase tracking-widest hover:text-teal-600 transition-colors flex items-center gap-1"
                      >
                        Apply Monday to all
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {currentCategory.availability.map((dayAvail, idx) => (
                        <div 
                          key={dayAvail.day}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${dayAvail.enabled ? 'border-teal-500/20 bg-teal-500/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 opacity-60'}`}
                        >
                          <div className="flex items-center gap-4 min-w-[140px]">
                            <button 
                              onClick={() => {
                                const newAvail = [...currentCategory.availability];
                                newAvail[idx] = { ...dayAvail, enabled: !dayAvail.enabled };
                                setCurrentCategory({ ...currentCategory, availability: newAvail });
                              }}
                              className={`w-10 h-6 rounded-full transition-all relative ${dayAvail.enabled ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${dayAvail.enabled ? 'left-5' : 'left-1'}`}></div>
                            </button>
                            <span className="font-bold text-slate-900 dark:text-white">{dayAvail.day}</span>
                          </div>

                          <div className="flex-1 flex flex-wrap items-center gap-3">
                            {dayAvail.enabled ? (
                              dayAvail.slots.map((slot, sIdx) => (
                                <div key={sIdx} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm group/slot relative">
                                  <input 
                                    type="time" 
                                    value={slot.start}
                                    onChange={(e) => {
                                      const newAvail = [...currentCategory.availability];
                                      newAvail[idx].slots[sIdx].start = e.target.value;
                                      setCurrentCategory({ ...currentCategory, availability: newAvail });
                                    }}
                                    className="bg-transparent text-xs font-bold dark:text-white outline-none"
                                  />
                                  <span className="text-slate-400 text-[10px] font-bold">TO</span>
                                  <input 
                                    type="time" 
                                    value={slot.end}
                                    onChange={(e) => {
                                      const newAvail = [...currentCategory.availability];
                                      newAvail[idx].slots[sIdx].end = e.target.value;
                                      setCurrentCategory({ ...currentCategory, availability: newAvail });
                                    }}
                                    className="bg-transparent text-xs font-bold dark:text-white outline-none"
                                  />
                                  {dayAvail.slots.length > 1 && (
                                    <button 
                                      onClick={() => {
                                        const newAvail = [...currentCategory.availability];
                                        newAvail[idx].slots = newAvail[idx].slots.filter((_, i) => i !== sIdx);
                                        setCurrentCategory({ ...currentCategory, availability: newAvail });
                                      }}
                                      className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-all scale-75 hover:scale-100"
                                    >
                                      <X size={10} />
                                    </button>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Closed / Unavailable</span>
                            )}
                            
                            {dayAvail.enabled && (
                              <button 
                                onClick={() => {
                                  const newAvail = [...currentCategory.availability];
                                  newAvail[idx].slots.push({ start: '09:00', end: '17:00' });
                                  setCurrentCategory({ ...currentCategory, availability: newAvail });
                                }}
                                className="p-2 text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all"
                                title="Add Time Slot"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button 
                    onClick={() => handleDelete(currentCategory.id)}
                    className="flex items-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all"
                  >
                    <Trash2 size={20} />
                    Delete Category
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
                      className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-white dark:border-slate-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save size={20} />
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save Category'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 bg-teal-500/10 text-teal-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
                  <Layers size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Select a Category to Configure</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-10">
                  Organize your items into categories and assign them to specific menus for better navigation.
                </p>
                <button 
                  onClick={handleCreateNew}
                  className="flex items-center gap-3 px-8 py-4 bg-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all group"
                >
                  <Plus size={24} />
                  Create Your First Category
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
