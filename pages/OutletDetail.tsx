import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  Phone, 
  Clock, 
  Truck, 
  DollarSign, 
  Plus, 
  Trash2, 
  Map as MapIcon, 
  Store,
  Mail,
  Info,
  CheckCircle2,
  AlertCircle,
  Maximize2,
  Minimize2,
  MousePointer2,
  Layers,
  X,
  TrendingUp,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSelector } from '../store/hooks';
import { selectToken } from '../store/selectors/appSelectors';
import { fetchOutletDetail } from '../services/outletsApi';

interface DeliveryArea {
  id: string;
  name: string;
  time: string;
  fee: number;
  isActive: boolean;
  polygon?: { lat: number; lng: number }[];
}

interface OutletDetailProps {
  onBack: () => void;
  outletId?: string; // If undefined, it's "Add" mode
}

export const OutletDetail: React.FC<OutletDetailProps> = ({ onBack, outletId }) => {
  const isEdit = !!outletId;
  const token = useAppSelector(selectToken);
  
  // Form State
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  
  // Delivery Areas State
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([
    { id: '1', name: 'City Center', time: '15-20', fee: 2.5, isActive: true },
    { id: '2', name: 'Westside', time: '25-35', fee: 5.0, isActive: true },
    { id: '3', name: 'North Hills', time: '40-50', fee: 8.5, isActive: false },
  ]);

  // Map Modal State
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedAreaForMap, setSelectedAreaForMap] = useState<string | null>(null);

  // Operating Hours State
  const [operatingHours, setOperatingHours] = useState([
    { days: 'Mon - Fri', openTime: '09:00 AM', closeTime: '11:00 PM' },
    { days: 'Sat - Sun', openTime: '10:00 AM', closeTime: '12:00 AM' }
  ]);
  const [isEditingHours, setIsEditingHours] = useState(false);

  useEffect(() => {
    const loadOutlet = async () => {
      if (!isEdit || !token || !outletId) return;

      try {
        const outlet = await fetchOutletDetail(token, outletId);
        setName(outlet.name || '');
        setAddress(outlet.address || '');
        setPhone(outlet.phone || '');
        setEmail(outlet.email || '');
        setIsActive(outlet.OutletStatus === 'In Business');
        setIsAcceptingOrders(outlet.CloseReason === 'AutoAcceptanceOpen' || outlet.OutletStatus === 'In Business');
      } catch (error) {
        console.error('Failed to load outlet detail:', error);
      }
    };

    loadOutlet();
  }, [isEdit, token, outletId]);

  const DAYS_OPTIONS = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'Mon - Fri', 'Sat - Sun', 'All Week'
  ];

  const TIME_OPTIONS = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    const ampm = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour.toString().padStart(2, '0')}:${minute} ${ampm}`;
  });

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      type: 'outlet',
      action: isEdit ? 'update' : 'create',
      data: {
        id: outletId,
        name,
        address,
        phone,
        email,
        isActive,
        isAcceptingOrders,
        deliveryAreas,
        operatingHours
      },
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
        alert('Outlet saved and submitted successfully!');
        onBack();
      } else {
        throw new Error('Failed to submit to webhook');
      }
    } catch (error) {
      console.error('Error saving outlet:', error);
      alert('Outlet saved locally, but webhook submission failed.');
      onBack();
    } finally {
      setIsSaving(false);
    }
  };

  const addArea = () => {
    const newArea: DeliveryArea = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      time: '30',
      fee: 0,
      isActive: true
    };
    setDeliveryAreas([...deliveryAreas, newArea]);
  };

  const removeArea = (id: string) => {
    setDeliveryAreas(deliveryAreas.filter(a => a.id !== id));
  };

  const updateArea = (id: string, field: keyof DeliveryArea, value: string | number | boolean | { lat: number; lng: number }[]) => {
    setDeliveryAreas(deliveryAreas.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20 max-w-[1200px] mx-auto">
      
      {/* Top Navigation & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isEdit ? 'Edit Outlet' : 'Add New Outlet'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEdit ? `Managing ID: ${outletId}` : 'Configure your new restaurant location'}
            </p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: General Info */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Basic Information Section */}
          <section className="glass-card rounded-[32px] p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-teal-500/10 text-teal-500 rounded-lg">
                <Info size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Outlet Name</label>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Downtown Central"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 000 000 0000"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="outlet@brand.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full street address, city, state"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Areas Section */}
          <section className="glass-card rounded-[32px] p-8 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Truck size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delivery Areas</h2>
                  <p className="text-[10px] text-slate-500 font-medium">Define zones, times, and fees</p>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setSelectedAreaForMap(null);
                  setIsMapModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all border border-blue-200/50 dark:border-blue-900/50"
              >
                <MapIcon size={14} />
                View Delivery Map
              </button>
            </div>

            {/* Area Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <div className="col-span-3">Area Name</div>
              <div className="col-span-3">Delivery Time</div>
              <div className="col-span-3">Fee ($)</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {deliveryAreas.map((area) => (
                  <motion.div 
                    key={area.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3 md:p-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl group hover:border-teal-500/30 transition-all"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-3">
                        <label className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Area Name</label>
                        <input 
                          type="text" 
                          value={area.name}
                          onChange={(e) => updateArea(area.id, 'name', e.target.value)}
                          placeholder="e.g. Zone A"
                          className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-transparent focus:border-teal-500/50 rounded-xl text-sm focus:outline-none text-slate-900 dark:text-white transition-all"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Time (min)</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                          <input 
                            type="text" 
                            value={area.time}
                            onChange={(e) => updateArea(area.id, 'time', e.target.value)}
                            placeholder="20-30"
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-transparent focus:border-teal-500/50 rounded-xl text-sm focus:outline-none text-slate-900 dark:text-white transition-all"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <label className="md:hidden text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Fee</label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-500" size={12} />
                          <input 
                            type="number" 
                            value={area.fee}
                            onChange={(e) => updateArea(area.id, 'fee', parseFloat(e.target.value) || 0)}
                            className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-transparent focus:border-teal-500/50 rounded-xl text-sm focus:outline-none text-slate-900 dark:text-white transition-all"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-3 flex items-center justify-end gap-1">
                        <button 
                          onClick={() => {
                            setSelectedAreaForMap(area.id);
                            setIsMapModalOpen(true);
                          }}
                          title="Draw Polygon"
                          className="p-2 rounded-xl text-blue-500 bg-blue-500/10 hover:bg-blue-500/20 transition-all"
                        >
                          <Layers size={16} />
                        </button>
                        <button 
                          onClick={() => updateArea(area.id, 'isActive', !area.isActive)}
                          title={area.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-2 rounded-xl transition-all ${area.isActive ? 'text-teal-500 bg-teal-500/10 hover:bg-teal-500/20' : 'text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'}`}
                        >
                          {area.isActive ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                        </button>
                        <button 
                          onClick={() => removeArea(area.id)}
                          title="Delete Area"
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <button 
                onClick={addArea}
                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:border-teal-500 hover:text-teal-500 hover:bg-teal-50/30 dark:hover:bg-teal-900/10 transition-all font-bold text-xs uppercase tracking-widest"
              >
                <Plus size={16} />
                Add New Delivery Area
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar Settings */}
        <div className="space-y-8">
          
          {/* Status & Visibility */}
          <section className="glass-card rounded-[32px] p-8 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Status & Visibility</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Active Status</p>
                  <p className="text-[10px] text-slate-500">Visible to customers</p>
                </div>
                <button 
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isActive ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <motion.div 
                    animate={{ x: isActive ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Accepting Orders</p>
                  <p className="text-[10px] text-slate-500">Open for new orders</p>
                </div>
                <button 
                  onClick={() => setIsAcceptingOrders(!isAcceptingOrders)}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${isAcceptingOrders ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <motion.div 
                    animate={{ x: isAcceptingOrders ? 24 : 4 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm" 
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Operating Hours Summary */}
          <section className="glass-card rounded-[32px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                  <Clock size={18} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Operating Hours</h2>
              </div>
              <button 
                onClick={() => setIsEditingHours(!isEditingHours)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                {isEditingHours ? 'Done' : 'Edit'}
              </button>
            </div>

            <div className="space-y-4">
              {operatingHours.map((item, i) => (
                <div key={i} className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Days</label>
                      {isEditingHours ? (
                        <select 
                          value={item.days}
                          onChange={(e) => {
                            const newHours = [...operatingHours];
                            newHours[i].days = e.target.value;
                            setOperatingHours(newHours);
                          }}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                        >
                          {DAYS_OPTIONS.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                      ) : (
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{item.days}</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Open</label>
                        {isEditingHours ? (
                          <select 
                            value={item.openTime}
                            onChange={(e) => {
                              const newHours = [...operatingHours];
                              newHours[i].openTime = e.target.value;
                              setOperatingHours(newHours);
                            }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                          >
                            {TIME_OPTIONS.map(time => <option key={time} value={time}>{time}</option>)}
                          </select>
                        ) : (
                          <span className="text-sm text-slate-500">{item.openTime}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Close</label>
                        {isEditingHours ? (
                          <select 
                            value={item.closeTime}
                            onChange={(e) => {
                              const newHours = [...operatingHours];
                              newHours[i].closeTime = e.target.value;
                              setOperatingHours(newHours);
                            }}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white"
                          >
                            {TIME_OPTIONS.map(time => <option key={time} value={time}>{time}</option>)}
                          </select>
                        ) : (
                          <span className="text-sm text-slate-500">{item.closeTime}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isEditingHours && (
                <button 
                  onClick={() => setOperatingHours([...operatingHours, { days: 'Monday', openTime: '09:00 AM', closeTime: '11:00 PM' }])}
                  className="w-full py-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-400 hover:text-teal-500 hover:border-teal-500 transition-all uppercase tracking-widest"
                >
                  Add Time Slot
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50">
                <Clock size={14} />
                <span>Currently {isEdit ? 'Open' : 'Closed'}</span>
              </div>
            </div>
          </section>

          {/* Performance Snapshot Redesign */}
          {isEdit && (
            <section className="glass-card rounded-[32px] p-8 space-y-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <TrendingUp size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Performance</h2>
                  <div className="px-2 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    Live Data
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Main Stat */}
                  <div className="p-6 bg-teal-600 rounded-3xl text-white shadow-xl shadow-teal-900/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700" />
                    <p className="text-[10px] uppercase font-bold tracking-widest opacity-70 mb-1">Monthly Revenue</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black tracking-tighter">$42,850</p>
                      <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded-full">+12.5%</span>
                    </div>
                  </div>

                  {/* Grid Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded-lg">
                          <Truck size={14} />
                        </div>
                        <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Orders</p>
                      </div>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">1,240</p>
                      <p className="text-[10px] text-slate-500 mt-1">Avg 42/day</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
                          <Star size={14} />
                        </div>
                        <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Rating</p>
                      </div>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">4.8/5</p>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= 4 ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mini Chart Simulation */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Weekly Trend</p>
                      <span className="text-[10px] font-bold text-teal-500">Upward</span>
                    </div>
                    <div className="flex items-end justify-between h-12 gap-1">
                      {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                        <motion.div 
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: i * 0.1 }}
                          className={`flex-1 rounded-t-sm ${i === 5 ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Map Polygon Modal */}
      <AnimatePresence>
        {isMapModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMapModalOpen(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl h-[80vh] bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                    <MapIcon size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {selectedAreaForMap 
                        ? `Draw Polygon: ${deliveryAreas.find(a => a.id === selectedAreaForMap)?.name}`
                        : 'Delivery Area Map View'}
                    </h2>
                    <p className="text-xs text-slate-500">Click on the map to start drawing your delivery boundary</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">
                    <MousePointer2 size={14} />
                    Select
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-500 transition-all">
                    <Plus size={14} />
                    Draw Polygon
                  </button>
                  <button 
                    onClick={() => setIsMapModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Map Content Placeholder */}
              <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 overflow-hidden">
                {/* Simulated Google Map Background */}
                <div className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none">
                   <div className="w-full h-full bg-[url('https://picsum.photos/seed/map/1200/800')] bg-cover bg-center grayscale" />
                </div>
                
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />

                {/* Simulated Drawing UI */}
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="relative w-[60%] h-[60%]">
                      {/* Simulated Polygon */}
                      <svg className="w-full h-full drop-shadow-2xl">
                        <polygon 
                          points="100,100 400,150 450,400 150,450" 
                          className="fill-teal-500/20 stroke-teal-500 stroke-2"
                        />
                        <circle cx="100" cy="100" r="6" className="fill-white stroke-teal-500 stroke-2 cursor-pointer" />
                        <circle cx="400" cy="150" r="6" className="fill-white stroke-teal-500 stroke-2 cursor-pointer" />
                        <circle cx="450" cy="400" r="6" className="fill-white stroke-teal-500 stroke-2 cursor-pointer" />
                        <circle cx="150" cy="450" r="6" className="fill-white stroke-teal-500 stroke-2 cursor-pointer" />
                      </svg>
                      
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">Polygon Mode Active</p>
                        <p className="text-[10px] text-slate-500">Drag points to adjust delivery area</p>
                      </div>
                   </div>
                </div>

                {/* Map Controls */}
                <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                   <button className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-500 transition-colors">
                      <Maximize2 size={20} />
                   </button>
                   <button className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-500 transition-colors">
                      <Minimize2 size={20} />
                   </button>
                </div>

                <div className="absolute top-8 left-8 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg max-w-xs">
                   <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                     <Info size={14} className="text-blue-500" />
                     Drawing Instructions
                   </h3>
                   <ul className="text-[10px] text-slate-500 space-y-1.5 list-disc pl-4">
                     <li>Click anywhere to add a point</li>
                     <li>Drag points to reshape the zone</li>
                     <li>Double click a point to remove it</li>
                     <li>Close the loop to complete the area</li>
                   </ul>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="text-xs text-slate-500">
                   Area Coverage: <span className="font-bold text-slate-900 dark:text-white">12.4 sq km</span>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsMapModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={() => setIsMapModalOpen(false)}
                    className="px-8 py-2.5 rounded-xl text-sm font-bold bg-teal-600 text-white shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all"
                  >
                    Save Polygon
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
