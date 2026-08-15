import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Image as ImageIcon,
  Clock,
  Tag,
  CheckCircle2,
  XCircle,
  Pizza,
  Save,
  X,
  Calendar,
  DollarSign,
  Users,
  Info,
  Layers,
  Upload,
  RefreshCw,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';
import { addMenuItem, updateMenuItem, fetchMenuItemById } from '../../services/menuItemsApi';
import { useMenuItemsData } from './hooks/useMenuItemsData';
import { SortableModifierItem } from './components/SortableModifierItem';
import { SortableSizeItem } from './components/SortableSizeItem';
import type { MenuItem, MenuSize } from './types';
import { DAYS, PAGE_SIZE } from './constants';
import { mapMenuItemToAddPayload, mapMenuItemToUpdatePayload, mapApiMenuItem, formatMenuItemImageUrl } from './utils';
import { HistoryTab } from '../../components/HistoryTab';

export const MenuItems: React.FC = () => {
  const token = useAppSelector(selectToken);
  const {
    items,
    categories,
    isLoading,
    loadError,
    filterOnlyActive,
    setFilterOnlyActive,
    filterCategoryId,
    setFilterCategoryId,
    currentPage,
    setCurrentPage,
    searchTerm,
    setSearchTerm,
    modifierGroups,
    loadItems,
  } = useMenuItemsData(token);

  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingPopup, setIsDraggingPopup] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [activeSizeId, setActiveSizeId] = useState<string | null>(null);
  const [modifierSearch, setModifierSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'history'>('config');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputPopupRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleCreateNew = () => {
    const defaultCat = categories.length > 0 ? categories[0] : null;
    setCurrentItem({
      name: '',
      categoryID: defaultCat ? defaultCat.ID : 0,
      category: defaultCat ? defaultCat.Name : '',
      remoteCode: '',
      description: '',
      order: 0,
      image: '',
      serving: 1,
      specialDealText: '',
      timerEndTime: '00:00',
      newItemText: '',
      tags: [],
      isActive: true,
      isSuggestive: false,
      isNewItem: false,
      showDescription: true,
      startTime: '00:00',
      endTime: '00:00',
      availableDays: DAYS,
      sizes: [],
    });
    setActiveTab('config');
    setView('editor');
  };

  const handleEdit = async (item: MenuItem) => {
    setCurrentItem(item);
    setActiveTab('config');
    setView('editor');
    if (token && item.id) {
      try {
        const fullItem = await fetchMenuItemById(token, item.id);
        if (fullItem) {
          const mapped = mapApiMenuItem(fullItem);
          setCurrentItem(mapped);
        }
      } catch (err) {
        console.error('Failed to load item details:', err);
      }
    }
  };

  const handleSave = async () => {
    if (!currentItem || !token) return;
    if (!currentItem.name?.trim()) {
      alert('Item name is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (currentItem.id) {
        await updateMenuItem(token, mapMenuItemToUpdatePayload(currentItem as MenuItem));
      } else {
        await addMenuItem(token, mapMenuItemToAddPayload(currentItem));
      }
      setView('list');
      setCurrentItem(null);
      await loadItems();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save menu item.');
    } finally {
      setIsSaving(false);
    }
  };

  const addSize = () => {
    if (currentItem) {
      const newSize: MenuSize = {
        id: Math.random().toString(36).substr(2, 9),
        size: '', price: 0, originalPrice: 0, pickupPrice: 0, originalDisplayPrice: 0,
        halfNHalf: false, modifierGroups: [],
      };
      setCurrentItem({ ...currentItem, sizes: [...(currentItem.sizes || []), newSize] });
    }
  };

  const removeSize = (id: string) => {
    if (currentItem) {
      setCurrentItem({ ...currentItem, sizes: currentItem.sizes?.filter(s => s.id !== id) });
    }
  };

  const updateSize = (id: string, updates: Partial<MenuSize>) => {
    if (currentItem) {
      setCurrentItem({ ...currentItem, sizes: currentItem.sizes?.map(s => s.id === id ? { ...s, ...updates } : s) });
    }
  };

  const toggleModifierGroup = (sizeId: string, groupId: string) => {
    if (!currentItem) return;
    const updatedSizes = currentItem.sizes?.map(size => {
      if (size.id === sizeId) {
        const groups = size.modifierGroups || [];
        const updatedGroups = groups.includes(groupId)
          ? groups.filter(id => id !== groupId)
          : [...groups, groupId];
        return { ...size, modifierGroups: updatedGroups };
      }
      return size;
    });
    setCurrentItem({ ...currentItem, sizes: updatedSizes });
  };

  const handleSortModifiers = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && activeSizeId && currentItem) {
      const updatedSizes = currentItem.sizes?.map(size => {
        if (size.id === activeSizeId) {
          const oldIndex = size.modifierGroups?.indexOf(active.id as string) ?? -1;
          const newIndex = size.modifierGroups?.indexOf(over?.id as string) ?? -1;
          if (oldIndex !== -1 && newIndex !== -1) {
            return { ...size, modifierGroups: arrayMove(size.modifierGroups!, oldIndex, newIndex) };
          }
        }
        return size;
      });
      setCurrentItem({ ...currentItem, sizes: updatedSizes });
    }
  };

  const handleSortSizes = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && currentItem?.sizes) {
      const oldIndex = currentItem.sizes.findIndex(s => s.id === active.id);
      const newIndex = currentItem.sizes.findIndex(s => s.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setCurrentItem({ ...currentItem, sizes: arrayMove(currentItem.sizes, oldIndex, newIndex) });
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { alert('File size too large. Max 5MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setCurrentItem(prev => ({ ...prev, image: reader.result as string })); };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentItem(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImagePopupUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processPopupFile(file);
  };

  const processPopupFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { alert('File size too large. Max 5MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setCurrentItem(prev => (prev ? { ...prev, imagePopup: reader.result as string } : null)); };
    reader.readAsDataURL(file);
  };

  const handlePopupDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDraggingPopup(true); };
  const handlePopupDragLeave = () => setIsDraggingPopup(false);
  const handlePopupDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPopup(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processPopupFile(file);
  };

  const removeImagePopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentItem(prev => (prev ? { ...prev, imagePopup: '' } : null));
    if (fileInputPopupRef.current) fileInputPopupRef.current.value = '';
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!currentItem?.tags?.includes(newTag.trim())) {
        setCurrentItem(prev => ({ ...prev, tags: [...(prev?.tags || []), newTag.trim()] }));
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentItem(prev => ({ ...prev, tags: prev?.tags?.filter(t => t !== tagToRemove) }));
  };

  const filteredItems = items;

  if (view === 'list') {
    return (
      <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <div className="p-2 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
                  <Pizza className="text-white" size={32} />
                </div>
                Menu Items
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your restaurant's digital menu and pricing</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={loadItems} disabled={isLoading} className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-2xl font-bold border border-slate-200 dark:border-slate-800 hover:border-teal-500 transition-all disabled:opacity-50" title="Refresh">
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button onClick={handleCreateNew} className="flex items-center justify-center gap-2 px-6 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-500 transition-all shadow-xl shadow-teal-900/20 hover:-translate-y-1 active:scale-95">
                <Plus size={20} /> Add New Item
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 transition-all" />
            </div>
            <select value={filterCategoryId === undefined ? '' : String(filterCategoryId)} onChange={(e) => { setFilterCategoryId(e.target.value === '' ? undefined : Number(e.target.value)); setCurrentPage(1); }} className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 border-none outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.ID} value={cat.ID}>
                  {cat.Name}
                </option>
              ))}
            </select>
            <select value={filterOnlyActive} onChange={(e) => { setFilterOnlyActive(e.target.value); setCurrentPage(1); }} className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 border-none outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {loadError && (
            <div className="flex items-center gap-3 p-4 mb-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400">
              <AlertCircle size={18} className="shrink-0" />
              <p className="text-sm font-medium">{loadError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-slate-100 dark:bg-slate-800" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-5 w-40 bg-slate-100 dark:bg-slate-800 rounded" />
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))
            ) : filteredItems.map(item => (
              <div key={item.id} className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img src={formatMenuItemImageUrl(item.image) || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {item.isNewItem && <span className="px-3 py-1 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">New</span>}
                    {item.isActive ? (
                      <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1"><CheckCircle2 size={10} /> Active</span>
                    ) : (
                      <span className="px-3 py-1 bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1"><XCircle size={10} /> Inactive</span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    <button onClick={() => handleEdit(item)} className="p-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl hover:bg-teal-500 hover:text-white transition-all shadow-xl">
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">
                        {categories.find(c => c.ID === item.categoryID)?.Name || item.category || `Cat #${item.categoryID}`}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{item.name}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed">
                    {item.description || <span className="italic">No description</span>}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      {item.serving > 0 && <div className="flex items-center gap-1 text-xs text-slate-500 font-bold"><Users size={14} /> {item.serving} Servings</div>}
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-bold"><Tag size={14} /> Order #{item.order}</div>
                    </div>
                    <div className="flex -space-x-2">
                      {item.tags.slice(0, 2).map((tag, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500" title={tag}>{tag[0]}</div>
                      ))}
                      {item.tags.length > 2 && <div className="w-6 h-6 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">+{item.tags.length - 2}</div>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isLoading && items.length === PAGE_SIZE && (
            <div className="flex items-center justify-center gap-4 mt-10">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:border-teal-500 transition-all disabled:opacity-40">Previous</button>
              <span className="text-sm font-bold text-slate-500">Page {currentPage}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} className="px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-slate-600 dark:text-slate-300 hover:border-teal-500 transition-all">Next</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-800 flex flex-col px-6 lg:px-10 flex-shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-20 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500">
              <X size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{currentItem?.id ? 'Edit Menu Item' : 'New Menu Item'}</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                {categories.find(c => c.ID === currentItem?.categoryID)?.Name || currentItem?.category || 'General'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'config' && (
              <>
                <button onClick={() => setView('list')} className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all">Discard</button>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-8 py-2.5 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSaving ? <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
                  <span>{isSaving ? 'Saving...' : 'Save Item'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {currentItem?.id && (
          <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 -mb-4 mt-4">
            <button
              onClick={() => setActiveTab('config')}
              className={`pb-2 px-2 font-bold text-xs uppercase tracking-widest border-b-2 transition-all ${activeTab === 'config' ? 'border-teal-500 text-teal-500' : 'border-transparent text-slate-450 hover:text-slate-650'}`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`pb-2 px-2 font-bold text-xs uppercase tracking-widest border-b-2 transition-all ${activeTab === 'history' ? 'border-teal-500 text-teal-500' : 'border-transparent text-slate-450 hover:text-slate-650'}`}
            >
              History
            </button>
          </div>
        )}
      </div>

      {activeTab === 'config' ? (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10 text-left">
              <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center"><Info size={18} /></div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Item Name</label>
                  <input type="text" value={currentItem?.name} onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} placeholder="e.g. Pepperoni Pizza" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Remote Code</label>
                  <input type="text" value={currentItem?.remoteCode} onChange={(e) => setCurrentItem({...currentItem, remoteCode: e.target.value})} placeholder="e.g. PIZ-101" className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                  <select
                    value={
                      currentItem?.categoryID ||
                      categories.find(c => c.Name === currentItem?.category)?.ID ||
                      ''
                    }
                    onChange={(e) => {
                      const catId = Number(e.target.value);
                      const selectedCat = categories.find(c => c.ID === catId);
                      setCurrentItem({
                        ...currentItem,
                        categoryID: catId,
                        category: selectedCat ? selectedCat.Name : currentItem?.category || '',
                      });
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none appearance-none font-medium text-slate-900 dark:text-white"
                  >
                    <option value="">Select Category</option>
                    {categories
                      .filter(cat => cat.IsActive || cat.ID === currentItem?.categoryID)
                      .map((cat) => (
                        <option key={cat.ID} value={cat.ID}>
                          {cat.Name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea value={currentItem?.description} onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})} rows={4} placeholder="Describe your delicious item..." className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Display Order</label>
                  <input type="number" value={currentItem?.order} onChange={(e) => setCurrentItem({...currentItem, order: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Serving Size</label>
                  <input type="number" value={currentItem?.serving} onChange={(e) => setCurrentItem({...currentItem, serving: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none" />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center"><ImageIcon size={18} /></div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Item Media</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MENU IMAGE */}
                <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Pizza size={16} className="text-teal-500" />
                      Menu Image
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Primary image shown on the menu list</p>
                  </div>

                  <div onClick={() => fileInputRef.current?.click()} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                    className={`w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-white dark:bg-slate-900 border-2 border-dashed flex items-center justify-center relative group cursor-pointer transition-all ${isDragging ? 'border-teal-500 bg-teal-500/5 scale-102' : 'border-slate-200 dark:border-slate-800 hover:border-teal-500'}`}
                  >
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    {currentItem?.image ? (
                      <>
                        <img src={formatMenuItemImageUrl(currentItem.image)} className="w-full h-full object-cover" alt="Menu Preview" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                          <div className="flex gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors"><RefreshCw size={20} /></div>
                            <button onClick={removeImage} className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500/40 transition-colors"><Trash2 size={20} /></button>
                          </div>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change or Remove</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto transition-all ${isDragging ? 'bg-teal-500 text-white scale-110' : 'bg-teal-500/10 text-teal-500 group-hover:scale-110'}`}>
                          <Upload size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">{isDragging ? 'Drop Image Here' : 'Upload Menu Image'}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Drag & drop or click to browse</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Menu Image URL (Optional)</label>
                    <input type="text" value={currentItem?.image?.startsWith('data:') ? '' : (currentItem?.image || '')} onChange={(e) => setCurrentItem({...currentItem, image: e.target.value})} placeholder="https://..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs transition-all outline-none" />
                  </div>
                </div>

                {/* POPUP IMAGE */}
                <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800/60">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Layers size={16} className="text-teal-500" />
                      Popup Image
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Secondary image shown in deal popups</p>
                  </div>

                  <div onClick={() => fileInputPopupRef.current?.click()} onDragOver={handlePopupDragOver} onDragLeave={handlePopupDragLeave} onDrop={handlePopupDrop}
                    className={`w-full aspect-[4/3] rounded-[24px] overflow-hidden bg-white dark:bg-slate-900 border-2 border-dashed flex items-center justify-center relative group cursor-pointer transition-all ${isDraggingPopup ? 'border-teal-500 bg-teal-500/5 scale-102' : 'border-slate-200 dark:border-slate-800 hover:border-teal-500'}`}
                  >
                    <input type="file" ref={fileInputPopupRef} onChange={handleImagePopupUpload} className="hidden" accept="image/*" />
                    {currentItem?.imagePopup ? (
                      <>
                        <img src={formatMenuItemImageUrl(currentItem.imagePopup)} className="w-full h-full object-cover" alt="Popup Preview" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                          <div className="flex gap-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors"><RefreshCw size={20} /></div>
                            <button onClick={removeImagePopup} className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500/40 transition-colors"><Trash2 size={20} /></button>
                          </div>
                          <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change or Remove</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto transition-all ${isDraggingPopup ? 'bg-teal-500 text-white scale-110' : 'bg-teal-500/10 text-teal-500 group-hover:scale-110'}`}>
                          <Upload size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">{isDraggingPopup ? 'Drop Image Here' : 'Upload Popup Image'}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Drag & drop or click to browse</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Popup Image URL (Optional)</label>
                    <input type="text" value={currentItem?.imagePopup?.startsWith('data:') ? '' : (currentItem?.imagePopup || '')} onChange={(e) => setCurrentItem({...currentItem, imagePopup: e.target.value})} placeholder="https://..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-teal-500 rounded-xl px-3 py-2 text-xs transition-all outline-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags</label>
                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-transparent focus-within:border-teal-500 transition-all">
                  {currentItem?.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="hover:text-rose-500"><X size={12} /></button>
                    </span>
                  ))}
                  <input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={addTag} placeholder="Add tag..." className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-xs font-bold" />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center"><DollarSign size={18} /></div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sizes & Pricing</h3>
                </div>
                <button onClick={addSize} className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-teal-500/20 transition-all">
                  <Plus size={14} /> Add Size
                </button>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSortSizes}>
                <SortableContext items={currentItem?.sizes?.map(s => s.id) || []} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {currentItem?.sizes?.map((size) => (
                      <SortableSizeItem key={size.id} size={size} onUpdate={updateSize} onRemove={removeSize} onOpenModifiers={(id) => { setActiveSizeId(id); setIsModifierModalOpen(true); }} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              {(!currentItem?.sizes || currentItem.sizes.length === 0) && (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-500 font-bold">No sizes added yet. Click "Add Size" to begin.</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[32px] p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Status & Visibility</h3>
              {([
                { label: 'Is Active', key: 'isActive' as keyof MenuItem },
                { label: 'Is Suggestive', key: 'isSuggestive' as keyof MenuItem },
                { label: 'Is New Item', key: 'isNewItem' as keyof MenuItem },
                { label: 'Show Description', key: 'showDescription' as keyof MenuItem },
              ] as const).map((toggle) => (
                <label key={toggle.key} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{toggle.label}</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" checked={!!currentItem?.[toggle.key]} onChange={(e) => setCurrentItem({...currentItem, [toggle.key]: e.target.checked})} />
                    <div className={`w-12 h-6 rounded-full transition-colors ${currentItem?.[toggle.key] ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${currentItem?.[toggle.key] ? 'translate-x-6' : ''}`}></div>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={18} className="text-teal-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Availability</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Time</label>
                  <input type="text" value={currentItem?.startTime} onChange={(e) => setCurrentItem({...currentItem, startTime: e.target.value})} className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End Time</label>
                  <input type="text" value={currentItem?.endTime} onChange={(e) => setCurrentItem({...currentItem, endTime: e.target.value})} className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map(day => (
                    <button key={day} onClick={() => {
                      const current = currentItem?.availableDays || [];
                      const updated = current.includes(day) ? current.filter(d => d !== day) : [...current, day];
                      setCurrentItem({...currentItem, availableDays: updated});
                    }} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${currentItem?.availableDays?.includes(day) ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}>
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-teal-500/5 dark:bg-teal-900/10 rounded-[32px] p-8 border border-teal-500/20 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Tag size={18} className="text-teal-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Marketing</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Special Deal Text</label>
                  <input type="text" value={currentItem?.specialDealText} onChange={(e) => setCurrentItem({...currentItem, specialDealText: e.target.value})} placeholder="e.g. Buy 1 Get 1 Free" className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Item Text</label>
                  <input type="text" value={currentItem?.newItemText} onChange={(e) => setCurrentItem({...currentItem, newItemText: e.target.value})} placeholder="e.g. Freshly Baked" className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timer End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input type="text" value={currentItem?.timerEndTime} onChange={(e) => setCurrentItem({...currentItem, timerEndTime: e.target.value})} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border-none rounded-xl text-xs focus:ring-2 focus:ring-teal-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-xl">
            <HistoryTab entityName="MenuItem" entityId={Number(currentItem?.id)} />
          </div>
        </div>
      )}

      {isModifierModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-in flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center shadow-inner"><Layers size={24} /></div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Modifiers</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">For {currentItem?.sizes?.find(s => s.id === activeSizeId)?.size || 'Selected Size'}</p>
                  </div>
                </div>
                <button onClick={() => { setIsModifierModalOpen(false); setModifierSearch(''); }} className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-100 dark:border-slate-800 shadow-sm">
                  <X size={24} />
                </button>
              </div>
              <div className="relative group/search">
                <div className={`relative transition-all duration-300 ${modifierSearch ? 'ring-4 ring-teal-500/10' : ''}`}>
                  <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${modifierSearch ? 'text-teal-500' : 'text-slate-400'}`} size={20} />
                  <input type="text" placeholder="Search groups to add..." value={modifierSearch} onChange={(e) => setModifierSearch(e.target.value)} className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500/30 rounded-[24px] text-sm focus:ring-0 font-bold placeholder:text-slate-400 transition-all shadow-inner" />
                  {modifierSearch && <button onClick={() => setModifierSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"><X size={18} /></button>}
                </div>
                {modifierSearch && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                      <div className="px-4 py-3 mb-2"><h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Available to Add</h4></div>
                      <div className="space-y-1">
                        {modifierGroups.filter(group => {
                          const activeSize = currentItem?.sizes?.find(s => s.id === activeSizeId);
                          const alreadyAdded = activeSize?.modifierGroups?.some(mg => mg === group.id || mg.toLowerCase() === group.name.toLowerCase());
                          return !alreadyAdded;
                        }).filter(group => group.name.toLowerCase().includes(modifierSearch.toLowerCase())).map(group => (
                          <button key={group.id} onClick={() => { if (activeSizeId) { toggleModifierGroup(activeSizeId, group.name || group.id); } setModifierSearch(''); }} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-teal-50 dark:hover:bg-teal-500/10 text-slate-600 dark:text-slate-400 transition-all group/add-item border border-transparent hover:border-teal-500/20">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/add-item:bg-teal-500/20 group-hover/add-item:text-teal-500 transition-all"><Layers size={18} /></div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover/add-item:text-teal-600 dark:group-hover/add-item:text-teal-400 transition-colors">{group.name}</p>
                                <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Selection: {group.minSelection}-{group.maxSelection}</p>
                              </div>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/add-item:bg-teal-500 group-hover/add-item:text-white transition-all"><Plus size={16} /></div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                      <button className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 transition-colors">+ Create New Modifier Group</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Active Modifiers</h4>
                  <span className="text-[10px] font-bold px-2 py-1 bg-teal-500/10 text-teal-600 rounded-lg">{currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups?.length || 0} Added</span>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSortModifiers}>
                  <SortableContext items={currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups || []} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups?.map(groupId => {
                        const activeSize = currentItem?.sizes?.find(s => s.id === activeSizeId);
                        const detailGroup = (activeSize as any)?.optionGroupDetails?.find((og: any) =>
                          og.name?.toLowerCase() === groupId?.toLowerCase()
                        );
                        const group = modifierGroups.find(g => g.id === groupId || g.name.toLowerCase() === groupId.toLowerCase()) || {
                          id: groupId,
                          name: groupId,
                          minSelection: 0,
                          maxSelection: 99,
                        };
                        const mergedGroup = {
                          ...group,
                          options: detailGroup?.options || (group as any).options,
                        };
                        return <SortableModifierItem key={groupId} group={mergedGroup} onDelete={() => activeSizeId && toggleModifierGroup(activeSizeId, groupId)} />;
                      })}
                      {(!currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups?.length) && (
                        <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-950/50 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                          <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mx-auto mb-4"><Layers size={32} /></div>
                          <p className="text-sm text-slate-400 font-bold">No modifiers added yet.</p>
                          <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-1">Search above to add groups</p>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
            <div className="p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => { setIsModifierModalOpen(false); setModifierSearch(''); }} className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-[24px] shadow-2xl shadow-slate-900/20 dark:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
