import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Mail, 
  MessageCircle, 
  MessageSquare, 
  PauseCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// --- Types & Mock Data ---

type Channel = 'EMAIL' | 'SMS' | 'WHATSAPP';
type Status = 'ACTIVE' | 'PAUSED' | 'DRAFT' | 'COMPLETED' | 'SCHEDULED';

interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  status: Status;
  audience: string;
  sent: number;
  openRate: number;
  clickRate: number;
  revenue: number;
  lastEdited: string;
  trendData: { value: number }[]; // For sparkline
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale Blast',
    channel: 'EMAIL',
    status: 'ACTIVE',
    audience: 'All Subscribers',
    sent: 12450,
    openRate: 24.8,
    clickRate: 3.2,
    revenue: 45200,
    lastEdited: '2 hours ago',
    trendData: [
        { value: 10 }, { value: 15 }, { value: 12 }, { value: 20 }, { value: 25 }, { value: 22 }, { value: 30 }
    ]
  },
  {
    id: '2',
    name: 'Cart Recovery Sequence',
    channel: 'WHATSAPP',
    status: 'ACTIVE',
    audience: 'Cart Abandoners (24h)',
    sent: 850,
    openRate: 92.0,
    clickRate: 15.4,
    revenue: 12800,
    lastEdited: '1 day ago',
    trendData: [
        { value: 40 }, { value: 35 }, { value: 45 }, { value: 50 }, { value: 48 }, { value: 55 }, { value: 60 }
    ]
  },
  {
    id: '3',
    name: 'VIP Early Access',
    channel: 'SMS',
    status: 'SCHEDULED',
    audience: 'Gold Tier Customers',
    sent: 0,
    openRate: 0,
    clickRate: 0,
    revenue: 0,
    lastEdited: '3 hours ago',
    trendData: [] // No data yet
  },
  {
    id: '4',
    name: 'Win-back Inactive',
    channel: 'EMAIL',
    status: 'PAUSED',
    audience: 'Inactive > 90 Days',
    sent: 5400,
    openRate: 18.5,
    clickRate: 1.2,
    revenue: 3200,
    lastEdited: '5 days ago',
    trendData: [
        { value: 15 }, { value: 12 }, { value: 10 }, { value: 8 }, { value: 5 }, { value: 2 }, { value: 0 }
    ]
  },
  {
    id: '5',
    name: 'Product Launch Teaser',
    channel: 'WHATSAPP',
    status: 'DRAFT',
    audience: 'Newsletter Signups',
    sent: 0,
    openRate: 0,
    clickRate: 0,
    revenue: 0,
    lastEdited: 'Just now',
    trendData: []
  },
  {
    id: '6',
    name: 'Black Friday Prep',
    channel: 'EMAIL',
    status: 'COMPLETED',
    audience: 'Full List',
    sent: 45000,
    openRate: 21.2,
    clickRate: 4.5,
    revenue: 125000,
    lastEdited: '2 weeks ago',
    trendData: [
        { value: 10 }, { value: 40 }, { value: 80 }, { value: 60 }, { value: 30 }, { value: 10 }, { value: 5 }
    ]
  }
];

// --- Helpers ---

const getChannelIcon = (channel: Channel) => {
  switch (channel) {
    case 'EMAIL': return <Mail size={16} />;
    case 'SMS': return <MessageSquare size={16} />;
    case 'WHATSAPP': return <MessageCircle size={16} />;
  }
};

const getChannelColor = (channel: Channel) => {
  switch (channel) {
    case 'EMAIL': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'SMS': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    case 'WHATSAPP': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
  }
};

const getStatusBadge = (status: Status) => {
  switch (status) {
    case 'ACTIVE': return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 border border-teal-200 dark:border-teal-900">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
        </span>
        Active
      </span>
    );
    case 'PAUSED': return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
        <PauseCircle size={12} /> Paused
      </span>
    );
    case 'SCHEDULED': return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
        <Clock size={12} /> Scheduled
      </span>
    );
    case 'COMPLETED': return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <CheckCircle2 size={12} /> Completed
      </span>
    );
    default: return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800/50 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
        <AlertCircle size={12} /> Draft
      </span>
    );
  }
};

// --- Components ---

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const isDraftOrScheduled = campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED';

  return (
    <div className="glass-card rounded-2xl p-0 flex flex-col group transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] overflow-hidden">
      
      {/* Top Section */}
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
           <span className="flex items-center gap-1"><Calendar size={12}/> {campaign.lastEdited}</span>
           <span>•</span>
           <span className="truncate max-w-[120px]">{campaign.audience}</span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex-1">
         {isDraftOrScheduled ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 min-h-[100px] gap-2">
              <Clock size={24} className="opacity-20"/>
              <p className="text-xs">Stats will appear once active</p>
            </div>
         ) : (
           <div className="grid grid-cols-2 gap-y-4 gap-x-6">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Revenue</p>
                <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                   <DollarSign size={14} className="text-teal-500"/>
                   {campaign.revenue.toLocaleString()}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Open Rate</p>
                <div className="flex items-center gap-1 text-slate-900 dark:text-white font-bold text-lg">
                   <TrendingUp size={14} className="text-blue-500"/>
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
                          <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.4}/>
                          <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#0d9488" 
                        strokeWidth={2} 
                        fill={`url(#grad-${campaign.id})`} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
           </div>
         )}
      </div>

      {/* Footer / Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/40">
        <button className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
           View Report
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
           {campaign.status === 'DRAFT' ? 'Edit Draft' : 'Manage'}
        </button>
      </div>
    </div>
  );
};

export const Campaigns: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Campaigns</h1>
             <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-xs font-bold">{mockCampaigns.length}</span>
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your multi-channel retargeting blasts.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Filter campaigns..." 
               className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white placeholder:text-slate-500"
             />
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all whitespace-nowrap">
             <Plus size={18} />
             <span className="hidden sm:inline">Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200 dark:border-slate-800">
         {['ALL', 'ACTIVE', 'DRAFT', 'SCHEDULED', 'COMPLETED'].map(status => (
           <button
             key={status}
             onClick={() => setFilter(status)}
             className={`
               px-4 py-2 text-sm font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap
               ${filter === status 
                 ? 'border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/10' 
                 : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}
             `}
           >
             {status === 'ALL' ? 'All Campaigns' : status.charAt(0) + status.slice(1).toLowerCase()}
           </button>
         ))}
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockCampaigns
          .filter(c => filter === 'ALL' || c.status === filter)
          .map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
        
        {/* 'Create New' Placeholder Card */}
        <button className="group relative min-h-[300px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/10 hover:text-teal-500 dark:hover:text-teal-400 transition-all duration-300">
           <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
             <Plus size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
           </div>
           <span className="font-bold text-lg">Create New Campaign</span>
           <span className="text-xs mt-1 opacity-70">Email, SMS, or WhatsApp</span>
        </button>
      </div>

    </div>
  );
};