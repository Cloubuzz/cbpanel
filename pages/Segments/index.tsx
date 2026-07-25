import React, { useState } from 'react';
import { Users, Search, Filter, Plus, BarChart3, ShoppingCart, Zap } from 'lucide-react';
import { SegmentCard } from './components/SegmentCard';
import type { Segment } from './types';

const FILTER_TABS = ['ALL', 'HIGH POTENTIAL', 'MEDIUM POTENTIAL', 'LOW POTENTIAL', 'ARCHIVED'];

export const Segments: React.FC = () => {
  const [segments] = useState<Segment[]>([]);
  const [filter, setFilter] = useState('ALL');

  const filtered = segments.filter(s => {
    if (filter === 'ALL') return true;
    if (filter.includes('POTENTIAL')) return s.potential.toUpperCase() === filter.split(' ')[0];
    return true;
  });

  const totalReachable = segments.reduce((sum, s) => sum + s.count, 0);
  const avgEngagementScore = segments.length > 0
    ? Math.round(segments.reduce((sum, s) => sum + s.score, 0) / segments.length)
    : 0;
  const highPotentialRevenue = segments
    .filter(s => s.potential === 'High')
    .reduce((sum, s) => sum + s.count * s.avgOrderValue, 0);

  const summaryStats = [
    { label: 'Total Reachable', value: totalReachable.toLocaleString(), subtext: 'Across all channels (Email, SMS, WA)', icon: Users, colorClass: 'text-teal-600 bg-teal-600' },
    { label: 'Avg. Engagement Score', value: `${avgEngagementScore}/100`, subtext: 'Average across all segments', icon: BarChart3, colorClass: 'text-blue-600 bg-blue-600' },
    { label: 'High Potential Revenue', value: `RS ${Math.round(highPotentialRevenue).toLocaleString()}`, subtext: 'Est. from high-potential segments', icon: ShoppingCart, colorClass: 'text-emerald-600 bg-emerald-600' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Audience Segments</h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">{segments.length}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Organize your customers into high-performing groups for targeted campaigns.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search segments or tags..." className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white placeholder:text-slate-500" />
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-teal-400 transition-colors"><Filter size={18} /></button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all whitespace-nowrap">
            <Plus size={18} />
            <span className="hidden sm:inline">Create Segment</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryStats.map(stat => (
          <div key={stat.label} className="flex items-center gap-4 p-4 rounded-xl glass-card border border-white/10 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className={`p-3 rounded-xl bg-opacity-10 dark:bg-opacity-20 ${stat.colorClass.split(' ')[1]}/10`}>
              <stat.icon size={24} className={stat.colorClass.split(' ')[0]} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-[10px] text-slate-400">{stat.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200 dark:border-slate-800">
        {FILTER_TABS.map(status => (
          <button key={status} onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
              filter === status
                ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/10'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {status === 'ALL' ? 'All Segments' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-slate-400 py-10">
          <Users size={32} className="opacity-50" />
          <p className="text-sm font-medium">No segments yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(segment => <SegmentCard key={segment.id} segment={segment} />)}
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-teal-500 dark:hover:border-teal-500/50 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <Zap size={32} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generate AI Segment</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Let AI find hidden opportunities.</p>
        </div>
      </div>
    </div>
  );
};
