import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Play, 
  Pause, 
  Trash2, 
  Edit2, 
  GitBranch, 
  Users, 
  CheckCircle2, 
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Automation {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  nodes: number;
  enrolled: number;
  completed: number;
  lastModified: string;
  type: 'marketing' | 'operational' | 'support';
}

interface AutomationManagerProps {
  onAdd: () => void;
  onEdit: (id: string) => void;
}

export const AutomationManager: React.FC<AutomationManagerProps> = ({ onAdd, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'draft'>('all');

  const [automations, setAutomations] = useState<Automation[]>([
    { 
      id: '1', 
      name: 'Welcome Series - New Customers', 
      status: 'active', 
      nodes: 8, 
      enrolled: 1240, 
      completed: 850, 
      lastModified: '2024-03-20',
      type: 'marketing'
    },
    { 
      id: '2', 
      name: 'Order Confirmation Flow', 
      status: 'active', 
      nodes: 5, 
      enrolled: 4520, 
      completed: 4510, 
      lastModified: '2024-03-18',
      type: 'operational'
    },
    { 
      id: '3', 
      name: 'Abandoned Cart Recovery', 
      status: 'paused', 
      nodes: 12, 
      enrolled: 850, 
      completed: 120, 
      lastModified: '2024-03-15',
      type: 'marketing'
    },
    { 
      id: '4', 
      name: 'Feedback Collection', 
      status: 'draft', 
      nodes: 4, 
      enrolled: 0, 
      completed: 0, 
      lastModified: '2024-03-10',
      type: 'support'
    },
  ]);

  const filteredAutomations = automations.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (id: string) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'active' ? 'paused' : 'active' };
      }
      return a;
    }));
  };

  const deleteAutomation = (id: string) => {
    setAutomations(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Business <span className="text-teal-500">Automation</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Design and manage your automated workflows and customer journeys.
          </p>
        </div>
        <button 
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={20} />
          <span>Create Automation</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Automations', value: automations.length, icon: <GitBranch className="text-teal-500" /> },
          { label: 'Active Now', value: automations.filter(a => a.status === 'active').length, icon: <Play className="text-blue-500" /> },
          { label: 'Total Enrolled', value: '6,610', icon: <Users className="text-purple-500" /> },
          { label: 'Completion Rate', value: '82%', icon: <CheckCircle2 className="text-emerald-500" /> },
        ].map((stat, i) => (
          <div key={i} className="glass-card p-6 rounded-[32px] border border-white/10 dark:border-teal-900/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-[28px] border border-white/10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search automations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {(['all', 'active', 'paused', 'draft'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap
                ${filterStatus === status 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredAutomations.map((automation) => (
            <motion.div
              key={automation.id}
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
                    <button 
                      onClick={() => onEdit(automation.id)}
                      className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => deleteAutomation(automation.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nodes</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{automation.nodes}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Enrolled</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{automation.enrolled}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{automation.completed}</p>
                  </div>
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
                    onClick={() => toggleStatus(automation.id)}
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
          ))}
        </AnimatePresence>
      </div>

      {filteredAutomations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center text-slate-400 mb-6">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No automations found</h3>
          <p className="text-slate-500 max-w-xs">Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};
