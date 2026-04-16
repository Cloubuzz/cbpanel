import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  GitBranch, 
  Megaphone, 
  Users, 
  Settings, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Utensils,
  LayoutTemplate,
  MessageCircle,
  MessageSquareText,
  ChevronDown,
  Menu,
  Store,
  X,
  LifeBuoy
} from 'lucide-react';
import { NavItem, View } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentView: View;
  onChangeView: (view: View) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, onLogout, isOpen, onClose }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const [prevView, setPrevView] = useState(currentView);
  if (currentView !== prevView) {
    setPrevView(currentView);
    if (currentView === 'live-orders' && !collapsed) {
      setCollapsed(true);
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'live-orders', label: 'Live Orders', icon: <Utensils size={20} /> },
    { 
      id: 'menu-manager', 
      label: 'Menu Manager', 
      icon: <Menu size={20} />,
      subItems: [
        { id: 'menus', label: 'Menus' },
        { id: 'categories', label: 'Categories' },
        { id: 'menu-items', label: 'Menu Items' },
        { id: 'modifiers', label: 'Modifiers' }
      ]
    },
    { id: 'outlets', label: 'Outlet Manager', icon: <Store size={20} /> },
    { id: 'chat', label: 'Support & CRM', icon: <MessageSquareText size={20} /> },
    { id: 'help-desk', label: 'Help Desk', icon: <LifeBuoy size={20} /> },
    { id: 'automations', label: 'Business Automation', icon: <GitBranch size={20} /> },
    { id: 'email-manager', label: 'Email Templates', icon: <LayoutTemplate size={20} /> },
    { id: 'whatsapp-manager', label: 'WhatsApp', icon: <MessageCircle size={20} /> },
    { 
      id: 'marketing', 
      label: 'Marketing', 
      icon: <Megaphone size={20} />,
      subItems: [
        { id: 'campaigns', label: 'Campaigns' },
        { id: 'vouchers', label: 'Vouchers' },
        { id: 'discounts', label: 'Discounts' }
      ]
    },
    { id: 'banners', label: 'Banners & Popups', icon: <LayoutTemplate size={20} /> },
    { id: 'segments', label: 'Customer Segments', icon: <Users size={20} /> },
    { id: 'reports', label: 'Reports & Analytics', icon: <BarChart3 size={20} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={`
          fixed inset-y-0 left-0 z-[110] flex flex-col h-screen border-r border-white/5 dark:border-teal-900/20 
          bg-[#072a3c] dark:bg-slate-950 transition-all duration-500 ease-in-out
          lg:relative lg:translate-x-0
          ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-20' : 'lg:w-72'}
        `}
        onMouseLeave={() => setHoveredItem(null)}
      >
        {/* Dynamic Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full"></div>
        </div>

        {/* Header / Logo */}
        <div className="flex items-center justify-between px-4 h-24 relative z-10">
          <div className={`flex items-center gap-3 transition-all duration-500 ${collapsed && !isOpen ? 'lg:opacity-0 lg:scale-50' : 'opacity-100 scale-100'}`}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-400 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 rotate-3 group-hover:rotate-0 transition-transform">
              <Utensils size={22} />
            </div>
            {(!collapsed || isOpen) && (
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tighter text-white">
                  Clou<span className="text-teal-400">buzz</span>
                </span>
                <span className="text-[10px] font-bold text-teal-500/60 uppercase tracking-[0.2em] -mt-1">Neural Engine</span>
              </div>
            )}
          </div>
          
          {collapsed && !isOpen && (
             <div className="absolute inset-0 hidden lg:flex items-center justify-center">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-teal-500/20">C</div>
             </div>
          )}

          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex absolute -right-4 top-10 w-8 h-8 bg-[#072a3c] dark:bg-slate-900 text-white rounded-xl items-center justify-center shadow-lg shadow-teal-500/30 hover:scale-110 transition-all z-50 border border-white/10 dark:border-teal-900/30"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar relative z-10">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const isExpanded = expandedItems.includes(item.id);
              const isActive = currentView === item.id || item.subItems?.some(sub => sub.id === currentView);
              const isHovered = hoveredItem === item.id;

              return (
                <li 
                  key={item.id} 
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.id)}
                >
                  <button
                    onClick={() => {
                      if (item.subItems) {
                        if (collapsed && !isOpen) {
                          setCollapsed(false);
                          if (!isExpanded) toggleExpand(item.id);
                        } else {
                          toggleExpand(item.id);
                        }
                      } else {
                        onChangeView(item.id as View);
                        if (window.innerWidth < 1024) onClose();
                      }
                    }}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative
                      ${isActive 
                        ? 'text-white bg-gradient-to-r from-teal-500/20 to-transparent border-l-4 border-teal-400' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                      ${collapsed && !isOpen ? 'lg:justify-center lg:px-0' : ''}
                    `}
                  >
                    <div className={`transition-all duration-300 ${isActive ? 'text-teal-400 scale-110' : 'group-hover:scale-110 group-hover:text-teal-300'}`}>
                      {item.icon}
                    </div>
                    
                    {(!collapsed || isOpen) && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 flex items-center justify-between"
                      >
                        <span className="text-[14px] font-semibold tracking-tight">{item.label}</span>
                        {item.subItems && (
                          <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        )}
                      </motion.div>
                    )}

                    {/* Active Indicator Dot for Collapsed */}
                    {collapsed && !isOpen && isActive && (
                      <div className="absolute right-2 hidden lg:block w-1.5 h-1.5 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(45,212,191,0.8)]" />
                    )}
                  </button>

                  {/* Floating Sub-menu for Collapsed Mode (Desktop only) */}
                  <AnimatePresence>
                    {collapsed && !isOpen && item.subItems && isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        className="absolute left-full top-0 ml-4 w-56 bg-[#0a384f] dark:bg-slate-900 border border-white/10 dark:border-teal-900/30 rounded-[24px] shadow-2xl p-3 z-[100] backdrop-blur-xl hidden lg:block"
                      >
                        <div className="px-4 py-2 mb-2 border-b border-white/5">
                          <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.2em]">{item.label}</p>
                        </div>
                        <ul className="space-y-1">
                          {item.subItems.map(sub => (
                            <li key={sub.id}>
                              <button
                                onClick={() => {
                                  onChangeView(sub.id);
                                  if (window.innerWidth < 1024) onClose();
                                }}
                                className={`
                                  w-full text-left px-4 py-2.5 rounded-xl text-[13px] transition-all
                                  ${currentView === sub.id 
                                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' 
                                    : 'text-slate-300 hover:bg-white/5 hover:text-white'}
                                `}
                              >
                                {sub.label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Inline Sub-items for Expanded Mode or Mobile */}
                  {(!collapsed || isOpen) && item.subItems && isExpanded && (
                    <motion.ul 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-1 ml-11 space-y-1 border-l border-white/10"
                    >
                      {item.subItems.map(sub => (
                        <li key={sub.id}>
                          <button
                            onClick={() => {
                              onChangeView(sub.id);
                              if (window.innerWidth < 1024) onClose();
                            }}
                            className={`
                              w-full text-left px-4 py-2.5 rounded-xl text-[13px] transition-all relative
                              ${currentView === sub.id 
                                ? 'text-teal-400 font-bold' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'}
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
          <div className={`mb-4 p-3 bg-white/5 rounded-2xl border border-white/5 transition-all duration-500 ${collapsed && !isOpen ? 'lg:opacity-0 lg:scale-50 lg:h-0 lg:overflow-hidden lg:mb-0' : 'opacity-100 scale-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 p-0.5">
                <div className="w-full h-full rounded-[10px] bg-slate-900 flex items-center justify-center overflow-hidden">
                  <img src="https://picsum.photos/seed/admin/100/100" alt="User" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">Alex Cloud</p>
                <p className="text-[10px] text-teal-500 font-bold uppercase tracking-wider">Super Admin</p>
              </div>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className={`
              w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all group
              ${collapsed && !isOpen ? 'lg:justify-center' : ''}
          `}>
            <div className="group-hover:rotate-12 transition-transform">
              <LogOut size={20} />
            </div>
            {(!collapsed || isOpen) && <span className="text-sm font-semibold">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
};