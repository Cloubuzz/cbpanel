import React from 'react';
import { GripVertical, Trash2, Layers } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MenuSize } from '../types';

interface SortableSizeItemProps {
  size: MenuSize;
  onUpdate: (id: string, updates: Partial<MenuSize>) => void;
  onRemove: (id: string) => void;
  onOpenModifiers: (id: string) => void;
}

export const SortableSizeItem: React.FC<SortableSizeItemProps> = ({ size, onUpdate, onRemove, onOpenModifiers }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: size.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto' as const,
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
          <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500 transition-colors">
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
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">RCode</label>
          <input
            type="text"
            value={size.rCode || ''}
            onChange={(e) => onUpdate(size.id, { rCode: e.target.value })}
            placeholder="RCode"
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-teal-500 transition-all"
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
          <button onClick={() => onRemove(size.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-all">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
