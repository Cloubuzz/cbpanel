import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ThemeToggle } from './components/ThemeToggle';
import { Dashboard } from './pages/Dashboard';
import { AutomationDetail } from './pages/AutomationDetail';
import { AutomationManager } from './pages/AutomationManager';
import { EmailManager } from './pages/EmailManager';
import { WhatsAppManager } from './pages/WhatsAppManager';
import { Campaigns } from './pages/Campaigns';
import { Chat } from './pages/Chat';
import { Segments } from './pages/Segments';
import { Settings } from './pages/Settings';
import { LiveOrders } from './pages/LiveOrders';
import { MenuItems } from './pages/MenuItems';
import { Login } from './pages/Login';
import { Modifiers } from './pages/Modifiers';
import { Menus } from './pages/Menus';
import { Categories } from './pages/Categories';
import { Banners } from './pages/Banners';
import { Vouchers } from './pages/Vouchers';
import { Discounts } from './pages/Discounts';
import { Reports } from './pages/Reports';
import { ReportDetail } from './pages/ReportDetail';
import { OutletManager } from './pages/OutletManager';
import { OutletDetail } from './pages/OutletDetail';
import { HelpDesk } from './pages/HelpDesk';
import { View } from './types';
import { Search, Bell, HelpCircle, Menu as MenuIcon } from 'lucide-react';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOutletId, setSelectedOutletId] = useState<string | null>(null);
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return <Chat />;
      case 'automations':
        return (
          <AutomationManager 
            onAdd={() => {
              setSelectedAutomationId(null);
              setCurrentView('automation-detail');
            }}
            onEdit={(id) => {
              setSelectedAutomationId(id);
              setCurrentView('automation-detail');
            }}
          />
        );
      case 'automation-detail':
        return (
          <AutomationDetail 
            automationId={selectedAutomationId || undefined}
            onBack={() => setCurrentView('automations')}
          />
        );
      case 'email-manager':
        return <EmailManager />;
      case 'whatsapp-manager':
        return <WhatsAppManager />;
      case 'campaigns':
        return <Campaigns />;
      case 'segments':
        return <Segments />;
      case 'settings':
        return <Settings />;
      case 'live-orders':
        return <LiveOrders />;
      case 'menu-items':
        return <MenuItems />;
      case 'modifiers':
        return <Modifiers />;
      case 'menus':
        return <Menus />;
      case 'categories':
        return <Categories />;
      case 'banners':
        return <Banners />;
      case 'vouchers':
        return <Vouchers />;
      case 'discounts':
        return <Discounts />;
      case 'outlets':
        return (
          <OutletManager 
            onAddOutlet={() => {
              setSelectedOutletId(null);
              setCurrentView('outlet-detail');
            }}
            onEditOutlet={(id) => {
              setSelectedOutletId(id);
              setCurrentView('outlet-detail');
            }}
          />
        );
      case 'outlet-detail':
        return (
          <OutletDetail 
            outletId={selectedOutletId || undefined}
            onBack={() => {
              setCurrentView('outlets');
              setSelectedOutletId(null);
            }}
          />
        );
      case 'reports':
        return (
          <Reports 
            onSelectReport={() => {
              setCurrentView('report-detail');
            }} 
          />
        );
      case 'report-detail':
        return (
          <ReportDetail 
            onBack={() => {
              setCurrentView('reports');
            }} 
          />
        );
      case 'help-desk':
        return <HelpDesk />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 selection:bg-teal-500 selection:text-white font-sans transition-colors duration-300">
      
      {/* Dark Mode Gradient Mesh (Only visible in dark mode) */}
      <div className="fixed inset-0 z-0 hidden dark:block bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
      
      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        onLogout={() => setIsAuthenticated(false)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 z-10">
        {/* Top Bar - Always Dark #0a384f */}
        <header className="h-20 border-b border-white/10 dark:border-teal-900/30 bg-[#0a384f] dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-6 md:px-8 z-20 transition-colors duration-300 text-white">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Menu for Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              <MenuIcon size={24} />
            </button>

            {/* Search */}
            <div className="relative hidden md:block w-96 group">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-teal-400 transition-colors" size={18} />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] text-slate-400 border border-white/10 rounded px-1.5 py-0.5">⌘ K</span>
            </div>
            <input 
              type="text" 
              placeholder="Search campaigns, segments, or AI insights..." 
              className="w-full pl-10 pr-12 py-2.5 rounded-xl bg-[#082a3c] dark:bg-slate-900/50 border border-white/10 dark:border-slate-800 text-slate-200 dark:text-slate-200 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 placeholder:text-slate-500 dark:placeholder:text-slate-600 transition-all text-sm relative z-10"
            />
          </div>
          </div>
          <div className="md:hidden font-bold text-lg capitalize text-white">{currentView}</div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800 rounded-xl transition-all relative group">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-teal-500 rounded-full border-2 border-[#0a384f] dark:border-slate-950 shadow-sm"></span>
            </button>
             <button className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 dark:hover:bg-slate-800 rounded-xl hidden sm:block transition-all">
              <HelpCircle size={20} />
            </button>
            <div className="h-8 w-px bg-white/10 dark:bg-slate-800 mx-1"></div>
            <ThemeToggle />
            
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">Alex C.</div>
                    <div className="text-xs text-slate-400">Admin</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 border border-white/10 shadow-md group-hover:shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all"></div>
            </div>
          </div>
        </header>

        {/* View Content - Background depends on theme (Light in light mode, Dark in dark mode) */}
        <div className="flex-1 overflow-auto scroll-smooth bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;