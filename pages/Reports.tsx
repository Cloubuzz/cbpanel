import React from 'react';
import { 
  Download, 
  Search, 
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';

interface Report {
  id: string;
  title: string;
  description: string;
  category: 'Sales' | 'Customers' | 'Operations' | 'Marketing';
  color: string;
}

const REPORTS: Report[] = [
  {
    id: 'sales-summary',
    title: 'Sales Summary',
    description: 'Comprehensive overview of daily, weekly, and monthly revenue trends.',
    category: 'Sales',
    color: 'teal'
  },
  {
    id: 'top-selling',
    title: 'Top Selling Items',
    description: 'Identify your most popular dishes and drinks by volume and revenue.',
    category: 'Sales',
    color: 'blue'
  },
  {
    id: 'category-performance',
    title: 'Category Performance',
    description: 'Analyze which menu categories are driving the most growth.',
    category: 'Sales',
    color: 'indigo'
  },
  {
    id: 'peak-hours',
    title: 'Peak Hours Report',
    description: 'Discover your busiest times to optimize staffing and kitchen prep.',
    category: 'Operations',
    color: 'orange'
  },
  {
    id: 'order-source',
    title: 'Order Source Analysis',
    description: 'Compare performance between Web, App, and Third-party platforms.',
    category: 'Operations',
    color: 'purple'
  },
  {
    id: 'customer-loyalty',
    title: 'Loyalty & Retention',
    description: 'Track repeat customers and the effectiveness of your loyalty program.',
    category: 'Customers',
    color: 'pink'
  },
  {
    id: 'delivery-trends',
    title: 'Delivery vs Pickup',
    description: 'Analyze trends in fulfillment methods and delivery zone performance.',
    category: 'Operations',
    color: 'cyan'
  },
  {
    id: 'modifier-usage',
    title: 'Modifier Usage',
    description: 'See which add-ons and customizations are most frequently ordered.',
    category: 'Sales',
    color: 'emerald'
  },
  {
    id: 'promotion-impact',
    title: 'Promotion Impact',
    description: 'Measure the ROI of your discounts and marketing campaigns.',
    category: 'Marketing',
    color: 'amber'
  },
  {
    id: 'refund-summary',
    title: 'Refund & Cancellations',
    description: 'Monitor order issues and identify patterns in lost revenue.',
    category: 'Operations',
    color: 'rose'
  }
];

const CATEGORY_COLORS: Record<string, { bg: string, text: string, accent: string }> = {
  Sales: { bg: 'bg-teal-500/10', text: 'text-teal-500', accent: 'bg-teal-500/5' },
  Customers: { bg: 'bg-pink-500/10', text: 'text-pink-500', accent: 'bg-pink-500/5' },
  Operations: { bg: 'bg-blue-500/10', text: 'text-blue-500', accent: 'bg-blue-500/5' },
  Marketing: { bg: 'bg-amber-500/10', text: 'text-amber-500', accent: 'bg-amber-500/5' },
};

const REPORT_COLORS: Record<string, { bg: string, text: string, accent: string }> = {
  teal: { bg: 'bg-teal-500/10', text: 'text-teal-500', accent: 'bg-teal-500/5' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', accent: 'bg-blue-500/5' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', accent: 'bg-indigo-500/5' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-500', accent: 'bg-orange-500/5' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-500', accent: 'bg-purple-500/5' },
  pink: { bg: 'bg-pink-500/10', text: 'text-pink-500', accent: 'bg-pink-500/5' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', accent: 'bg-cyan-500/5' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', accent: 'bg-emerald-500/5' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', accent: 'bg-amber-500/5' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', accent: 'bg-rose-500/5' },
};

interface ReportsProps {
  onSelectReport: (id: string) => void;
}

export const Reports: React.FC<ReportsProps> = ({ onSelectReport }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string>('All');

  const categories = ['All', 'Sales', 'Customers', 'Operations', 'Marketing'];

  const filteredReports = REPORTS.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || report.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            Reports & <span className="text-teal-500">Analytics</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Deep dive into your restaurant's performance with specialized data insights.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <Download size={18} />
            Export All
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-6 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search for a report..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[24px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 outline-none transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                px-6 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all
                ${activeCategory === cat 
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800'}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => {
          const colors = REPORT_COLORS[report.color];
          const catColors = CATEGORY_COLORS[report.category];
          
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectReport(report.id)}
              className="group bg-white dark:bg-slate-900 rounded-[32px] border-2 border-slate-100 dark:border-slate-800 p-8 hover:border-teal-500/50 transition-all cursor-pointer relative overflow-hidden shadow-sm hover:shadow-xl"
            >
              {/* Background Accent */}
              <div className={`absolute -top-12 -right-12 w-32 h-32 ${colors.accent} blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${catColors.bg} ${catColors.text}`}>
                    {report.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-teal-500 transition-colors">
                  {report.title}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                  {report.description}
                </p>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">View Report</span>
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-all">
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No reports found</h3>
          <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or category filters.</p>
        </div>
      )}
    </div>
  );
};
