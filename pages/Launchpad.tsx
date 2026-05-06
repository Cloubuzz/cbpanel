import React, { useMemo, useState } from "react";
import { Search, LogOut, Bell, Zap } from "lucide-react";
import { motion } from "motion/react";
import { NAV_ITEMS } from "../constants";
import { View } from "../types";
import { AuthUser } from "../services/authApi";

interface ModuleItem {
  id: View;
  label: string;
  icon: React.ReactNode;
  parentLabel: string | null;
}

interface LaunchpadProps {
  onSelectView: (view: View) => void;
  onLogout?: () => void;
  currentUser?: AuthUser | null;
}

export const Launchpad: React.FC<LaunchpadProps> = ({
  onSelectView,
  onLogout,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const allModules = useMemo(() => {
    const modules: ModuleItem[] = [];

    NAV_ITEMS.forEach((item) => {
      if (item.subItems) {
        item.subItems.forEach((sub) => {
          modules.push({
            id: sub.id as View,
            label: sub.label,
            icon: item.icon,
            parentLabel: item.label,
          });
        });
      } else {
        modules.push({
          id: item.id as View,
          label: item.label,
          icon: item.icon,
          parentLabel: null,
        });
      }
    });

    return modules;
  }, []);

  const filteredModules = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();

    return allModules.filter(
      (module) =>
        module.label.toLowerCase().includes(lowerQuery) ||
        (module.parentLabel &&
          module.parentLabel.toLowerCase().includes(lowerQuery)),
    );
  }, [allModules, searchQuery]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.05,
      },
    },
  };

  const itemAnim = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start py-8 px-6 overflow-x-hidden select-none pb-24 bg-[#030712]">
      {/* --- Futuristic Animated Background (Matching Login) --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep Space Gradient Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617]"></div>

        {/* Animated Aurora / Blobs - Reduced for mobile performance */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-spin-slow opacity-20 hidden sm:block">
          <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-teal-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob"></div>
          <div className="absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[20%] left-[30%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-4000"></div>
        </div>

        {/* Simpler background for mobile */}
        <div className="absolute inset-0 sm:hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[80px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full"></div>
        </div>

        {/* Moving Grid Floor (Perspective) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] hidden sm:block"></div>

        {/* Floating Particles - Reduced for mobile */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-teal-400 rounded-full animate-float opacity-30"></div>
          <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-purple-400 rounded-full animate-float animation-delay-2000 opacity-30"></div>
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float animation-delay-4000 opacity-30"></div>
        </div>
      </div>

      {/* Top Bar - Launchpad Version */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-7xl flex items-center justify-between mb-12 relative z-30"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg shadow-teal-500/10">
            <Zap size={20} className="text-teal-400" fill="currentColor" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">
              Cloubuzz
            </h1>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-medium">
              OS Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block"></div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-white/40 hover:text-white transition-colors relative group">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
            </button>

            <div className="h-8 w-px bg-white/10 mx-2"></div>

            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">
                {currentUser?.name
                  ? currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : "User"}
              </p>
              <p className="text-[10px] text-white/40">
                {currentUser?.userType || "Admin"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-white/10 overflow-hidden relative group cursor-pointer">
              <img
                src={`https://picsum.photos/seed/${currentUser?.userId || 'admin'}/100/100`}
                alt="Profile"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg mb-16 relative z-20 group"
      >
        <div className="relative">
          <Search
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 transition-colors"
            size={18}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, tools, or insights"
            className="w-full h-14 pl-14 pr-6 bg-white/5 backdrop-blur-xl sm:backdrop-blur-3xl border border-white/5 rounded-2xl text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all text-sm tracking-wide shadow-2xl shadow-black/40 will-change-transform"
          />
        </div>
      </motion.div>

      {/* Modules Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-6 gap-y-12 sm:gap-x-12 sm:gap-y-16 max-w-7xl mx-auto z-10"
      >
        {filteredModules.map((module) => (
          <motion.button
            key={module.id}
            variants={itemAnim}
            onClick={() => onSelectView(module.id)}
            className="flex flex-col items-center group relative outline-none will-change-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-20 h-20 md:w-22 md:h-22 mb-4 shrink-0 transition-transform duration-300 group-hover:-translate-y-1">
              <div className="absolute inset-2 bg-teal-500/0 group-hover:bg-teal-500/25 blur-2xl rounded-3xl transition-all duration-500 hidden sm:block"></div>

              <div className="relative w-full h-full bg-slate-800/40 sm:bg-gradient-to-b sm:from-white/10 sm:to-white/5 border border-white/10 rounded-[28%] flex items-center justify-center text-white/80 shadow-2xl group-hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.2)] group-hover:border-teal-500/30 transition-all duration-300 overflow-hidden backdrop-blur-sm sm:backdrop-blur-md">
                <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                <div className="group-hover:scale-110 transition-transform duration-500 group-hover:text-teal-400">
                  {React.cloneElement(module.icon as React.ReactElement, {
                    size: 28,
                  })}
                </div>

                {module.parentLabel && (
                  <div className="absolute bottom-2.5 right-2.5">
                    <div className="w-1.5 h-1.5 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.8)]"></div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[12px] font-bold text-white/90 drop-shadow-sm tracking-wide text-center max-w-[120px] line-clamp-1 group-hover:text-white transition-colors">
                {module.label}
              </span>

              {module.parentLabel && (
                <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest">
                  {module.parentLabel}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Pagination Style Dots */}
      <div className="fixed bottom-10 flex gap-2.5 z-30 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/5">
        <div className="w-1.5 h-1.5 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"></div>
        <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-white/10 rounded-full"></div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 10s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};
