import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Eye,
  Image as ImageIcon,
  Upload,
  X,
  Settings2,
  CheckCircle2,
  Globe,
  Search,
  Bold,
  Italic,
  Underline,
  List,
  Link as LinkIcon,
  Heading1,
  Heading2,
  Quote,
  Code,
  Smartphone,
  Monitor,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BlogDetailProps {
  id?: string;
  onBack: () => void;
}

export const BlogDetail: React.FC<BlogDetailProps> = ({ id, onBack }) => {
  const [formData, setFormData] = useState({
    title: id ? "The Future of Pizza Delivery: AI and Drones" : "",
    content: "",
    excerpt: "",
    category: "Technology",
    status: "Draft",
    author: "Alex Cloud",
    tags: ["Pizza", "Tech", "Delivery"],
    featuredImage:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80",
    seoTitle: id ? "Future of Pizza Delivery | Cloubuzz Neural Blog" : "",
    seoDescription: id
      ? "Explore how AI and drones are rewriting the rules of pizza delivery. The future of food tech is here."
      : "",
    slug: id ? "future-of-pizza-delivery" : "",
  });

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">(
    "desktop",
  );
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");

  // Auto-generate slug from title if it's a new post or slug is empty
  useEffect(() => {
    if (!id && formData.title && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: prev.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      }));
    }
  }, [formData.title, id]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
  };

  const GooglePreview = () => (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-inner">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button
            onClick={() => setPreviewDevice("desktop")}
            className={`p-2 rounded-lg transition-all ${previewDevice === "desktop" ? "bg-white dark:bg-slate-800 text-teal-500 shadow-sm" : "text-slate-400"}`}
          >
            <Monitor size={14} />
          </button>
          <button
            onClick={() => setPreviewDevice("mobile")}
            className={`p-2 rounded-lg transition-all ${previewDevice === "mobile" ? "bg-white dark:bg-slate-800 text-teal-500 shadow-sm" : "text-slate-400"}`}
          >
            <Smartphone size={14} />
          </button>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
          Google Search Results Preview
        </span>
      </div>

      <div
        className={`mx-auto transition-all duration-500 bg-white dark:bg-[#1a1c1e] p-5 rounded-xl border border-slate-100 dark:border-slate-800/50 ${previewDevice === "mobile" ? "max-w-[360px]" : "w-full"}`}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
            <Globe size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] text-[#202124] dark:text-[#bdc1c6] font-medium leading-tight">
              Cloubuzz
            </span>
            <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] leading-tight">
              https://cloubuzz.com › blog › {formData.slug || "your-post"}
            </span>
          </div>
        </div>
        <h3 className="text-[18px] md:text-[20px] text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-tight mb-1 truncate">
          {formData.seoTitle ||
            formData.title ||
            "Your Article Title Goes Here"}
        </h3>
        <p className="text-[13px] md:text-[14px] text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
          <span className="text-[#70757a] dark:text-[#9aa0a6]">
            {new Date().toLocaleDateString(undefined, {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}{" "}
            —{" "}
          </span>
          {formData.seoDescription ||
            formData.excerpt ||
            "Write a compelling meta description to increase your click-through rate on search engines..."}
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-teal-500 hover:border-teal-500/50 transition-all shadow-sm group"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
                  formData.status === "Published"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-amber-500/10 text-amber-500"
                }`}
              >
                {formData.status}
              </span>
              <span className="text-slate-300 dark:text-slate-700">/</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {formData.category}
              </span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {id ? "Refine" : "Architect"}{" "}
              <span className="text-teal-500">Content</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm uppercase tracking-widest">
            <Eye size={18} />
            Sneak Peak
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-2 px-8 py-3.5 bg-teal-500 text-white rounded-2xl text-sm font-black shadow-lg shadow-teal-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-[0.15em] ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Save size={18} />
            )}
            {saving ? "Syncing..." : "Deploy Article"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("content")}
          className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "content" ? "text-teal-500" : "text-slate-400 hover:text-slate-600"}`}
        >
          {activeTab === "content" && (
            <motion.div
              layoutId="tab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full shadow-[0_-2px_8px_rgba(20,184,166,0.5)]"
            />
          )}
          Content Engine
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === "seo" ? "text-teal-500" : "text-slate-400 hover:text-slate-600"}`}
        >
          {activeTab === "seo" && (
            <motion.div
              layoutId="tab"
              className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full shadow-[0_-2px_8px_rgba(20,184,166,0.5)]"
            />
          )}
          SEO Optima
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === "content" ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Article Info Card */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[40px] p-8 shadow-sm space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                      Article Core Title
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-teal-500/5 blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity"></div>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Enter a catchy title..."
                        className="w-full px-8 py-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[28px] text-xl font-black text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 outline-none transition-all shadow-inner relative z-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                      Magnetic Excerpt
                    </label>
                    <textarea
                      rows={3}
                      value={formData.excerpt}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt: e.target.value })
                      }
                      placeholder="Briefly describe what this article is about to hook readers..."
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[24px] text-sm font-bold text-slate-600 dark:text-slate-300 placeholder:text-slate-400 focus:border-teal-500 outline-none transition-all resize-none shadow-inner"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Rich Content Builder
                      </label>
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">
                          Words: 1,240
                        </span>
                        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                          <button className="px-3 py-1.5 text-[9px] font-black uppercase text-teal-500 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                            Editor
                          </button>
                          <button className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">
                            Markdown
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Advanced Rich Text Editor UI */}
                    <div className="min-h-[600px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden flex flex-col shadow-inner group">
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 items-center bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
                        {[
                          { icon: <Bold size={16} />, group: "text" },
                          { icon: <Italic size={16} />, group: "text" },
                          { icon: <Underline size={16} />, group: "text" },
                          { divider: true },
                          { icon: <Heading1 size={16} />, group: "head" },
                          { icon: <Heading2 size={16} />, group: "head" },
                          { divider: true },
                          { icon: <List size={16} />, group: "list" },
                          { icon: <Quote size={16} />, group: "extra" },
                          { icon: <LinkIcon size={16} />, group: "extra" },
                          { icon: <ImageIcon size={16} />, group: "media" },
                          { icon: <Code size={16} />, group: "dev" },
                        ].map((btn, i) =>
                          btn.divider ? (
                            <div
                              key={i}
                              className="w-px h-6 bg-slate-200 dark:border-slate-800 mx-1"
                            ></div>
                          ) : (
                            <button
                              key={i}
                              className="p-2.5 text-slate-400 hover:text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all active:scale-90"
                            >
                              {btn.icon}
                            </button>
                          ),
                        )}
                        <div className="ml-auto flex items-center gap-2 pr-2">
                          <button className="p-2 text-slate-400 hover:text-teal-500 transition-all">
                            <Search size={16} />
                          </button>
                          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
                          <button className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-all">
                            Normal <ChevronDown size={12} />
                          </button>
                        </div>
                      </div>
                      <textarea
                        className="flex-1 p-10 bg-transparent text-slate-700 dark:text-slate-300 text-[16px] leading-[1.8] focus:outline-none placeholder:text-slate-400 font-medium resize-none selection:bg-teal-500/20"
                        placeholder="Unlock your neural engine and start writing..."
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="seo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* SEO Optimization Card */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[40px] p-8 shadow-sm space-y-10">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">
                          Search Engine Optimization
                        </h3>
                        <p className="text-slate-400 text-xs font-bold mt-1">
                          Configure how your content appears across the web.
                        </p>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-teal-500/5 text-teal-500 flex items-center justify-center border border-teal-500/20">
                        <Globe size={24} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Meta Title
                          </label>
                          <span
                            className={`text-[9px] font-black uppercase ${formData.seoTitle.length > 60 ? "text-rose-500" : "text-slate-400"}`}
                          >
                            {formData.seoTitle.length} / 60
                          </span>
                        </div>
                        <input
                          type="text"
                          value={formData.seoTitle}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              seoTitle: e.target.value,
                            })
                          }
                          placeholder="Post title displayed in search results..."
                          className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-teal-500 shadow-inner"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Permalink / Slug
                        </label>
                        <div className="flex items-center px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-inner">
                          <span className="text-slate-400 text-xs font-bold mr-1">
                            cloubuzz.com/
                          </span>
                          <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                slug: e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "-"),
                              })
                            }
                            className="flex-1 bg-transparent text-sm font-bold text-teal-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Meta Description
                        </label>
                        <span
                          className={`text-[9px] font-black uppercase ${formData.seoDescription.length > 160 ? "text-rose-500" : "text-slate-400"}`}
                        >
                          {formData.seoDescription.length} / 160
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={formData.seoDescription}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seoDescription: e.target.value,
                          })
                        }
                        placeholder="An engaging summary that appears under the title in search engines..."
                        className="w-full px-5 py-5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[24px] text-sm font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-teal-500 resize-none shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-slate-50 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">
                        Live Preview Rendering
                      </h4>
                      <p className="text-slate-400 text-[11px] font-bold mt-1">
                        This is a dynamic simulation of your post on a Google
                        Search results page.
                      </p>
                    </div>
                    <GooglePreview />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar / Settings Area */}
        <div className="space-y-8">
          {/* Publication Settings */}
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[40px] p-8 shadow-sm space-y-8 sticky top-8">
            <div className="flex items-center gap-3">
              <Settings2 size={18} className="text-teal-500" />
              <h3 className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic">
                Controller
              </h3>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Publication Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Draft", "Published", "Scheduled"].map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        setFormData({ ...formData, status: status as any })
                      }
                      className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        formData.status === status
                          ? "bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20 scale-105 z-10"
                          : "bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Content Taxonomy
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl text-[12px] font-black text-slate-900 dark:text-white outline-none focus:border-teal-500 appearance-none"
                >
                  <option value="Technology">Neural Tech</option>
                  <option value="Cooking">Culinary Arts</option>
                  <option value="Business">Market Growth</option>
                  <option value="News">Global Pulse</option>
                </select>
              </div>
            </div>

            {/* Featured Image */}
            <div className="space-y-4 border-t border-slate-50 dark:border-slate-800 pt-6">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Main Visual
                </label>
                <span className="text-[9px] font-bold text-teal-500 uppercase cursor-pointer hover:underline">
                  Change Source
                </span>
              </div>
              <div className="relative aspect-video rounded-[32px] overflow-hidden border-2 border-dashed border-slate-200 dark:border-slate-800 group cursor-pointer bg-slate-50 dark:bg-slate-950">
                {formData.featuredImage ? (
                  <>
                    <img
                      src={formData.featuredImage}
                      alt="Featured"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                      <button className="w-12 h-12 bg-white text-slate-900 rounded-2xl hover:scale-110 transition-transform flex items-center justify-center shadow-lg">
                        <Upload size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData({ ...formData, featuredImage: "" });
                        }}
                        className="w-12 h-12 bg-rose-500 text-white rounded-2xl hover:scale-110 transition-transform flex items-center justify-center shadow-lg"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 h-full text-center space-y-3">
                    <div className="w-16 h-16 rounded-[24px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700">
                      <ImageIcon size={32} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-900 dark:text-white uppercase leading-none">
                        Drop Vision
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                        800 x 600 Minimum
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-4 border-t border-slate-50 dark:border-slate-800 pt-6">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Context Entities
                </label>
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center cursor-pointer hover:bg-teal-500/20 transition-all">
                  <X size={14} className="rotate-45" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px] font-black text-slate-600 dark:text-slate-400 group hover:border-teal-500/50 transition-all cursor-default"
                  >
                    {tag}
                    <X
                      size={12}
                      className="cursor-pointer text-slate-300 hover:text-rose-500 transition-colors"
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    Readability
                  </span>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">
                    Excellent
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-8 right-8 bg-slate-900 dark:bg-emerald-600 text-white px-8 py-5 rounded-[32px] shadow-2xl flex items-center gap-4 z-50 border border-white/10"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-sm uppercase tracking-widest">
              Protocol Success
            </span>
            <span className="text-[11px] font-bold opacity-80 uppercase tracking-wider">
              Article injected into neural network.
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
