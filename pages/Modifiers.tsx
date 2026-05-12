import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Layers, 
  Save,
  X,
  Settings2,
  Package,
  ArrowRight,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
import { useAppSelector } from '../store/hooks';
import { selectToken } from '../store/selectors/appSelectors';
import { fetchToppingLinkedItems, fetchToppingList, saveTopping, type ApiLinkedMenuItem, type ApiToppingListItem } from '../services/menuItemsApi';

interface ModifierItem {
  id: string;
  name: string;
  price: number;
  productId?: string; // Link to an existing product if applicable
}

interface ModifierGroup {
  id: string;
  name: string;
  description: string;
  selectionType: 'single' | 'multi';
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  items: ModifierItem[];
  isActive: boolean;
}

// Mock data for existing products (MenuItems)
const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Extra Cheese', price: 2.50 },
  { id: 'p2', name: 'Pepperoni', price: 3.00 },
  { id: 'p3', name: 'Mushrooms', price: 1.50 },
  { id: 'p4', name: 'Onions', price: 1.00 },
  { id: 'p5', name: 'Thin Crust', price: 0.00 },
  { id: 'p6', name: 'Thick Crust', price: 2.00 },
  { id: 'p7', name: 'Gluten Free Crust', price: 4.00 },
  { id: 'p8', name: 'Coke', price: 2.50 },
  { id: 'p9', name: 'Sprite', price: 2.50 },
];

const INITIAL_GROUPS: ModifierGroup[] = [];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const mapToppingToGroup = (item: ApiToppingListItem): ModifierGroup => {
  const parsedPrice = Number.parseFloat(String(item.Price ?? '0'));
  const price = Number.isFinite(parsedPrice) ? parsedPrice : 0;
  const productName = item.ProductName?.trim() || 'Unnamed Product';
  const toppingName = item.ToppingName?.trim() || 'Untitled Topping';
  const isRequired = Boolean(item.Required);
  const isMulti = Boolean(item.Multiselect);

  return {
    id: String(item.id),
    name: toppingName,
    description: productName,
    selectionType: isMulti ? 'multi' : 'single',
    isRequired,
    minSelection: isRequired ? 1 : 0,
    maxSelection: isMulti ? 99 : 1,
    items: [
      {
        id: `${item.id}-item`,
        name: toppingName,
        price,
      },
    ],
    isActive: true,
  };
};

const mapLinkedItemsToGroup = (group: ModifierGroup, items: ApiLinkedMenuItem[]): ModifierGroup => {
  if (items.length === 0) return group;

  return {
    ...group,
    items: items.map((item, index) => {
      const itemName = item.Name?.trim() || `Linked Item ${item.ID}`;

      return {
        id: `${item.ID}-${index}`,
        name: itemName,
        price: 0,
      };
    }),
  };
};

interface SortableModifierItemProps {
  item: ModifierItem;
  isReadOnly?: boolean;
  onRemove: (id: string) => void;
  onUpdatePrice: (id: string, price: number) => void;
}

