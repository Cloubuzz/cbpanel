import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  ShoppingCart, 
  Clock, 
  BarChart3
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// --- Types & Mock Data ---

interface Segment {
  id: string;
  name: string;
  description: string;
  count: number;
  growth: number; // Percentage growth vs last month
  potential: 'High' | 'Medium' | 'Low';
  score: number; // 0-100 Engagement Score
  avgOrderValue: number;
  tags: string[];
  lastSync: string;
  trendData: { value: number }[];
}

const mockSegments: Segment[] = [
  {
    id: '1',
    name: 'Whales (VIP High Spenders)',
    description: 'Customers with LTV > RS 500 and > 3 orders in last 6 months.',
    count: 420,
    growth: 12.5,
    potential: 'High',
    score: 94,
    avgOrderValue: 245.00,
    tags: ['LTV > 500', 'Repeat Buyer', 'No Returns'],
    lastSync: '1 hour ago',
    trendData: [{ value: 60 }, { value: 70 }, { value: 65 }, { value: 85 }, { value: 90 }, { value: 94 }]
  },
  {
    id: '2',
    name: 'Cart Abandoners (High Intent)',
    description: 'Added items > RS 100 to cart but did not checkout in 24h.',
    count: 1250,
    growth: 5.2,
    potential: 'High',
    score: 82,
    avgOrderValue: 120.50,
    tags: ['Cart > 100', 'Abandoned < 24h'],
    lastSync: '15 mins ago',
    trendData: [{ value: 40 }, { value: 55 }, { value: 45 }, { value: 60 }, { value: 75 }, { value: 82 }]
  },
  {
    id: '3',
    name: 'At Risk / Churning',
    description: 'Previously active customers who haven\'t visited in 90 days.',
    count: 2100,
    growth: -2.4,
    potential: 'Medium',
    score: 45,
    avgOrderValue: 85.00,
    tags: ['Inactive > 90d', 'Has Ordered'],
    lastSync: '1 day ago',
    trendData: [{ value: 80 }, { value: 70 }, { value: 60 }, { value: 50 }, { value: 48 }, { value: 45 }]
  },
  {
    id: '4',
    name: 'Window Shoppers',
    description: 'Visited site > 5 times in last week but zero purchases.',
    count: 5400,
    growth: 18.2,
    potential: 'Low',
    score: 30,
    avgOrderValue: 0,
    tags: ['Visits > 5', 'Orders = 0'],
    lastSync: '2 hours ago',
    trendData: [{ value: 10 }, { value: 20 }, { value: 15 }, { value: 25 }, { value: 28 }, { value: 30 }]
  },
  {
    id: '5',
    name: 'Holiday Seasonal Buyers',
    description: 'Customers who only purchase during Nov/Dec sales.',
    count: 3200,
    growth: 0.5,
    potential: 'Medium',
    score: 55,
    avgOrderValue: 110.00,
    tags: ['Seasonal', 'Discount Seeker'],
    lastSync: '1 week ago',
    trendData: [{ value: 50 }, { value: 52 }, { value: 51 }, { value: 53 }, { value: 54 }, { value: 55 }]
  },
  {
    id: '6',
    name: 'New Newsletter Leads',
    description: 'Signed up for newsletter in last 30 days, no purchase yet.',
    count: 850,
    growth: 8.4,
    potential: 'Medium',
    score: 62,
    avgOrderValue: 0,
    tags: ['Lead', 'New Subscriber'],
    lastSync: '30 mins ago',
    trendData: [{ value: 30 }, { value: 40 }, { value: 50 }, { value: 55 }, { value: 60 }, { value: 62 }]
  }
];

// --- Helpers ---

