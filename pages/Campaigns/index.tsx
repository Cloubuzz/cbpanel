import React, { useState } from 'react';
import { Plus, Search, Filter, Megaphone } from 'lucide-react';
import { CampaignCard } from './components/CampaignCard';
import type { Campaign } from './types';

const FILTER_TABS = ['ALL', 'ACTIVE', 'DRAFT', 'SCHEDULED', 'COMPLETED'];

export const Campaigns: React.FC = () => {
  const [campaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState('ALL');

  const filtered = campaigns.filter(c => filter === 'ALL' || c.status === filter);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Campaigns</h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">{campaigns.length}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your multi-channel retargeting blasts.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Filter campaigns..." className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white placeholder:text-slate-500" />
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-teal-600 transition-colors">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all whitespace-nowrap">
            <Plus size={18} />
            <span className="hidden sm:inline">Create Campaign</span>
          </button>
        </div>
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
            {status === 'ALL' ? 'All Campaigns' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {campaigns.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center gap-2 text-slate-400 py-10">
          <Megaphone size={32} className="opacity-50" />
          <p className="text-sm font-medium">No campaigns yet.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} />)}
        <button className="group relative min-h-[300px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:text-teal-500 transition-all duration-300">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
            <Plus size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-bold text-lg">Create New Campaign</span>
          <span className="text-xs mt-1 opacity-70">Email, SMS, or WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
