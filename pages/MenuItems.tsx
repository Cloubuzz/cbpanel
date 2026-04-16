import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
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
  GripVertical
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ModifierGroup {
  id: string;
  name: string;
  minSelection: number;
  maxSelection: number;
}

interface MenuSize {
  id: string;
  size: string;
  price: number;
  originalPrice: number;
  pickupPrice: number;
  originalDisplayPrice: number;
  halfNHalf: boolean;
  modifierGroups?: string[]; // IDs of modifier groups
}

interface MenuItem {
  id: string;
  name: string;
  menu: string;
  category: string;
  remoteCode: string;
  description: string;
  order: number;
  image: string;
  serving: number;
  specialDealText: string;
  timerEndTime: string;
  newItemText: string;
  tags: string[];
  isActive: boolean;
  isSuggestive: boolean;
  isNewItem: boolean;
  showDescription: boolean;
  startTime: string;
  endTime: string;
  availableDays: string[];
  sizes: MenuSize[];
}

const MOCK_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Margherita Pizza',
    menu: 'Main Menu',
    category: 'Pizzas',
    remoteCode: 'PIZ-001',
    description: 'Classic tomato sauce, mozzarella, and fresh basil.',
    order: 1,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80',
    serving: 2,
    specialDealText: 'Buy 1 Get 1 Free',
    timerEndTime: '12:00 AM',
    newItemText: 'Fresh!',
    tags: ['Vegetarian', 'Classic'],
    isActive: true,
    isSuggestive: true,
    isNewItem: false,
    showDescription: true,
    startTime: '10:00 AM',
    endTime: '11:00 PM',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    sizes: [
      { id: 's1', size: 'Small', price: 12, originalPrice: 15, pickupPrice: 10, originalDisplayPrice: 15, halfNHalf: false },
      { id: 's2', size: 'Medium', price: 18, originalPrice: 22, pickupPrice: 15, originalDisplayPrice: 22, halfNHalf: true }
    ]
  },
  {
    id: '2',
    name: 'Pepperoni Feast',
    menu: 'Main Menu',
    category: 'Pizzas',
    remoteCode: 'PIZ-002',
    description: 'Double pepperoni with extra mozzarella cheese.',
    order: 2,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    serving: 2,
    specialDealText: '',
    timerEndTime: '12:00 AM',
    newItemText: 'Hot!',
    tags: ['Meat', 'Spicy'],
    isActive: true,
    isSuggestive: false,
    isNewItem: true,
    showDescription: true,
    startTime: '10:00 AM',
    endTime: '11:00 PM',
    availableDays: ['Friday', 'Saturday', 'Sunday'],
    sizes: [
      { id: 's3', size: 'Large', price: 25, originalPrice: 30, pickupPrice: 20, originalDisplayPrice: 30, halfNHalf: true }
    ]
  }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MOCK_MODIFIER_GROUPS: ModifierGroup[] = [
  { id: 'mg1', name: 'Extra Toppings', minSelection: 0, maxSelection: 10 },
  { id: 'mg2', name: 'Crust Type', minSelection: 1, maxSelection: 1 },
  { id: 'mg3', name: 'Dips', minSelection: 0, maxSelection: 5 },
  { id: 'mg4', name: 'Drink Choice', minSelection: 1, maxSelection: 1 },
  { id: 'mg5', name: 'Sauce Level', minSelection: 1, maxSelection: 1 },
];

interface SortableModifierItemProps {
  group: ModifierGroup;
  onDelete: () => void;
}

