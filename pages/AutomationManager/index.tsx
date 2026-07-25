import React, { useState } from 'react';
import { Plus, Search, GitBranch, Users, CheckCircle2, Play } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { AutomationCard } from './components/AutomationCard';
import { INITIAL_AUTOMATIONS } from './constants';
import type { Automation, AutomationManagerProps } from './types';

export const AutomationManager: React.FC<AutomationManagerProps> = ({ onAdd, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'draft'>('all');
  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS);

  const filtered = automations.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (id: string) =>
    setAutomations(prev => prev.map(a =>
      a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a
    ));

  const deleteAutomation = (id: string) =>
    setAutomations(prev => prev.filter(a => a.id !== id));

  const totalEnrolled = automations.reduce((sum, a) => sum + a.enrolled, 0);
  const totalCompleted = automations.reduce((sum, a) => sum + a.completed, 0);
  const completionRate = totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  const stats = [
    { label: 'Total Automations', value: automations.length, icon: <GitBranch className="text-teal-500" /> },
    { label: 'Active Now', value: automations.filter(a => a.status === 'active').length, icon: <Play className="text-blue-500" /> },
    { label: 'Total Enrolled', value: totalEnrolled.toLocaleString(), icon: <Users className="text-purple-500" /> },
    { label: 'Completion Rate', value: `${completionRate}%`, icon: <CheckCircle2 className="text-emerald-500" /> },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Business <span className="text-teal-500">Automation</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Design and manage your automated workflows.</p>
        </div>
        <button onClick={onAdd} className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all hover:scale-[1.02] active:scale-95">
          <Plus size={20} />
          Create Automation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-[32px] border border-white/10 dark:border-teal-900/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">{stat.icon}</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-[28px] border border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search automations..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {(['all', 'active', 'paused', 'draft'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20'
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map(automation => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              onEdit={onEdit}
              onDelete={deleteAutomation}
              onToggle={toggleStatus}
            />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-400 mb-6">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {automations.length === 0 ? 'No automations yet' : 'No automations found'}
          </h3>
          <p className="text-slate-500 max-w-xs">
            {automations.length === 0 ? 'Create your first automation to get started.' : 'Try adjusting your search or filters.'}
          </p>
        </div>
      )}
    </div>
  );
};
