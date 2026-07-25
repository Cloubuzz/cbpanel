import React from 'react';
import { Edit3, Trash2, ArrowRight, Calendar, Link2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { Blog } from '../types';

interface Props {
  blog: Blog;
  onEdit: (id: string) => void;
}

export const BlogRow: React.FC<Props> = ({ blog, onEdit }) => (
  <motion.tr
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
  >
    <td className="px-8 py-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 flex-shrink-0">
          {blog.image ? (
            <img src={blog.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
          )}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[300px]">{blog.title}</div>
        </div>
      </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 max-w-[220px] truncate">
        <Link2 size={12} className="text-slate-400 flex-shrink-0" />
        <span className="truncate">{blog.slug || '—'}</span>
      </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
        <Calendar size={14} className="text-slate-400" />
        {blog.date}
      </div>
    </td>
    <td className="px-8 py-5">
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full ${
          blog.status === 'Published'
            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
            : 'bg-slate-400'
        }`} />
        <span className={`text-[11px] font-black uppercase tracking-widest ${
          blog.status === 'Published' ? 'text-emerald-500' : 'text-slate-500'
        }`}>
          {blog.status}
        </span>
      </div>
    </td>
    <td className="px-8 py-5 text-right">
      <div className="flex items-center justify-end gap-2">
        <button onClick={() => onEdit(blog.id)} className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all" title="Edit Article">
          <Edit3 size={18} />
        </button>
        <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="Delete Article">
          <Trash2 size={18} />
        </button>
        <button className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all" title="View Article">
          <ArrowRight size={18} />
        </button>
      </div>
    </td>
  </motion.tr>
);