const SortableModifierItem: React.FC<SortableModifierItemProps> = ({ group, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: group.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 group/mod-item ${isDragging ? 'shadow-lg ring-2 ring-teal-500/20' : ''}`}
    >
      <div className="flex items-center gap-3">
        <button 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 transition-colors"
        >
          <GripVertical size={16} />
        </button>
        <div className="text-left">
          <p className="text-sm font-bold text-slate-900 dark:text-white">{group.name}</p>
          <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Selection: {group.minSelection}-{group.maxSelection}</p>
        </div>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover/mod-item:opacity-100"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

interface SortableSizeItemProps {
  size: MenuSize;
  onUpdate: (id: string, updates: Partial<MenuSize>) => void;
  onRemove: (id: string) => void;
  onOpenModifiers: (id: string) => void;
}

const SortableSizeItem: React.FC<SortableSizeItemProps> = ({ size, onUpdate, onRemove, onOpenModifiers }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: size.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 relative group/size shadow-sm hover:shadow-md transition-all ${isDragging ? 'ring-2 ring-teal-500/20 shadow-lg z-50' : ''}`}
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex items-center self-center pt-5">
           <button 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <GripVertical size={16} />
          </button>
        </div>
        <div className="flex-1 min-w-[120px] space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Size Name</label>
          <input 
            type="text" 
            value={size.size}
            onChange={(e) => onUpdate(size.id, { size: e.target.value })}
            placeholder="e.g. Large"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>
        <div className="w-24 space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Price (RS)</label>
          <input 
            type="number" 
            value={size.price === 0 ? '' : size.price}
            onChange={(e) => onUpdate(size.id, { price: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>
        <div className="w-24 space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Original</label>
          <input 
            type="number" 
            value={size.originalPrice === 0 ? '' : size.originalPrice}
            onChange={(e) => onUpdate(size.id, { originalPrice: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>
        <div className="w-24 space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Pickup</label>
          <input 
            type="number" 
            value={size.pickupPrice === 0 ? '' : size.pickupPrice}
            onChange={(e) => onUpdate(size.id, { pickupPrice: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>
        <div className="w-24 space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Orig. Disp</label>
          <input 
            type="number" 
            value={size.originalDisplayPrice === 0 ? '' : size.originalDisplayPrice}
            onChange={(e) => onUpdate(size.id, { originalDisplayPrice: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-4 h-10">
          <button 
            onClick={() => onOpenModifiers(size.id)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-teal-500/10 hover:text-teal-500 transition-all border border-transparent hover:border-teal-500/20"
          >
            <Layers size={14} />
            Modifiers ({size.modifierGroups?.length || 0})
          </button>
          <label className="flex items-center gap-2 cursor-pointer group/toggle">
            <div className="relative">
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={size.halfNHalf}
                onChange={(e) => onUpdate(size.id, { halfNHalf: e.target.checked })}
              />
              <div className={`w-8 h-4 rounded-full transition-colors ${size.halfNHalf ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
              <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${size.halfNHalf ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">HnH</span>
          </label>
          <button 
            onClick={() => onRemove(size.id)}
            className="p-2 text-slate-400 hover:text-rose-500 transition-all"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const MenuItems: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [items, setItems] = useState<MenuItem[]>(MOCK_ITEMS);
  const [currentItem, setCurrentItem] = useState<Partial<MenuItem> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [activeSizeId, setActiveSizeId] = useState<string | null>(null);
  const [modifierSearch, setModifierSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateNew = () => {
    setCurrentItem({
      name: '',
      menu: 'New Menu',
      category: 'Eid Trending!',
      remoteCode: '',
      description: '',
      order: 0,
      image: '',
      serving: 1,
      specialDealText: '',
      timerEndTime: '12:00 AM',
      newItemText: '',
      tags: [],
      isActive: true,
      isSuggestive: false,
      isNewItem: false,
      showDescription: true,
      startTime: '12:00 AM',
      endTime: '12:00 AM',
      availableDays: DAYS,
      sizes: []
    });
    setView('editor');
  };

  const handleEdit = (item: MenuItem) => {
    setCurrentItem(item);
    setView('editor');
  };

  const handleSave = async () => {
    if (currentItem) {
      setIsSaving(true);
      const payload = {
        type: 'menu_item',
        action: currentItem.id ? 'update' : 'create',
        data: currentItem,
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
          if (currentItem.id) {
            setItems(prev => prev.map(item => item.id === currentItem.id ? (currentItem as MenuItem) : item));
          } else {
            const newItem = { ...currentItem, id: Math.random().toString(36).substr(2, 9) } as MenuItem;
            setItems(prev => [...prev, newItem]);
          }
          setView('list');
          setCurrentItem(null);
          alert('Menu item saved and submitted successfully!');
        } else {
          throw new Error('Failed to submit to webhook');
        }
      } catch (error) {
        console.error('Error saving menu item:', error);
        alert('Menu item saved locally, but webhook submission failed.');
        // Still save locally even if webhook fails
        if (currentItem.id) {
          setItems(prev => prev.map(item => item.id === currentItem.id ? (currentItem as MenuItem) : item));
        } else {
          const newItem = { ...currentItem, id: Math.random().toString(36).substr(2, 9) } as MenuItem;
          setItems(prev => [...prev, newItem]);
        }
        setView('list');
        setCurrentItem(null);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const addSize = () => {
    if (currentItem) {
      const newSize: MenuSize = {
        id: Math.random().toString(36).substr(2, 9),
        size: '',
        price: 0,
        originalPrice: 0,
        pickupPrice: 0,
        originalDisplayPrice: 0,
        halfNHalf: false,
        modifierGroups: []
      };
      setCurrentItem({
        ...currentItem,
        sizes: [...(currentItem.sizes || []), newSize]
      });
    }
  };

  const removeSize = (id: string) => {
    if (currentItem) {
      setCurrentItem({
        ...currentItem,
        sizes: currentItem.sizes?.filter(s => s.id !== id)
      });
    }
  };

  const updateSize = (id: string, updates: Partial<MenuSize>) => {
    if (currentItem) {
      setCurrentItem({
        ...currentItem,
        sizes: currentItem.sizes?.map(s => s.id === id ? { ...s, ...updates } : s)
      });
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
            return {
              ...size,
              modifierGroups: arrayMove(size.modifierGroups!, oldIndex, newIndex)
            };
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
        setCurrentItem({
          ...currentItem,
          sizes: arrayMove(currentItem.sizes, oldIndex, newIndex)
        });
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Max 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCurrentItem(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentItem(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      if (!currentItem?.tags?.includes(newTag.trim())) {
        setCurrentItem(prev => ({
          ...prev,
          tags: [...(prev?.tags || []), newTag.trim()]
        }));
      }
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentItem(prev => ({
      ...prev,
      tags: prev?.tags?.filter(t => t !== tagToRemove)
    }));
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === 'list') {
    return (
      <div className="p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
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
            <button 
              onClick={handleCreateNew}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-500 transition-all shadow-xl shadow-teal-900/20 hover:-translate-y-1 active:scale-95"
            >
              <Plus size={20} /> Add New Item
            </button>
          </div>

          {/* Filters & Search */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-teal-500 transition-all"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 transition-all">
              <Filter size={18} /> Filters
            </button>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <div 
                key={item.id}
                className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img 
                    src={item.image || 'https://placehold.co/600x400/e2e8f0/94a3b8?text=No+Image'} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {item.isNewItem && (
                      <span className="px-3 py-1 bg-teal-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">New</span>
                    )}
                    {item.isActive ? (
                      <span className="px-3 py-1 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
                        <CheckCircle2 size={10} /> Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-rose-500/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg flex items-center gap-1">
                        <XCircle size={10} /> Inactive
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="p-3 bg-white/90 backdrop-blur-md text-slate-900 rounded-2xl hover:bg-teal-500 hover:text-white transition-all shadow-xl"
                    >
                      <Edit2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-teal-500 uppercase tracking-widest">{item.category}</span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{item.name}</h3>
                    </div>
                    <span className="text-lg font-bold text-teal-600 dark:text-teal-400">
                      RS {item.sizes[0]?.price || 0}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                        <Users size={14} /> {item.serving} Servings
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 font-bold">
                        <Layers size={14} /> {item.sizes.length} Sizes
                      </div>
                    </div>
                    <div className="flex -space-x-2">
                      {item.tags.slice(0, 2).map((tag, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-slate-500" title={tag}>
                          {tag[0]}
                        </div>
                      ))}
                      {item.tags.length > 2 && (
                        <div className="w-6 h-6 rounded-full bg-teal-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white">
                          +{item.tags.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Editor Header */}
      <div className="h-20 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 lg:px-10 flex-shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('list')}
            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500"
          >
            <X size={24} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentItem?.id ? 'Edit Menu Item' : 'New Menu Item'}
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{currentItem?.category || 'General'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('list')}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-all"
          >
            Discard
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-2.5 bg-teal-600 text-white rounded-2xl font-bold hover:bg-teal-500 transition-all shadow-lg shadow-teal-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            <span>{isSaving ? 'Saving...' : 'Save Item'}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Left Column: Basic Info */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Section: Identity */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                  <Info size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Item Name</label>
                  <input 
                    type="text" 
                    value={currentItem?.name}
                    onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})}
                    placeholder="e.g. Pepperoni Pizza"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Remote Code</label>
                  <input 
                    type="text" 
                    value={currentItem?.remoteCode}
                    onChange={(e) => setCurrentItem({...currentItem, remoteCode: e.target.value})}
                    placeholder="e.g. PIZ-101"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Menu</label>
                  <select 
                    value={currentItem?.menu}
                    onChange={(e) => setCurrentItem({...currentItem, menu: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none appearance-none"
                  >
                    <option value="Main Menu">Main Menu</option>
                    <option value="New Menu">New Menu</option>
                    <option value="Breakfast">Breakfast</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                  <select 
                    value={currentItem?.category}
                    onChange={(e) => setCurrentItem({...currentItem, category: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none appearance-none"
                  >
                    <option value="Pizzas">Pizzas</option>
                    <option value="Eid Trending!">Eid Trending!</option>
                    <option value="Burgers">Burgers</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                <textarea 
                  value={currentItem?.description}
                  onChange={(e) => setCurrentItem({...currentItem, description: e.target.value})}
                  rows={4}
                  placeholder="Describe your delicious item..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Display Order</label>
                  <input 
                    type="number" 
                    value={currentItem?.order}
                    onChange={(e) => setCurrentItem({...currentItem, order: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Serving Size</label>
                  <input 
                    type="number" 
                    value={currentItem?.serving}
                    onChange={(e) => setCurrentItem({...currentItem, serving: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                  />
                </div>
              </div>
            </section>

            {/* Section: Media */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                  <ImageIcon size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Item Media</h3>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full md:w-72 aspect-square rounded-[40px] overflow-hidden bg-slate-50 dark:bg-slate-900 border-2 border-dashed flex items-center justify-center relative group cursor-pointer transition-all ${
                    isDragging ? 'border-teal-500 bg-teal-500/5 scale-105' : 'border-slate-200 dark:border-slate-800 hover:border-teal-500'
                  }`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden" 
                    accept="image/*"
                  />
                  {currentItem?.image ? (
                    <>
                      <img src={currentItem.image} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                        <div className="flex gap-2">
                          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                            <RefreshCw size={20} />
                          </div>
                          <button 
                            onClick={removeImage}
                            className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500/40 transition-colors"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change or Remove</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8 space-y-4">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto transition-all ${
                        isDragging ? 'bg-teal-500 text-white scale-110' : 'bg-teal-500/10 text-teal-500 group-hover:scale-110'
                      }`}>
                        <Upload size={32} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">
                          {isDragging ? 'Drop Image Here' : 'Upload Image'}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">Drag & drop or click to browse</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-6 w-full">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image URL (Optional)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={currentItem?.image}
                        onChange={(e) => setCurrentItem({...currentItem, image: e.target.value})}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl px-4 py-3 text-sm transition-all outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 italic">You can either upload an image or paste a direct URL.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tags</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-transparent focus-within:border-teal-500 transition-all">
                      {currentItem?.tags?.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="hover:text-rose-500">
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={addTag}
                        placeholder="Add tag..."
                        className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-xs font-bold"
                      />
                    </div>
                  </div>
                  
                  <div className="p-6 bg-teal-500/5 rounded-3xl border border-teal-500/10">
                    <div className="flex items-start gap-3">
                      <Info size={16} className="text-teal-500 mt-0.5" />
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        High-quality images (1200x800px) work best for the menu display. Make sure the background is clean or appetizing.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Section: Sizes & Pricing */}
            <section className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sizes & Pricing</h3>
                </div>
                <button 
                  onClick={addSize}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-teal-500/20 transition-all"
                >
                  <Plus size={14} /> Add Size
                </button>
              </div>

              <div className="space-y-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleSortSizes}
                >
                  <SortableContext
                    items={currentItem?.sizes?.map(s => s.id) || []}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {currentItem?.sizes?.map((size) => (
                        <SortableSizeItem 
                          key={size.id}
                          size={size}
                          onUpdate={updateSize}
                          onRemove={removeSize}
                          onOpenModifiers={(id) => {
                            setActiveSizeId(id);
                            setIsModifierModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                {(!currentItem?.sizes || currentItem.sizes.length === 0) && (
                  <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <p className="text-sm text-slate-500 font-bold">No sizes added yet. Click "Add Size" to begin.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Settings & Availability */}
          <div className="space-y-8">
            
            {/* Section: Status Toggles */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[32px] p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">Status & Visibility</h3>
              
              {[
                { label: 'Is Active', key: 'isActive' as keyof MenuItem },
                { label: 'Is Suggestive', key: 'isSuggestive' as keyof MenuItem },
                { label: 'Is New Item', key: 'isNewItem' as keyof MenuItem },
                { label: 'Show Description', key: 'showDescription' as keyof MenuItem }
              ].map((toggle) => (
                <label key={toggle.key} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{toggle.label}</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={!!currentItem?.[toggle.key as keyof MenuItem]}
                      onChange={(e) => setCurrentItem({...currentItem, [toggle.key]: e.target.checked})}
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${currentItem?.[toggle.key as keyof MenuItem] ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${currentItem?.[toggle.key as keyof MenuItem] ? 'translate-x-6' : ''}`}></div>
                  </div>
                </label>
              ))}
            </div>

            {/* Section: Availability */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-8 border border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Calendar size={18} className="text-teal-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Availability</h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Start Time</label>
                    <input 
                      type="text" 
                      value={currentItem?.startTime}
                      onChange={(e) => setCurrentItem({...currentItem, startTime: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">End Time</label>
                    <input 
                      type="text" 
                      value={currentItem?.endTime}
                      onChange={(e) => setCurrentItem({...currentItem, endTime: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available Days</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(day => (
                      <button 
                        key={day}
                        onClick={() => {
                          const current = currentItem?.availableDays || [];
                          const updated = current.includes(day) 
                            ? current.filter(d => d !== day)
                            : [...current, day];
                          setCurrentItem({...currentItem, availableDays: updated});
                        }}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                          currentItem?.availableDays?.includes(day)
                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Marketing */}
            <div className="bg-teal-500/5 dark:bg-teal-900/10 rounded-[32px] p-8 border border-teal-500/20 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Tag size={18} className="text-teal-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Marketing</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Special Deal Text</label>
                  <input 
                    type="text" 
                    value={currentItem?.specialDealText}
                    onChange={(e) => setCurrentItem({...currentItem, specialDealText: e.target.value})}
                    placeholder="e.g. Buy 1 Get 1 Free"
                    className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Item Text</label>
                  <input 
                    type="text" 
                    value={currentItem?.newItemText}
                    onChange={(e) => setCurrentItem({...currentItem, newItemText: e.target.value})}
                    placeholder="e.g. Freshly Baked"
                    className="w-full bg-white dark:bg-slate-900 border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Timer End Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      value={currentItem?.timerEndTime}
                      onChange={(e) => setCurrentItem({...currentItem, timerEndTime: e.target.value})}
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border-none rounded-xl text-xs focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modifier Selection Modal */}
      {isModifierModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-scale-in flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center shadow-inner">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                      Modifiers
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
                      For {currentItem?.sizes?.find(s => s.id === activeSizeId)?.size || 'Selected Size'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsModifierModalOpen(false);
                    setModifierSearch('');
                  }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all border border-slate-100 dark:border-slate-800 shadow-sm"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="relative group/search">
                <div className={`relative transition-all duration-300 ${modifierSearch ? 'ring-4 ring-teal-500/10' : ''}`}>
                  <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${modifierSearch ? 'text-teal-500' : 'text-slate-400'}`} size={20} />
                  <input 
                    type="text"
                    placeholder="Search groups to add..."
                    value={modifierSearch}
                    onChange={(e) => setModifierSearch(e.target.value)}
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500/30 rounded-[24px] text-sm focus:ring-0 font-bold placeholder:text-slate-400 transition-all shadow-inner"
                  />
                  {modifierSearch && (
                    <button 
                      onClick={() => setModifierSearch('')}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                {/* Advanced Dropdown for Available Modifiers */}
                {modifierSearch && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                      <div className="px-4 py-3 mb-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Available to Add</h4>
                      </div>
                      <div className="space-y-1">
                        {MOCK_MODIFIER_GROUPS
                          .filter(group => !currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups?.includes(group.id))
                          .filter(group => group.name.toLowerCase().includes(modifierSearch.toLowerCase()))
                          .map(group => (
                            <button
                              key={group.id}
                              onClick={() => {
                                if (activeSizeId) {
                                  toggleModifierGroup(activeSizeId, group.id);
                                }
                                setModifierSearch('');
                              }}
                              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-teal-50 dark:hover:bg-teal-500/10 text-slate-600 dark:text-slate-400 transition-all group/add-item border border-transparent hover:border-teal-500/20"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/add-item:bg-teal-500/20 group-hover/add-item:text-teal-500 transition-all">
                                  <Layers size={18} />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover/add-item:text-teal-600 dark:group-hover/add-item:text-teal-400 transition-colors">{group.name}</p>
                                  <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold">Selection: {group.minSelection}-{group.maxSelection}</p>
                                </div>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/add-item:bg-teal-500 group-hover/add-item:text-white transition-all">
                                <Plus size={16} />
                              </div>
                            </button>
                          ))}
                        {MOCK_MODIFIER_GROUPS
                          .filter(group => !currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups?.includes(group.id))
                          .filter(group => group.name.toLowerCase().includes(modifierSearch.toLowerCase())).length === 0 && (
                          <div className="p-8 text-center">
                            <p className="text-sm text-slate-400 font-bold italic">No matching groups found</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                      <button className="w-full py-3 text-[10px] font-bold uppercase tracking-widest text-teal-600 hover:text-teal-700 transition-colors">
                        + Create New Modifier Group
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {/* Added Modifiers Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Active Modifiers</h4>
                  <span className="text-[10px] font-bold px-2 py-1 bg-teal-500/10 text-teal-600 rounded-lg">
                    {currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups?.length || 0} Added
                  </span>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleSortModifiers}
                >
                  <SortableContext
                    items={currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups || []}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups?.map(groupId => {
                        const group = MOCK_MODIFIER_GROUPS.find(g => g.id === groupId);
                        if (!group) return null;
                        return (
                          <SortableModifierItem 
                            key={group.id} 
                            group={group} 
                            onDelete={() => activeSizeId && toggleModifierGroup(activeSizeId, group.id)}
                          />
                        );
                      })}
                      {(!currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups || 
                        currentItem?.sizes?.find(s => s.id === activeSizeId)?.modifierGroups?.length === 0) && (
                        <div className="text-center py-16 bg-slate-50/50 dark:bg-slate-950/50 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                          <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mx-auto mb-4">
                            <Layers size={32} />
                          </div>
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
              <button 
                onClick={() => {
                  setIsModifierModalOpen(false);
                  setModifierSearch('');
                }}
                className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-[24px] shadow-2xl shadow-slate-900/20 dark:shadow-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
