import React, { useState } from "react";
import { LogOut, ChevronDown, X, Zap } from "lucide-react";
import { View } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { NAV_ITEMS } from "../constants";
import { AuthUser } from "../services/authApi";

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onChangeView,
  onLogout,
  isOpen,
  onClose,
  currentUser,
}) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  return (
    <>
      {/* Global Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
        )}
      </AnimatePresence>

      <aside
        className={`
          fixed inset-y-0 left-0 z-[110] flex flex-col h-screen border-r border-white/5 dark:border-teal-900/10
          bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] transition-all duration-500 ease-in-out w-72
          ${isOpen ? "translate-x-0 shadow-[0_0_50px_rgba(0,0,0,0.5)]" : "-translate-x-full"}
        `}
      >
        {/* Dynamic Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full"></div>
        </div>

        {/* Header / Logo */}
        <div className="flex items-center justify-between px-4 h-24 relative z-10 w-full">
          <button
            onClick={() => {
              onChangeView("launchpad");
              onClose();
            }}
            className="flex items-center gap-3 transition-all duration-300 hover:opacity-80 active:scale-95 outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.1)] rotate-3 group-hover:rotate-0 transition-transform">
              <Zap
                size={22}
                fill="currentColor"
                className="drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]"
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black text-2xl tracking-tighter text-white">
                Clou<span className="text-teal-400">buzz</span>
              </span>
              <span className="text-[10px] font-bold text-teal-500/60 uppercase tracking-[0.2em] -mt-1">
                Neural Engine
              </span>
            </div>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar relative z-10">
          <ul className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const isExpanded = expandedItems.includes(item.id);
              const isActive =
                currentView === item.id ||
                item.subItems?.some((sub) => sub.id === currentView);

              return (
                <li key={item.id} className="relative">
                  <button
                    onClick={() => {
                      if (item.subItems) {
                        toggleExpand(item.id);
                      } else {
                        onChangeView(item.id as View);
                        onClose();
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                      ${
                        isActive
                          ? "text-white bg-gradient-to-r from-teal-500/20 to-transparent border-l-4 border-teal-400"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    <div
                      className={`transition-all duration-300 ${isActive ? "text-teal-400 scale-110" : "group-hover:scale-110 group-hover:text-teal-300"}`}
                    >
                      {item.icon}
                    </div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="text-[14px] font-semibold tracking-tight">
                        {item.label}
                      </span>
                      {item.subItems && (
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      )}
                    </motion.div>
                  </button>

                  {/* Inline Sub-items */}
                  {item.subItems && isExpanded && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-1 ml-11 space-y-1 border-l border-white/10"
                    >
                      {item.subItems.map((sub) => (
                        <li key={sub.id}>
                          <button
                            onClick={() => {
                              onChangeView(sub.id);
                              onClose();
                            }}
                            className={`
                              w-full text-left px-4 py-2.5 rounded-xl text-[13px] transition-all relative
                              ${
                                currentView === sub.id
                                  ? "text-teal-400 font-bold"
                                  : "text-slate-400 hover:text-white hover:bg-white/5"
                              }
                            `}
                          >
                            {currentView === sub.id && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-teal-400 rounded-full" />
                            )}
                            {sub.label}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / User Section */}
        <div className="p-4 mt-auto relative z-10">
          <div className="mb-4 p-3 bg-white/5 rounded-2xl border border-white/5 transition-all duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 p-0.5">
                <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={`https://picsum.photos/seed/${currentUser?.userId || 'admin'}/100/100`}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {currentUser?.name || "User"}
                </p>
                <p className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">
                  {currentUser?.userType || "Admin"}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all group"
          >
            <div className="group-hover:rotate-12 transition-transform">
              <LogOut size={20} />
            </div>
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
