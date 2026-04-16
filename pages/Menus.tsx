import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Menu as MenuIcon, 
  CheckCircle2, 
  Save,
  X,
  Settings2,
  Globe,
  Smartphone,
  Monitor,
  Truck,
  ShoppingBag,
  Coffee,
  ArrowRight,
  MapPin,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Availability {
  day: string;
  enabled: boolean;
  slots: { start: string; end: string }[];
}

interface Menu {
  id: string;
  name: string;
  description: string;
  branches: string[];
  platforms: string[];
  serviceTypes: string[];
  isActive: boolean;
  order: number;
  availability: Availability[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_AVAILABILITY: Availability[] = DAYS.map(day => ({
  day,
  enabled: true,
  slots: [{ start: '00:00', end: '23:59' }]
}));

const MOCK_BRANCHES = [
  { id: 'b1', name: 'Downtown Branch', location: 'City Center' },
  { id: 'b2', name: 'Westside Mall', location: 'Food Court' },
  { id: 'b3', name: 'Airport Kiosk', location: 'Terminal 2' },
  { id: 'b4', name: 'Main Street', location: 'North Side' },
];

const PLATFORMS = [
  { id: 'web', label: 'Web Store', icon: <Globe size={16} /> },
  { id: 'app', label: 'Mobile App', icon: <Smartphone size={16} /> },
  { id: 'kiosk', label: 'Self Kiosk', icon: <Monitor size={16} /> },
];

const SERVICE_TYPES = [
  { id: 'delivery', label: 'Delivery', icon: <Truck size={16} /> },
  { id: 'pickup', label: 'Pickup', icon: <ShoppingBag size={16} /> },
  { id: 'dine-in', label: 'Dine-in', icon: <Coffee size={16} /> },
];

const INITIAL_MENUS: Menu[] = [
  {
    id: 'm1',
    name: 'Main Menu',
    description: 'Our primary menu featuring all classic items',
    branches: ['b1', 'b2', 'b4'],
    platforms: ['web', 'app'],
    serviceTypes: ['delivery', 'pickup'],
    isActive: true,
    order: 1,
    availability: DEFAULT_AVAILABILITY
  },
  {
    id: 'm2',
    name: 'Breakfast Menu',
    description: 'Available from 8 AM to 11 AM daily',
    branches: ['b1', 'b3'],
    platforms: ['web', 'app', 'kiosk'],
    serviceTypes: ['pickup', 'dine-in'],
    isActive: true,
    order: 2,
    availability: DEFAULT_AVAILABILITY
  }
];

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

export const Menus: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>(INITIAL_MENUS);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchSearch, setBranchSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateNew = () => {
    const newMenu: Menu = {
      id: generateId('menu'),
      name: '',
      description: '',
      branches: [],
      platforms: ['web', 'app'],
      serviceTypes: ['delivery', 'pickup'],
      isActive: true,
      order: menus.length + 1,
      availability: DEFAULT_AVAILABILITY
    };
    setCurrentMenu(newMenu);
    setIsEditing(true);
  };

  const handleEdit = (menu: Menu) => {
    setCurrentMenu({ ...menu });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu?')) {
      setMenus(menus.filter(m => m.id !== id));
      if (currentMenu?.id === id) {
        setIsEditing(false);
        setCurrentMenu(null);
      }
    }
  };

  const handleSave = async () => {
    if (!currentMenu) return;
    
    setIsSaving(true);
    try {
      // Prepare the "ideal JSON" for submission
      const payload = {
        event: 'menu_saved',
        timestamp: new Date().toISOString(),
        menu: {
          id: currentMenu.id,
          name: currentMenu.name,
          description: currentMenu.description,
          isActive: currentMenu.isActive,
          order: currentMenu.order,
          branches: currentMenu.branches.map(bId => {
            const branch = MOCK_BRANCHES.find(b => b.id === bId);
            return {
              id: bId,
              name: branch?.name || 'Unknown',
              location: branch?.location || 'Unknown'
            };
          }),
          platforms: currentMenu.platforms,
          serviceTypes: currentMenu.serviceTypes,
          availability: currentMenu.availability.filter(a => a.enabled).map(a => ({
            day: a.day,
            slots: a.slots
          }))
        }
      };

      // Submit to webhook
      const response = await fetch('https://automate.megnus.app/webhook/bwv3api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to submit to webhook');
      }

      // Update local state
      if (menus.find(m => m.id === currentMenu.id)) {
        setMenus(menus.map(m => m.id === currentMenu.id ? currentMenu : m));
      } else {
        setMenus([...menus, currentMenu]);
      }
      
      setIsEditing(false);
      setCurrentMenu(null);
      alert('Menu saved and submitted successfully!');
    } catch (error) {
      console.error('Error saving menu:', error);
      alert('Error saving menu. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelection = (field: 'platforms' | 'serviceTypes', value: string) => {
    if (!currentMenu) return;
    const currentList = currentMenu[field];
    const newList = currentList.includes(value)
      ? currentList.filter(v => v !== value)
      : [...currentList, value];
    
    setCurrentMenu({ ...currentMenu, [field]: newList });
  };

  const addBranch = (branchId: string) => {
    if (!currentMenu || currentMenu.branches.includes(branchId)) return;
    setCurrentMenu({
      ...currentMenu,
      branches: [...currentMenu.branches, branchId]
    });
    setBranchSearch('');
  };

  const removeBranch = (branchId: string) => {
    if (!currentMenu) return;
    setCurrentMenu({
      ...currentMenu,
      branches: currentMenu.branches.filter(id => id !== branchId)
    });
  };

  const filteredMenus = menus.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBranches = MOCK_BRANCHES.filter(b => 
    b.name.toLowerCase().includes(branchSearch.toLowerCase()) &&
    !currentMenu?.branches.includes(b.id)
  );

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
              <MenuIcon className="text-white" size={32} />
            </div>
            Menu Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Create and manage multiple menus for different branches and platforms</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95"
        >
          <Plus size={20} />
          Create New Menu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List Section */}
        <div className="lg:col-span-4 space-y-6">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-transparent focus:border-teal-500 rounded-2xl shadow-sm outline-none transition-all dark:text-white"
            />
          </div>