const SortableModifierItem: React.FC<SortableModifierItemProps> = ({ item, isReadOnly = false, onRemove, onUpdatePrice }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl group/mod hover:border-teal-500/50 transition-all shadow-sm"
    >
      <div className="flex items-center gap-3 flex-1">
        <button 
          {...attributes} 
          {...listeners}
          className="p-1 text-slate-300 hover:text-teal-500 cursor-grab active:cursor-grabbing transition-colors"
        >
          <GripVertical size={16} />
        </button>
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.name}</p>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 focus-within:border-teal-500 transition-all">
            <span className="text-[10px] font-bold text-slate-400">RS</span>
            <input 
              type="number" 
              step="0.01"
              value={item.price === 0 ? '' : item.price}
              onChange={(e) => onUpdatePrice(item.id, e.target.value === '' ? 0 : parseFloat(e.target.value))}
              className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white font-bold w-16 focus:ring-0 p-0 text-right"
              placeholder="0.00"
            />
          </div>
        )}
      </div>
      {!isReadOnly && (
        <button 
          onClick={() => onRemove(item.id)}
          className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors ml-1"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
};

export const Modifiers: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [isSaving, setIsSaving] = useState(false);
  const [groups, setGroups] = useState<ModifierGroup[]>(INITIAL_GROUPS);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<ModifierGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isLinkedView, setIsLinkedView] = useState(false);

  useEffect(() => {
    const loadToppings = async () => {
      if (!token) return;

      setIsLoading(true);
      setLoadError(null);

      try {
        const items = await fetchToppingList(token, { page: currentPage, pageSize });
        const mappedGroups = items.map(mapToppingToGroup);
        setGroups(mappedGroups);
        setHasMore(items.length === pageSize);
      } catch (error) {
        console.error('Failed to load topping list:', error);
        setLoadError('Unable to load modifiers.');
        setGroups([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadToppings();
  }, [token, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    setCurrentGroup(null);
    setIsEditing(false);
    setDetailLoading(false);
    setDetailError(null);
    setIsLinkedView(false);
  }, [currentPage]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id && currentGroup) {
      const oldIndex = currentGroup.items.findIndex((item) => item.id === active.id);
      const newIndex = currentGroup.items.findIndex((item) => item.id === over?.id);
      
      setCurrentGroup({
        ...currentGroup,
        items: arrayMove(currentGroup.items, oldIndex, newIndex),
      });
    }
  };

  const handleUpdateItemPrice = (itemId: string, newPrice: number) => {
    if (!currentGroup) return;
    setCurrentGroup({
      ...currentGroup,
      items: currentGroup.items.map(item => item.id === itemId ? { ...item, price: newPrice } : item)
    });
  };

  const handleCreateNew = () => {
    const newGroup: ModifierGroup = {
      id: generateId('mg'),
      name: '',
      description: '',
      selectionType: 'single',
      isRequired: false,
      minSelection: 0,
      maxSelection: 1,
      items: [],
      isActive: true
    };
    setCurrentGroup(newGroup);
    setIsEditing(true);
    setIsLinkedView(false);
  };

  const handleEdit = async (group: ModifierGroup) => {
    setCurrentGroup({ ...group });
    setIsEditing(true);
    setIsLinkedView(true);

    if (!token) {
      setDetailError('Missing authorization token.');
      return;
    }

    if (!group.name.trim()) {
      setDetailError('Missing topping name.');
      return;
    }

    setDetailLoading(true);
    setDetailError(null);

    try {
      const linkedItems = await fetchToppingLinkedItems(token, group.name.trim());
      setCurrentGroup((prev) => (prev ? mapLinkedItemsToGroup(prev, linkedItems) : mapLinkedItemsToGroup(group, linkedItems)));
    } catch (error) {
      console.error('Failed to load linked items:', error);
      setDetailError('Unable to load linked items.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this modifier group?')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  const handleSave = async () => {
    if (!currentGroup) return;
    if (!token) {
      alert('Missing authorization token.');
      return;
    }
    
    setIsSaving(true);
    const parsedId = Number.parseInt(String(currentGroup.id), 10);
    const safeId = Number.isFinite(parsedId) ? parsedId : 0;
    const itemPrice = currentGroup.items[0]?.price ?? 0;

    const payload = {
      id: safeId,
      name: currentGroup.name.trim(),
      description: currentGroup.description.trim(),
      menuItemId: 0,
      price: itemPrice,
      originalPrice: itemPrice,
      required: currentGroup.isRequired,
      multiSelect: currentGroup.selectionType === 'multi',
      isActive: currentGroup.isActive,
      imageUrl: '',
    };

    try {
      const response = await saveTopping(token, payload);

      if (currentGroup.id && groups.find(g => g.id === currentGroup.id)) {
        setGroups(groups.map(g => g.id === currentGroup.id ? currentGroup : g));
      } else {
        setGroups([...groups, currentGroup]);
      }
      setIsEditing(false);
      setCurrentGroup(null);
      alert(response.message || 'Modifier saved successfully.');
    } catch (error) {
      console.error('Error saving modifier:', error);
      alert('Unable to save modifier.');
    } finally {
      setIsSaving(false);
    }
  };

  const addProductToGroup = (product: typeof MOCK_PRODUCTS[0]) => {
    if (!currentGroup) return;
    
    const newItem: ModifierItem = {
      id: generateId('mi'),
      name: product.name,
      price: product.price,
      productId: product.id
    };

    setCurrentGroup({
      ...currentGroup,
      items: [...currentGroup.items, newItem]
    });
    setProductSearch('');
  };

  const removeItemFromGroup = (itemId: string) => {
    if (!currentGroup) return;
    setCurrentGroup({
      ...currentGroup,
      items: currentGroup.items.filter(item => item.id !== itemId)
    });
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = MOCK_PRODUCTS.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
    !currentGroup?.items.find(item => item.productId === p.id)
  );

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto bg-slate-50 dark:bg-slate-950 lg:h-screen lg:overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
              <Layers className="text-white" size={32} />
            </div>
            Modifier Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Configure options and add-ons for your menu items</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <Plus size={20} />
          Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List Section */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:h-[calc(100vh-170px)]">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl shadow-sm outline-none transition-all dark:text-white"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {isLoading && (
              <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-500 text-center">
                Loading modifiers...
              </div>
            )}
            {!isLoading && loadError && (
              <div className="p-6 rounded-[24px] bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-sm font-bold text-rose-500 text-center">
                {loadError}
              </div>
            )}
            {!isLoading && !loadError && filteredGroups.length === 0 && (
              <div className="p-6 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-500 text-center">
                No modifiers found on this page.
              </div>
            )}
            {!isLoading && !loadError && filteredGroups.map(group => (
              <motion.div 
                layout
                key={group.id}
                onClick={() => handleEdit(group)}
                className={`p-5 bg-white dark:bg-slate-900 rounded-[32px] border-2 transition-all cursor-pointer group ${currentGroup?.id === group.id ? 'border-teal-500 shadow-lg' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentGroup?.id === group.id ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <Layers size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{group.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{group.description}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{group.items.length} Options</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${group.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                    {group.isActive ? 'Active' : 'Draft'}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-100 dark:border-slate-800">
                    {group.selectionType}
                  </span>
                  {group.isRequired && (
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-rose-500/10 text-rose-500 rounded-lg border border-rose-500/20">
                      Required
                    </span>
                  )}
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20">
                    {group.minSelection}-{group.maxSelection} Select
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {!isLoading && (currentPage > 1 || hasMore) && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Rows</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:border-teal-500 transition-all disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-slate-500">Page {currentPage}</span>
                <button
                  onClick={() => setCurrentPage((page) => page + 1)}
                  disabled={!hasMore}
                  className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:border-teal-500 transition-all disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Management Section */}
        <div className="lg:col-span-8 lg:sticky lg:top-6 lg:h-[calc(100vh-170px)] lg:overflow-y-auto">
          <AnimatePresence mode="wait">
            {isEditing && currentGroup ? (
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
                        {currentGroup.id ? 'Edit Group' : 'New Modifier Group'}
                      </h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure settings and items</p>
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
                  {/* Summary Card */}
                  <div className="bg-teal-500 rounded-[32px] p-8 text-white shadow-lg shadow-teal-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h3 className="text-3xl font-bold mb-2">{currentGroup.name || 'Untitled Group'}</h3>
                        <p className="text-teal-50 text-sm max-w-md opacity-80">{currentGroup.description || 'No description provided yet.'}</p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Items</p>
                          <p className="text-2xl font-bold">{currentGroup.items.length}</p>
                        </div>
                        <div className="w-px h-10 bg-white/20"></div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Type</p>
                          <p className="text-2xl font-bold capitalize">{currentGroup.selectionType}</p>
                        </div>
                        <div className="w-px h-10 bg-white/20"></div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Required</p>
                          <p className="text-2xl font-bold">{currentGroup.isRequired ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Basic Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Group Name</label>
                        <input 
                          type="text" 
                          value={currentGroup.name}
                          onChange={(e) => setCurrentGroup({...currentGroup, name: e.target.value})}
                          placeholder="e.g. Extra Toppings"
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                        <textarea 
                          value={currentGroup.description}
                          onChange={(e) => setCurrentGroup({...currentGroup, description: e.target.value})}
                          placeholder="Brief description for customers"
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none h-32 resize-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-8 bg-slate-50 dark:bg-slate-950 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                        <Settings2 size={16} className="text-teal-500" />
                        Group Logic
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Selection Type</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Single or Multiple choices</p>
                          </div>
                          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                            <button 
                              onClick={() => setCurrentGroup({...currentGroup, selectionType: 'single', maxSelection: 1})}
                              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${currentGroup.selectionType === 'single' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              Single
                            </button>
                            <button 
                              onClick={() => setCurrentGroup({...currentGroup, selectionType: 'multi', maxSelection: 10})}
                              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${currentGroup.selectionType === 'multi' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              Multi
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Is Required</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Customer must make a selection</p>
                          </div>
                          <button 
                            onClick={() => setCurrentGroup({...currentGroup, isRequired: !currentGroup.isRequired, minSelection: !currentGroup.isRequired ? 1 : 0})}
                            className={`w-14 h-8 rounded-full transition-all relative ${currentGroup.isRequired ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${currentGroup.isRequired ? 'left-7' : 'left-1'}`}></div>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Min Selection</label>
                            <input 
                              type="number" 
                              value={currentGroup.minSelection}
                              onChange={(e) => setCurrentGroup({...currentGroup, minSelection: parseInt(e.target.value)})}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-500 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Max Selection</label>
                            <input 
                              type="number" 
                              value={currentGroup.maxSelection}
                              onChange={(e) => setCurrentGroup({...currentGroup, maxSelection: parseInt(e.target.value)})}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-500 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                          <Package size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Linked Items</h3>
                      </div>
                      {!isLinkedView && (
                        <div className="relative">
                          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 focus-within:border-teal-500 transition-all">
                            <Search size={16} className="text-slate-400" />
                            <input 
                              type="text" 
                              placeholder="Add existing product..."
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              className="bg-transparent border-none outline-none text-sm w-48 dark:text-white"
                            />
                          </div>
                          
                          {productSearch && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                              <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
                                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                                  <button 
                                    key={product.id}
                                    onClick={() => addProductToGroup(product)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-xl transition-all group/item"
                                  >
                                    <div className="text-left">
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-teal-600">{product.name}</p>
                                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">RS {product.price.toFixed(2)}</p>
                                    </div>
                                    <Plus size={16} className="text-slate-300 group-hover/item:text-teal-500" />
                                  </button>
                                )) : (
                                  <div className="p-4 text-center text-xs text-slate-500 italic">No products found</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detailLoading && (
                        <div className="col-span-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500">
                          Loading modifier details...
                        </div>
                      )}
                      {!detailLoading && detailError && (
                        <div className="col-span-full px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs font-bold text-rose-500">
                          {detailError}
                        </div>
                      )}
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext 
                          items={currentGroup.items.map(i => i.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {currentGroup.items.map(item => (
                            <SortableModifierItem 
                              key={item.id} 
                              item={item} 
                              isReadOnly={isLinkedView}
                              onRemove={removeItemFromGroup}
                              onUpdatePrice={handleUpdateItemPrice}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                      
                      {currentGroup.items.length === 0 && !detailLoading && (
                        <div className="col-span-full py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center text-center">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                            <Plus size={24} />
                          </div>
                          <p className="text-sm text-slate-500 font-bold">No linked items found</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">This topping is not used by any menu item</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button 
                    onClick={() => handleDelete(currentGroup.id)}
                    className="flex items-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all"
                  >
                    <Trash2 size={20} />
                    Delete Group
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
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 bg-teal-500/10 text-teal-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
                  <Layers size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Select a Group to Manage</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-10">
                  Choose an existing modifier group from the list or create a new one to start configuring your menu options.
                </p>
                <button 
                  onClick={handleCreateNew}
                  className="flex items-center gap-3 px-8 py-4 bg-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all group"
                >
                  <Plus size={24} />
                  Create Your First Group
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
