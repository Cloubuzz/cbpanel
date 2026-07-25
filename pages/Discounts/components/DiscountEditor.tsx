import React, { useRef } from 'react';
import { Settings2, X, Tag, Image as ImageIcon, Upload, Trash2, Percent, Calendar, AlertCircle, Save } from 'lucide-react';
import { motion } from 'motion/react';
import type { Discount } from '../types';

interface Props {
  discount: Discount;
  isNew: boolean;
  onChange: (d: Discount) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export const DiscountEditor: React.FC<Props> = ({ discount, isNew, onChange, onSave, onDelete, onCancel }) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange({ ...discount, image: reader.result as string });
    reader.readAsDataURL(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-slate-900 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0"><Settings2 size={20} /></div>
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{isNew ? 'New Discount' : 'Edit Discount'}</h2>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure discount parameters and schedule</p>
          </div>
        </div>
        <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X size={24} /></button>
      </div>

      <div className="p-5 md:p-8 space-y-8 md:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Discount Name</label>
              <input type="text" value={discount.name} onChange={e => onChange({ ...discount, name: e.target.value })} placeholder="e.g. Ramadan Special"
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
              <textarea value={discount.description} onChange={e => onChange({ ...discount, description: e.target.value })} placeholder="Describe this discount..."
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none h-24 resize-none dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Discount Type</label>
                <select value={discount.type} onChange={e => onChange({ ...discount, type: e.target.value as Discount['type'] })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (PKR)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Value</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{discount.type === 'PERCENTAGE' ? <Percent size={16} /> : <Tag size={16} />}</div>
                  <input type="number" value={discount.value} onChange={e => onChange({ ...discount, value: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl text-sm transition-all outline-none dark:text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2"><ImageIcon size={16} className="text-amber-500" /> Discount Banner</h3>
                <button onClick={() => fileRef.current?.click()} className="text-xs font-bold text-amber-500 uppercase tracking-widest hover:text-amber-600 transition-colors flex items-center gap-1"><Upload size={14} /> Upload</button>
                <input type="file" ref={fileRef} onChange={handleFile} accept="image/*" className="hidden" />
              </div>
              <div className="w-full aspect-[4/1] rounded-2xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center group relative">
                {discount.image ? (
                  <>
                    <img src={discount.image} alt="Banner" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                      <button onClick={() => fileRef.current?.click()} className="p-2 bg-white text-slate-900 rounded-lg hover:scale-110 transition-transform"><Upload size={18} /></button>
                      <button onClick={() => onChange({ ...discount, image: undefined })} className="p-2 bg-rose-500 text-white rounded-lg hover:scale-110 transition-transform"><Trash2 size={18} /></button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-300"><ImageIcon size={32} /><span className="text-[10px] font-bold uppercase tracking-widest">No Banner Image</span></div>
                )}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Active Status</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Enable or disable this discount</p>
                </div>
                <button onClick={() => onChange({ ...discount, isActive: !discount.isActive })}
                  className={`w-14 h-8 rounded-full transition-all relative ${discount.isActive ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${discount.isActive ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center"><Calendar size={18} /></div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Validity Period</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
              <input type="date" value={discount.startDate} onChange={e => onChange({ ...discount, startDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">End Date</label>
              <input type="date" value={discount.endDate} onChange={e => onChange({ ...discount, endDate: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-amber-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white" />
            </div>
          </div>
          <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 flex gap-3">
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
            <p className="text-[11px] text-slate-500 leading-relaxed">Store-wide discounts are applied automatically to all eligible items during the validity period. Ensure your dates are correct to avoid overlapping promotions.</p>
          </div>
        </div>
      </div>

      <div className="p-5 md:p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <button onClick={onDelete} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all">
          <Trash2 size={20} /> Delete Discount
        </button>
        <div className="w-full md:w-auto flex items-center gap-4">
          <button onClick={onCancel} className="flex-1 md:flex-none px-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-all">Cancel</button>
          <button onClick={onSave}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold shadow-xl transition-all hover:scale-105 active:scale-95">
            <Save size={20} />
            Save Discount
          </button>
        </div>
      </div>
    </motion.div>
  );
};
