import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  User,
  Clock,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";

interface Blog {
  id: string;
  title: string;
  author: string;
  status: "Published" | "Draft" | "Scheduled";
  category: string;
  date: string;
  views: number;
  image: string;
}

const MOCK_BLOGS: Blog[] = [
  {
    id: "1",
    title: "The Future of Pizza Delivery: AI and Drones",
    author: "Alex Cloud",
    status: "Published",
    category: "Technology",
    date: "2024-03-20",
    views: 1240,
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=cover",
  },
  {
    id: "2",
    title: "Top 5 Secret Ingredients for the Perfect Crust",
    author: "Chef Mario",
    status: "Published",
    category: "Cooking",
    date: "2024-03-18",
    views: 856,
    image:
      "https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?w=400&h=300&fit=cover",
  },
  {
    id: "3",
    title: "How to Scale Your Pizza Business in 2024",
    author: "Sarah Smith",
    status: "Draft",
    category: "Business",
    date: "2024-03-22",
    views: 0,
    image:
      "https://images.unsplash.com/photo-1541746972996-4e0b0f43e01a?w=400&h=300&fit=cover",
  },
  {
    id: "4",
    title: "Sustainable Packaging: Our New Initiative",
    author: "Eco Team",
    status: "Scheduled",
    category: "News",
    date: "2024-04-01",
    views: 0,
    image:
      "https://images.unsplash.com/photo-1595859703065-2259982784bb?w=400&h=300&fit=cover",
  },
];

interface BlogsProps {
  onAddBlog: () => void;
  onEditBlog: (id: string) => void;
}

export const Blogs: React.FC<BlogsProps> = ({ onAddBlog, onEditBlog }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredBlogs = MOCK_BLOGS.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || blog.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Blog <span className="text-teal-500">Management</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">
            Create, edit and manage your store's news and articles.
          </p>
        </div>

        <button
          onClick={onAddBlog}
          className="flex items-center gap-2 px-6 py-3.5 bg-teal-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus size={20} />
          Create New Article
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total Articles",
            value: "24",
            icon: <BookOpen className="text-teal-500" />,
          },
          {
            label: "Total Views",
            value: "12.4k",
            icon: <Eye className="text-blue-500" />,
          },
          {
            label: "Published",
            value: "18",
            icon: <Clock className="text-emerald-500" />,
          },
          {
            label: "Drafts",
            value: "6",
            icon: <Edit3 className="text-amber-500" />,
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {stat.value}
              </h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-100 dark:border-slate-800">
              {React.cloneElement(stat.icon as any, { size: 20 })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 outline-none transition-all shadow-inner"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            {["All", "Published", "Draft", "Scheduled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                  statusFilter === status
                    ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:text-slate-600"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabular Display */}
      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Article details
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Category
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Date
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredBlogs.map((blog) => (
                <motion.tr
                  key={blog.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-100 flex-shrink-0">
                        <img
                          src={blog.image}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[300px]">
                          {blog.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <User size={12} className="text-slate-400" />
                          <span className="text-[11px] font-bold text-slate-500">
                            {blog.author}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-blue-500/5 text-blue-500 border border-blue-500/10">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-slate-500">
                      <Calendar size={14} className="text-slate-400" />
                      {blog.date}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          blog.status === "Published"
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                            : blog.status === "Draft"
                              ? "bg-slate-400"
                              : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                        }`}
                      ></span>
                      <span
                        className={`text-[11px] font-black uppercase tracking-widest ${
                          blog.status === "Published"
                            ? "text-emerald-500"
                            : blog.status === "Draft"
                              ? "text-slate-500"
                              : "text-amber-500"
                        }`}
                      >
                        {blog.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditBlog(blog.id)}
                        className="p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all"
                        title="Edit Article"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete Article"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                        title="View Preview"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBlogs.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-950 rounded-[30px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-bold">
              No articles found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
              }}
              className="mt-2 text-teal-500 text-sm font-bold uppercase tracking-widest hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="px-8 py-5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
            Showing{" "}
            <span className="text-slate-900 dark:text-white">
              {filteredBlogs.length}
            </span>{" "}
            of 24 Articles
          </p>
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((i) => (
              <button
                key={i}
                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                  i === 1
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20"
                    : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-teal-500/50"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const BookOpen = ({
  size,
  className,
}: {
  size?: number;
  className?: string;
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