          <div className="space-y-4">
            {filteredMenus.map(menu => (
              <motion.div 
                layout
                key={menu.id}
                onClick={() => handleEdit(menu)}
                className={`p-5 bg-white dark:bg-slate-900 rounded-[32px] border-2 transition-all cursor-pointer group ${currentMenu?.id === menu.id ? 'border-teal-500 shadow-lg' : 'border-transparent hover:border-slate-200 dark:hover:border-slate-800 shadow-sm'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentMenu?.id === menu.id ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <MenuIcon size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{menu.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{menu.branches.length} Branches</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${menu.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                    {menu.isActive ? 'Active' : 'Draft'}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {menu.platforms.map(p => (
                    <span key={p} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-blue-500/10 text-blue-500 rounded-lg border border-blue-500/20 flex items-center gap-1">
                      {PLATFORMS.find(plat => plat.id === p)?.icon}
                      {p}
                    </span>
                  ))}
                  {menu.serviceTypes.map(s => (
                    <span key={s} className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 flex items-center gap-1">
                      {SERVICE_TYPES.find(st => st.id === s)?.icon}
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Management Section */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {isEditing && currentMenu ? (
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
                        {currentMenu.id ? 'Edit Menu' : 'New Menu'}
                      </h2>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure visibility and availability</p>
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
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Menu Name</label>
                        <input 
                          type="text" 
                          value={currentMenu.name}
                          onChange={(e) => setCurrentMenu({...currentMenu, name: e.target.value})}
                          placeholder="e.g. Summer Specials"
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                        <textarea 
                          value={currentMenu.description}
                          onChange={(e) => setCurrentMenu({...currentMenu, description: e.target.value})}
                          placeholder="What makes this menu special?"
                          className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none h-32 resize-none dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-teal-500" />
                          Status & Visibility
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">Active Status</p>
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Enable or disable this menu</p>
                            </div>
                            <button 
                              onClick={() => setCurrentMenu({...currentMenu, isActive: !currentMenu.isActive})}
                              className={`w-14 h-8 rounded-full transition-all relative ${currentMenu.isActive ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${currentMenu.isActive ? 'left-7' : 'left-1'}`}></div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Branch Selection */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                          <MapPin size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Applicable Branches</h3>
                      </div>
                      
                      <div className="relative">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 focus-within:border-teal-500 transition-all">
                          <Search size={16} className="text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search branch to add..."
                            value={branchSearch}
                            onChange={(e) => setBranchSearch(e.target.value)}
                            className="bg-transparent border-none outline-none text-sm w-48 dark:text-white"
                          />
                        </div>
                        
                        {branchSearch && (
                          <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
                              {filteredBranches.length > 0 ? filteredBranches.map(branch => (
                                <button 
                                  key={branch.id}
                                  onClick={() => addBranch(branch.id)}
                                  className="w-full flex items-center justify-between p-3 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-xl transition-all group/item"
                                >
                                  <div className="text-left">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover/item:text-teal-600">{branch.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">{branch.location}</p>
                                  </div>
                                  <Plus size={16} className="text-slate-300 group-hover/item:text-teal-500" />
                                </button>
                              )) : (
                                <div className="p-4 text-center text-xs text-slate-500 italic">No branches found</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentMenu.branches.map(branchId => {
                        const branch = MOCK_BRANCHES.find(b => b.id === branchId);
                        if (!branch) return null;
                        return (
                          <div
                            key={branch.id}
                            className="p-4 rounded-2xl border-2 border-teal-500 bg-teal-500/5 transition-all text-left group relative overflow-hidden"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center">
                                <MapPin size={16} />
                              </div>
                              <button 
                                onClick={() => removeBranch(branch.id)}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{branch.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{branch.location}</p>
                          </div>
                        );
                      })}
                      
                      {currentMenu.branches.length === 0 && (
                        <div className="col-span-full py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] flex flex-col items-center justify-center text-center">
                          <p className="text-sm text-slate-500 font-bold">No branches assigned</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Search and add branches above</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Platforms & Service Types */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                          <Globe size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Platforms</h3>
                      </div>
                      <div className="space-y-3">
                        {PLATFORMS.map(platform => (
                          <button
                            key={platform.id}
                            onClick={() => toggleSelection('platforms', platform.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${currentMenu.platforms.includes(platform.id) ? 'border-blue-500 bg-blue-500/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentMenu.platforms.includes(platform.id) ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {platform.icon}
                              </div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{platform.label}</span>
                            </div>
                            {currentMenu.platforms.includes(platform.id) && <CheckCircle2 size={18} className="text-blue-500" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                          <Truck size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Service Types</h3>
                      </div>
                      <div className="space-y-3">
                        {SERVICE_TYPES.map(type => (
                          <button
                            key={type.id}
                            onClick={() => toggleSelection('serviceTypes', type.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${currentMenu.serviceTypes.includes(type.id) ? 'border-amber-500 bg-amber-500/5' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentMenu.serviceTypes.includes(type.id) ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                {type.icon}
                              </div>
                              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{type.label}</span>
                            </div>
                            {currentMenu.serviceTypes.includes(type.id) && <CheckCircle2 size={18} className="text-amber-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

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
                          const firstDay = currentMenu.availability[0];
                          setCurrentMenu({
                            ...currentMenu,
                            availability: currentMenu.availability.map(a => ({
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
                      {currentMenu.availability.map((dayAvail, idx) => (
                        <div 
                          key={dayAvail.day}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${dayAvail.enabled ? 'border-teal-500/20 bg-teal-500/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 opacity-60'}`}
                        >
                          <div className="flex items-center gap-4 min-w-[140px]">
                            <button 
                              onClick={() => {
                                const newAvail = [...currentMenu.availability];
                                newAvail[idx] = { ...dayAvail, enabled: !dayAvail.enabled };
                                setCurrentMenu({ ...currentMenu, availability: newAvail });
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
                                      const newAvail = [...currentMenu.availability];
                                      newAvail[idx].slots[sIdx].start = e.target.value;
                                      setCurrentMenu({ ...currentMenu, availability: newAvail });
                                    }}
                                    className="bg-transparent text-xs font-bold dark:text-white outline-none"
                                  />
                                  <span className="text-slate-400 text-[10px] font-bold">TO</span>
                                  <input 
                                    type="time" 
                                    value={slot.end}
                                    onChange={(e) => {
                                      const newAvail = [...currentMenu.availability];
                                      newAvail[idx].slots[sIdx].end = e.target.value;
                                      setCurrentMenu({ ...currentMenu, availability: newAvail });
                                    }}
                                    className="bg-transparent text-xs font-bold dark:text-white outline-none"
                                  />
                                  {dayAvail.slots.length > 1 && (
                                    <button 
                                      onClick={() => {
                                        const newAvail = [...currentMenu.availability];
                                        newAvail[idx].slots = newAvail[idx].slots.filter((_, i) => i !== sIdx);
                                        setCurrentMenu({ ...currentMenu, availability: newAvail });
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
                                  const newAvail = [...currentMenu.availability];
                                  newAvail[idx].slots.push({ start: '09:00', end: '17:00' });
                                  setCurrentMenu({ ...currentMenu, availability: newAvail });
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
                    onClick={() => handleDelete(currentMenu.id)}
                    className="flex items-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all"
                  >
                    <Trash2 size={20} />
                    Delete Menu
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
                      className={`flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isSaving ? (
                        <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 dark:border-slate-600 dark:border-t-slate-100 rounded-full animate-spin"></div>
                      ) : (
                        <Save size={20} />
                      )}
                      {isSaving ? 'Saving...' : 'Save Menu'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800">
                <div className="w-24 h-24 bg-teal-500/10 text-teal-500 rounded-full flex items-center justify-center mb-8 animate-bounce">
                  <MenuIcon size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Select a Menu to Configure</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed mb-10">
                  Manage your various menus, assign them to specific branches, and control which platforms and service types they appear on.
                </p>
                <button 
                  onClick={handleCreateNew}
                  className="flex items-center gap-3 px-8 py-4 bg-teal-500 text-white rounded-2xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all group"
                >
                  <Plus size={24} />
                  Create Your First Menu
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