const getPotentialBadge = (potential: string) => {
  const styles = {
    High: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
  };
  const icons = {
    High: <Zap size={12} className="fill-current" />,
    Medium: <Target size={12} />,
    Low: <Clock size={12} />
  };
  
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${styles[potential as keyof typeof styles]}`}>
      {icons[potential as keyof typeof icons]}
      {potential} Potential
    </span>
  );
};

// --- Components ---

const ScoreGauge = ({ score }: { score: number }) => {
  // Simple linear gauge
  let color = 'bg-red-500';
  if (score > 40) color = 'bg-amber-500';
  if (score > 75) color = 'bg-teal-500';

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Engagement Score</span>
        <span className={`text-sm font-bold ${score > 75 ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-slate-300'}`}>{score}/100</span>
      </div>
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${color} transition-all duration-1000`} 
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );
};

const SegmentCard: React.FC<{ segment: Segment }> = ({ segment }) => {
  return (
    <div className="glass-card rounded-2xl flex flex-col group transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl dark:hover:shadow-[0_0_20px_rgba(20,184,166,0.15)] overflow-hidden">
      
      {/* Header */}
      <div className="p-6 pb-4">
         <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
               <div className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:border-teal-200 dark:group-hover:border-teal-900 transition-colors">
                 <Users size={20} />
               </div>
               <div>
                 <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{segment.name}</h3>
                 <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                   <Clock size={10} /> Synced {segment.lastSync}
                 </span>
               </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <MoreHorizontal size={18} />
            </button>
         </div>
         <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8">{segment.description}</p>
      </div>

      {/* Tags */}
      <div className="px-6 pb-4 flex flex-wrap gap-2">
         {segment.tags.map(tag => (
           <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700">
             {tag}
           </span>
         ))}
      </div>

      {/* Metrics Grid */}
      <div className="px-6 py-5 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex-1 flex flex-col gap-4">
         
         <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Audience Size</p>
              <div className="flex items-center gap-2">
                 <span className="text-xl font-bold text-slate-900 dark:text-white">{segment.count.toLocaleString()}</span>
                 <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${segment.growth >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                    {segment.growth >= 0 ? <TrendingUp size={10} className="mr-0.5" /> : <TrendingDown size={10} className="mr-0.5" />}
                    {Math.abs(segment.growth)}%
                 </span>
              </div>
            </div>
            {getPotentialBadge(segment.potential)}
         </div>

         {/* Score Gauge */}
         <ScoreGauge score={segment.score} />

         {/* Trend Line (Mini) */}
         <div className="h-10 mt-1">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={segment.trendData}>
                  <defs>
                    <linearGradient id={`seg-grad-${segment.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#64748b" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#64748b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    fill={`url(#seg-grad-${segment.id})`} 
                  />
                </AreaChart>
             </ResponsiveContainer>
         </div>

      </div>

      {/* Footer */}
      <div className="p-3 bg-white dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
         <button className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 py-1 transition-colors">
            <BarChart3 size={14} /> Analytics
         </button>
         <button className="flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 py-1 transition-colors">
            <Zap size={14} /> Sync Ad
         </button>
      </div>
    </div>
  );
};

interface SummaryStatProps {
  label: string;
  value: string;
  subtext: string;
  icon: React.ElementType;
  color: string;
}

const SummaryStat = ({ label, value, subtext, icon: Icon, color }: SummaryStatProps) => (
  <div className="flex items-center gap-4 p-4 rounded-xl glass-card border border-white/10 dark:border-slate-800 shadow-sm relative overflow-hidden">
     <div className={`p-3 rounded-xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
        <Icon size={24} className={color.replace('bg-', 'text-').replace('/10', '')} />
     </div>
     <div className="relative z-10">
       <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{label}</p>
       <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
       <p className="text-[10px] text-slate-400">{subtext}</p>
     </div>
  </div>
);

export const Segments: React.FC = () => {
  const [filter, setFilter] = useState('ALL');

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20 max-w-[1600px] mx-auto">
      
      {/* Header - Matching Campaigns Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Audience Segments</h1>
             <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-xs font-bold">{mockSegments.length}</span>
           </div>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Organize your customers into high-performing groups for targeted campaigns.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search segments or tags..." 
               className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white placeholder:text-slate-500"
             />
          </div>
          <button className="p-2.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 hover:text-teal-400 transition-colors">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-900/20 hover:bg-teal-500 transition-all whitespace-nowrap">
             <Plus size={18} />
             <span className="hidden sm:inline">Create Segment</span>
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <SummaryStat 
           label="Total Reachable" 
           value="13,220" 
           subtext="Across all channels (Email, SMS, WA)" 
           icon={Users} 
           color="text-teal-600 bg-teal-600" 
         />
         <SummaryStat 
           label="Avg. Engagement Score" 
           value="68/100" 
           subtext="+4 points vs last month" 
           icon={BarChart3} 
           color="text-blue-600 bg-blue-600" 
         />
         <SummaryStat 
           label="High Potential Revenue" 
           value="RS 425k" 
           subtext="Est. from top 2 segments" 
           icon={ShoppingCart} 
           color="text-emerald-600 bg-emerald-600" 
         />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200 dark:border-slate-800">
         {['ALL', 'HIGH POTENTIAL', 'MEDIUM POTENTIAL', 'LOW POTENTIAL', 'ARCHIVED'].map(status => (
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
             {status === 'ALL' ? 'All Segments' : status.charAt(0) + status.slice(1).toLowerCase()}
           </button>
         ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {mockSegments
           .filter(s => {
             if (filter === 'ALL') return true;
             if (filter.includes('POTENTIAL')) {
                return s.potential.toUpperCase() === filter.split(' ')[0];
             }
             return true; 
           })
           .map(segment => (
           <SegmentCard key={segment.id} segment={segment} />
         ))}
         
         {/* 'AI Segment' Placeholder */}
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