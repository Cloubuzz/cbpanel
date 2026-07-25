import React from 'react';
import { GitBranch, Clock, Edit2, Trash2, Play, Pause } from 'lucide-react';
import { motion } from 'motion/react';
import type { Automation } from '../types';

interface Props {
  automation: Automation;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const AutomationCard: React.FC<Props> = ({ automation, onEdit, onDelete, onToggle }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="glass-card group rounded-[32px] border border-white/10 dark:border-teal-900/20 overflow-hidden hover:border-teal-500/30 transition-all duration-500"
  >
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${
            automation.status === 'active' ? 'bg-teal-500/10 text-teal-500' :
            automation.status === 'paused' ? 'bg-amber-500/10 text-amber-500' :
            'bg-slate-500/10 text-slate-500'
          }`}>
            <GitBranch size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-teal-500 transition-colors">
              {automation.name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                automation.status === 'active' ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400' :
                automation.status === 'paused' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                'bg-slate-500/10 text-slate-600 dark:text-slate-400'
              }`}>
                {automation.status}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Clock size={10} />
                Modified {automation.lastModified}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(automation.id)} className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all">
            <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete(automation.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Nodes', value: automation.nodes },
          { label: 'Enrolled', value: automation.enrolled },
          { label: 'Completed', value: automation.completed },
        ].map(stat => (
          <div key={stat.label} className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: automation.enrolled > 0 ? `${(automation.completed / automation.enrolled) * 100}%` : '0%' }}
            className="h-full bg-teal-500"
          />
        </div>
        <button
          onClick={() => onToggle(automation.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            automation.status === 'active'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
              : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20'
          }`}
        >
          {automation.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
          {automation.status === 'active' ? 'Pause' : 'Activate'}
        </button>
      </div>
    </div>
  </motion.div>
);
