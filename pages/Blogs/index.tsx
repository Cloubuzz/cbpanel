import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Edit3, BookOpen, Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { BlogRow } from './components/BlogRow';
import type { Blog, BlogsProps } from './types';
import { fetchBlogs, type ApiBlog } from '../../services/blogsApi';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';

const PAGE_SIZE = 10;

function mapApiBlog(b: ApiBlog): Blog {
  return {
    id: String(b.ID),
    title: b.Title,
    status: b.IsActive === 1 ? 'Published' : 'Inactive',
    date: b.CreatedDate ? b.CreatedDate.split('T')[0] : '—',
    image: b.CoverImage || '',
    slug: b.Slug || '',
  };
}

export const Blogs: React.FC<BlogsProps> = ({ onAddBlog, onEditBlog }) => {
  const token = useAppSelector(selectToken);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);

  const loadBlogs = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchBlogs(token);
      setBlogs(data.map(mapApiBlog));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blogs.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { loadBlogs(); }, [loadBlogs]);

  const filtered = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const publishedCount = blogs.filter(b => b.status === 'Published').length;
  const inactiveCount = blogs.filter(b => b.status === 'Inactive').length;

  const stats = [
    { label: 'Total Articles', value: String(blogs.length), icon: <BookOpen className="text-teal-500" /> },
    { label: 'Published', value: String(publishedCount), icon: <Globe className="text-emerald-500" /> },
    { label: 'Inactive', value: String(inactiveCount), icon: <Edit3 className="text-slate-400" /> },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Blog <span className="text-teal-500">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Create, edit and manage your store's news and articles.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadBlogs} disabled={isLoading} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-teal-500 hover:border-teal-500/50 transition-all shadow-sm" title="Refresh">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button onClick={onAddBlog} className="flex items-center gap-2 px-6 py-3.5 bg-teal-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
            <Plus size={20} />
            Create New Article
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ) : (
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
              )}
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800">
              {React.cloneElement(stat.icon as React.ReactElement<{ size?: number }>, { size: 20 })}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by title or slug..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 outline-none transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            {['All', 'Published', 'Inactive'].map(status => (
              <button key={status} onClick={() => { setStatusFilter(status); setPage(1); }}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                  statusFilter === status
                    ? 'bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:text-slate-600'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        {error ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-[24px] border-2 border-rose-100 dark:border-rose-900/50 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-rose-500" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-black">{error}</p>
            <button onClick={loadBlogs} className="mt-3 text-teal-500 text-sm font-bold uppercase tracking-widest hover:underline">
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                  {['Article details', 'Slug', 'Date', 'Status', 'Actions'].map(h => (
                    <th key={h} className={`px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest${h === 'Actions' ? ' text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                            <div className="h-4 w-52 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                          </div>
                        </td>
                        <td className="px-8 py-5"><div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg" /></td>
                        <td className="px-8 py-5"><div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg" /></td>
                        <td className="px-8 py-5"><div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg" /></td>
                        <td className="px-8 py-5"><div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg ml-auto" /></td>
                      </tr>
                    ))
                  : paginated.map(blog => <BlogRow key={blog.id} blog={blog} onEdit={onEditBlog} />)
                }
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[30px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">No articles found matching your criteria.</p>
            <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); }} className="mt-2 text-teal-500 text-sm font-bold uppercase tracking-widest hover:underline">
              Clear all filters
            </button>
          </div>
        )}

        {!error && (
          <div className="px-8 py-5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
              Showing <span className="text-slate-900 dark:text-white">{isLoading ? '—' : `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)}`}</span> of <span className="text-slate-900 dark:text-white">{isLoading ? '—' : filtered.length}</span> Articles
            </p>
            {!isLoading && totalPages > 1 && (
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                    p === currentPage ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-teal-500/50'
                  }`}>{p}</button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
