import React, { useState } from 'react';
import { CheckCircle2, Save, Eye, EyeOff } from 'lucide-react';

export interface Integration {
  id: string;
  name: string;
  provider: string;
  icon: React.ElementType;
  status: 'connected' | 'disconnected' | 'error';
  color: string;
  description: string;
  fields: { label: string; value: string; type: 'text' | 'password' }[];
}

export const IntegrationCard: React.FC<{ integration: Integration }> = ({ integration }) => {
  const [expanded, setExpanded] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);

  return (
    <div className={`
      glass-card rounded-2xl overflow-hidden transition-all duration-300
      ${expanded ? 'ring-2 ring-teal-500/20' : ''}
    `}>
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
             <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm ${integration.status === 'connected' ? 'grayscale-0' : 'grayscale opacity-70'}`}>
                <integration.icon size={28} className={integration.color.split(' ')[0]} />
             </div>
             <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                   {integration.name}
                   {integration.status === 'connected' && <CheckCircle2 size={14} className="text-emerald-500" />}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{integration.description}</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 border border-slate-200 dark:border-slate-700">
                     {integration.provider}
                   </span>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                     integration.status === 'connected'
                       ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                       : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                   }`}>
                     {integration.status === 'connected' ? 'Active' : 'Not Connected'}
                   </span>
                </div>
             </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
              integration.status === 'connected'
                ? 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                : 'bg-teal-600 text-white border-transparent hover:bg-teal-500 shadow-lg shadow-teal-900/20'
            }`}
          >
            {integration.status === 'connected' ? (expanded ? 'Close' : 'Configure') : 'Connect'}
          </button>
        </div>

        {/* Configuration Form (Expandable) */}
        {expanded && (
           <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 animate-fade-in">
              {integration.fields.map((field, idx) => (
                <div key={idx}>
                   <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 block">
                     {field.label}
                   </label>
                   <div className="relative">
                     <input
                       type={field.type === 'password' && !showSecrets ? 'password' : 'text'}
                       defaultValue={field.value}
                       className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-slate-800 dark:text-slate-200"
                     />
                     {field.type === 'password' && (
                       <button
                         onClick={() => setShowSecrets(!showSecrets)}
                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                       >
                         {showSecrets ? <EyeOff size={16}/> : <Eye size={16}/>}
                       </button>
                     )}
                   </div>
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                 {integration.status === 'connected' && (
                   <button className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                     Disconnect
                   </button>
                 )}
                 <button className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2">
                   <Save size={14} /> Save Changes
                 </button>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};
