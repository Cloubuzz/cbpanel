import React from 'react';
import { 
  Download, 
  AlertCircle,
  Loader2,
  Search, 
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAppSelector } from '../store/hooks';
import { selectToken } from '../store/selectors/appSelectors';
import { fetchReports, type ApiReportSummary } from '../services/reportsApi';

interface ReportCard {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  apiReport: ApiReportSummary;
}

const CATEGORY_COLORS: Record<string, { bg: string, text: string, accent: string }> = {
  Sales: { bg: 'bg-teal-500/10', text: 'text-teal-500', accent: 'bg-teal-500/5' },
  Customers: { bg: 'bg-pink-500/10', text: 'text-pink-500', accent: 'bg-pink-500/5' },
  Operations: { bg: 'bg-blue-500/10', text: 'text-blue-500', accent: 'bg-blue-500/5' },
  Marketing: { bg: 'bg-amber-500/10', text: 'text-amber-500', accent: 'bg-amber-500/5' },
  Payments: { bg: 'bg-violet-500/10', text: 'text-violet-500', accent: 'bg-violet-500/5' },
  Menu: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', accent: 'bg-emerald-500/5' },
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
  violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', accent: 'bg-violet-500/5' },
};

const inferCategory = (reportName: string, slug: string) => {
  const value = `${reportName} ${slug}`.toLowerCase();

  if (value.includes('customer')) return 'Customers';
  if (value.includes('payment') || value.includes('card')) return 'Payments';
  if (value.includes('menu') || value.includes('deal') || value.includes('modifier')) return 'Menu';
  if (value.includes('campaign') || value.includes('promotion') || value.includes('marketing')) return 'Marketing';
  if (value.includes('sale') || value.includes('order') || value.includes('revenue') || value.includes('comprison')) return 'Sales';
  return 'Operations';
};

const inferColor = (category: string) => {
  switch (category) {
    case 'Customers':
      return 'pink';
    case 'Payments':
      return 'violet';
    case 'Menu':
      return 'emerald';
    case 'Marketing':
      return 'amber';
    case 'Sales':
      return 'teal';
    default:
      return 'blue';
  }
};

const formatSlugLabel = (slug: string) =>
  slug.replace(/^ReportsNewAdmin_/, '').replace(/([a-z])([A-Z])/g, '$1 $2');

const toReportCard = (report: ApiReportSummary): ReportCard => {
  const category = inferCategory(report.ReportName, report.Slug);

  return {
    id: String(report.ID),
    title: report.ReportName,
    description: formatSlugLabel(report.Slug),
    category,
    color: inferColor(category),
    apiReport: report,
  };
};

interface ReportsProps {
  onSelectReport: (id: string) => void;
}

export const Reports: React.FC<ReportsProps> = ({ onSelectReport }) => {
  const token = useAppSelector(selectToken);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string>('All');
  const [reports, setReports] = React.useState<ReportCard[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!token) {
      setReports([]);
      setError('Sign in to load reports.');
      return;
    }

    let cancelled = false;

    const loadReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchReports(token, { page: 1, pageSize: 50, module: 'ReportsNewAdmin' });

        if (!cancelled) {
          setReports(data.map(toReportCard));
        }
      } catch (fetchError) {
        if (!cancelled) {
          setReports([]);
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load reports.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const categories = React.useMemo(() => {
    const reportCategories = Array.from(new Set(reports.map((report) => report.category))).sort();
    return ['All', ...reportCategories];
  }, [reports]);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.apiReport.Slug.toLowerCase().includes(searchQuery.toLowerCase());
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

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-[24px] border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-5 py-4 text-rose-700 dark:text-rose-300">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

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

      {isLoading && (
        <div className="flex items-center justify-center gap-3 rounded-[28px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-10 text-slate-500 dark:text-slate-400 shadow-sm mb-10">
          <Loader2 className="animate-spin" size={18} />
          <span className="text-sm font-medium">Loading reports...</span>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report, index) => {
          const colors = REPORT_COLORS[report.color] ?? REPORT_COLORS.teal;
          const catColors = CATEGORY_COLORS[report.category] ?? CATEGORY_COLORS.Operations;
          
          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectReport(report.apiReport.Slug)}
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

      {filteredReports.length === 0 && !isLoading && !error && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {reports.length === 0 ? 'No reports available' : 'No reports found'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {reports.length === 0
              ? 'The reports API returned no rows for this module.'
              : 'Try adjusting your search or category filters.'}
          </p>
        </div>
      )}
    </div>
  );
};
