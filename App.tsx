import React from 'react';
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
import { LiveOrders } from './pages/live-orders';
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
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import {
  clearAuthError,
  loginUser,
  type LoginCredentials,
  logout,
  setSidebarOpen,
} from './store/slices/appSlice';
import {
  selectAuthError,
  selectAuthLoading,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsSidebarOpen,
} from './store/selectors/appSelectors';
import { clearStoredAuthSession } from './services/authStorage';
import {
  DEFAULT_AUTHENTICATED_PATH,
  getPathForView,
  getViewFromPath,
  LOGIN_PATH,
  normalizeLandingPath,
} from './routes';

const AutomationDetailRoute: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { automationId } = useParams<{ automationId: string }>();
  return <AutomationDetail automationId={automationId} onBack={onBack} />;
};

const OutletDetailRoute: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { outletId } = useParams<{ outletId: string }>();
  return <OutletDetail outletId={outletId} onBack={onBack} />;
};

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isSidebarOpen = useAppSelector(selectIsSidebarOpen);
  const authLoading = useAppSelector(selectAuthLoading);
  const authError = useAppSelector(selectAuthError);
  const currentUser = useAppSelector(selectCurrentUser);

  const currentView = React.useMemo(() => getViewFromPath(location.pathname), [location.pathname]);
  const landingPath = React.useMemo(
    () => normalizeLandingPath(currentUser?.landingPage),
    [currentUser?.landingPage],
  );
  const mobileViewTitle = React.useMemo(
    () => currentView.replace(/-/g, ' '),
    [currentView],
  );

  const handleLogin = async (credentials: LoginCredentials) => {
    const result = await dispatch(loginUser(credentials));

    if (loginUser.fulfilled.match(result)) {
      const nextPath = normalizeLandingPath(result.payload.user.landingPage);
      navigate(nextPath, { replace: true });
    }
  };

  const handleLogout = () => {
    clearStoredAuthSession();
    dispatch(logout());
    navigate(LOGIN_PATH, { replace: true });
  };

  const handleSidebarNavigation = (view: View) => {
    const nextPath = getPathForView(view);
    navigate(nextPath);
  };

  const goToAutomationsList = () => navigate('/admin/automations');
  const goToOutletsList = () => navigate('/admin/outlets');
  const goToReportsList = () => navigate('/admin/reports');

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path={LOGIN_PATH}
          element={
            <Login
              onLogin={handleLogin}
              onClearError={() => dispatch(clearAuthError())}
              isLoading={authLoading}
              error={authError}
            />
          }
        />
        <Route path="*" element={<Navigate to={LOGIN_PATH} replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 selection:bg-teal-500 selection:text-white font-sans transition-colors duration-300">
      
      {/* Dark Mode Gradient Mesh (Only visible in dark mode) */}
      <div className="fixed inset-0 z-0 hidden dark:block bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/20 via-slate-950 to-slate-950 pointer-events-none"></div>
      
      <Sidebar 
        currentView={currentView} 
        onChangeView={handleSidebarNavigation}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => dispatch(setSidebarOpen(false))}
      />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-all duration-300 z-10">
        {/* Top Bar - Always Dark #0a384f */}
        <header className="h-20 border-b border-white/10 dark:border-teal-900/30 bg-[#0a384f] dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-6 md:px-8 z-20 transition-colors duration-300 text-white">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Menu for Mobile */}
            <button 
              onClick={() => dispatch(setSidebarOpen(true))}
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
          <div className="md:hidden font-bold text-lg capitalize text-white">{mobileViewTitle}</div>

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
                  <div className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">{currentUser?.name || 'User'}</div>
                  <div className="text-xs text-slate-400">{currentUser?.userType || 'Admin'}</div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 border border-white/10 shadow-md group-hover:shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all"></div>
            </div>
          </div>
        </header>

        {/* View Content - Background depends on theme (Light in light mode, Dark in dark mode) */}
        <div className="flex-1 overflow-auto scroll-smooth bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <Routes>
            <Route path="/" element={<Navigate to={landingPath || DEFAULT_AUTHENTICATED_PATH} replace />} />
            <Route path="/admin" element={<Navigate to={landingPath || DEFAULT_AUTHENTICATED_PATH} replace />} />

            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/chat" element={<Chat />} />

            <Route
              path="/admin/automations"
              element={
                <AutomationManager
                  onAdd={() => navigate('/admin/automations/new')}
                  onEdit={(id) => navigate(`/admin/automations/${id}`)}
                />
              }
            />
            <Route
              path="/admin/automations/new"
              element={<AutomationDetail onBack={goToAutomationsList} />}
            />
            <Route
              path="/admin/automations/:automationId"
              element={<AutomationDetailRoute onBack={goToAutomationsList} />}
            />

            <Route path="/admin/email-manager" element={<EmailManager />} />
            <Route path="/admin/whatsapp-manager" element={<WhatsAppManager />} />
            <Route path="/admin/campaigns" element={<Campaigns />} />
            <Route path="/admin/segments" element={<Segments />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/admin/live-orders" element={<LiveOrders />} />
            <Route path="/admin/menu-items" element={<MenuItems />} />
            <Route path="/admin/modifiers" element={<Modifiers />} />
            <Route path="/admin/menus" element={<Menus />} />
            <Route path="/admin/categories" element={<Categories />} />
            <Route path="/admin/banners" element={<Banners />} />
            <Route path="/admin/vouchers" element={<Vouchers />} />
            <Route path="/admin/discounts" element={<Discounts />} />

            <Route
              path="/admin/outlets"
              element={
                <OutletManager
                  onAddOutlet={() => navigate('/admin/outlets/new')}
                  onEditOutlet={(id) => navigate(`/admin/outlets/${id}`)}
                />
              }
            />
            <Route
              path="/admin/outlets/new"
              element={<OutletDetail onBack={goToOutletsList} />}
            />
            <Route
              path="/admin/outlets/:outletId"
              element={<OutletDetailRoute onBack={goToOutletsList} />}
            />

            <Route
              path="/admin/reports"
              element={<Reports onSelectReport={() => navigate('/admin/reports/detail')} />}
            />
            <Route
              path="/admin/reports/detail"
              element={<ReportDetail onBack={goToReportsList} />}
            />

            <Route path="/admin/help-desk" element={<HelpDesk />} />

            <Route path={LOGIN_PATH} element={<Navigate to={landingPath || DEFAULT_AUTHENTICATED_PATH} replace />} />
            <Route path="*" element={<Navigate to={landingPath || DEFAULT_AUTHENTICATED_PATH} replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;