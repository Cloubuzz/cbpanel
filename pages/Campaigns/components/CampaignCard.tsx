import React from 'react';
import { MoreHorizontal, Clock, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { getChannelIcon, getChannelColor, getStatusBadge } from '../utils';
import type { Campaign } from '../types';

interface Props {
  campaign: Campaign;
}

export const CampaignCard: React.FC<Props> = ({ campaign }) => {
  const isDraftOrScheduled = campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED';

  return (
    <div className="glass-card rounded-2xl p-0 flex flex-col group transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] overflow-hidden">
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-2 rounded-lg border ${getChannelColor(campaign.channel)}`}>
            {getChannelIcon(campaign.channel)}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(campaign.status)}
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate">{campaign.name}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><Calendar size={12} /> {campaign.lastEdited}</span>
          <span>•</span>
          <span className="truncate max-w-[120px]">{campaign.audience}</span>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex-1">
        {isDraftOrScheduled ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 min-h-[100px] gap-2">
            <Clock size={24} className="opacity-20" />
            <p className="text-xs">Stats will appear once active</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Revenue</p>
              <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                <DollarSign size={14} className="text-teal-500" />
                {campaign.revenue.toLocaleString()}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Open Rate</p>
              <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                <TrendingUp size={14} className="text-blue-500" />
                {campaign.openRate}%
              </div>
            </div>
            <div className="col-span-2">
              <div className="flex justify-between items-end mb-1">
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Performance Trend</p>
                <span className="text-[10px] text-slate-400">{campaign.sent.toLocaleString()} sent</span>
              </div>
              <div className="h-10 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={campaign.trendData}>
                    <defs>
                      <linearGradient id={`grad-${campaign.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} fill={`url(#grad-${campaign.id})`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/40">
        <button className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">View Report</button>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
          {campaign.status === 'DRAFT' ? 'Edit Draft' : 'Manage'}
        </button>
      </div>
    </div>
  );
};
