import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  Truck,
  ShoppingCart,
  Receipt,
  FileText,
  ShoppingBag,
  UserCheck,
  CreditCard,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  User,
  LogOut,
  Building2,
  Menu,
  X,
  Search,
  Sun,
  Moon,
  ChevronDown,
  Shield,
  HelpCircle,
  Calendar,
  AlertTriangle,
  CalendarDays,
  Landmark,
  HandCoins,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';

export const ShowroomLayout = () => {
  const {
    showroomInfo,
    userProfile,
    subscription,
    activePlan,
    partnerLimitInfo,
    notifications,
    markAllNotificationsRead,
    authUser,
    authLoading,
    isSupabaseConfigured,
    currentRole,
    signOut,
    formatAmount,
  } = useApp();

  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Products', path: '/products', icon: Package },
    { name: 'Inventory', path: '/inventory', icon: Boxes },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Sales POS', path: '/sales', icon: ShoppingCart },
    { name: 'Bike Bookings', path: '/bookings', icon: CalendarDays },
    { name: 'Invoices', path: '/invoices', icon: Receipt },
    { name: 'Quotations', path: '/quotations', icon: FileText },
    { name: 'Purchases', path: '/purchases', icon: ShoppingBag },
    {
      name: 'Partners',
      path: '/partners',
      icon: UserCheck,
      badge: partnerLimitInfo.isUnlimited ? `${partnerLimitInfo.count}` : `${partnerLimitInfo.count}/${partnerLimitInfo.limit}`,
      badgeVariant: partnerLimitInfo.isLimitReached ? 'danger' : 'neutral',
    },
    { name: 'Expenses', path: '/expenses', icon: CreditCard },
    { name: 'Partner Finance', path: '/partner-finance', icon: HandCoins },
    { name: 'Finance', path: '/finance', icon: Landmark },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Daily / Monthly Reports', path: '/business-reports', icon: Calendar },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles },
    { name: 'Subscription', path: '/subscription', icon: Sparkles },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadCount > 0 ? `${unreadCount}` : null,
      badgeVariant: 'primary',
    },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];
  if (currentRole === 'partner') navItems.splice(0, navItems.length, { name: 'My Partner Portal', path: '/partner-portal', icon: HandCoins });

  const handleLogout = async () => {
    await signOut();
    toast.info('You have signed out.', 'Session Ended');
    navigate('/login');
  };

  if (authLoading) return <div className="min-h-screen grid place-items-center bg-white text-slate-600">Loading showroom…</div>;
  if (!isSupabaseConfigured || !authUser) return <Navigate to="/login" replace />;
  if (currentRole === 'partner' && location.pathname !== '/partner-portal') return <Navigate to="/partner-portal" replace />;
  if (currentRole !== 'partner' && location.pathname === '/partner-portal') return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-tight text-slate-900 dark:text-white">
                Showroom<span className="text-blue-600 dark:text-blue-400">Pro</span>
              </span>
              <span className="text-[11px] text-slate-400 truncate max-w-[130px]" title={showroomInfo.name}>
                {showroomInfo.name}
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Showroom Operations
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <Badge variant={item.badgeVariant || 'neutral'} size="sm">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          ))}
        </div>

        {/* Subscription Plan & Partner Accounts Status Card */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/70 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {activePlan.name}
              </span>
              <Badge variant="indigo" size="sm">
                {subscription.status}
              </Badge>
            </div>

            {/* Included partner accounts */}
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex justify-between mb-1">
                <span>Partners:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {partnerLimitInfo.isUnlimited
                    ? `${partnerLimitInfo.count} (Unlimited)`
                    : `${partnerLimitInfo.count} / ${partnerLimitInfo.limit}`}
                </span>
              </div>
              {!partnerLimitInfo.isUnlimited && (
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      partnerLimitInfo.isLimitReached ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{
                      width: `${Math.min(100, (partnerLimitInfo.count / partnerLimitInfo.limit) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>

            <Link
              to="/subscription"
              className="mt-2.5 block text-center text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage Subscription →
            </Link>
          </div>

          {/* Quick link to Super Admin Console */}
          <Link
            to="/super-admin"
            className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            <span>Switch to Super Admin View</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between shadow-xs">
          {/* Left section: Hamburger & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="text-slate-400">Showroom:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {showroomInfo.name}
              </span>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-slate-500">{showroomInfo.category}</span>
            </div>
          </div>

          {/* Right section: Global Search, Notification, Theme, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Date Display */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium' }).format(new Date())}</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notification Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      Notifications ({unreadCount})
                    </span>
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {notifications.slice(0, 4).map((n) => (
                      <Link
                        key={n.id}
                        to={n.link || '/notifications'}
                        onClick={() => setNotifDropdownOpen(false)}
                        className={`block px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                          !n.read ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {n.message}
                        </p>
                      </Link>
                    ))}
                  </div>
                  <div className="px-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setNotifDropdownOpen(false)}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="User menu"
              >
                <img
                  src={userProfile.avatar}
                  alt={userProfile.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                />
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    {userProfile.fullName}
                  </span>
                  <span className="text-[10px] text-slate-400">{userProfile.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">{userProfile.fullName}</p>
                    <p className="text-[11px] text-slate-400 truncate">{userProfile.email}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Badge variant="primary" size="sm">{activePlan.name}</Badge>
                      <Badge variant="neutral" size="sm">{showroomInfo.currency}</Badge>
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Owner Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      Showroom Settings
                    </Link>
                    <Link
                      to="/subscription"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Sparkles className="w-4 h-4 text-slate-400" />
                      Plan & Billing
                    </Link>
                    <Link
                      to="/super-admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 font-medium"
                    >
                      <Shield className="w-4 h-4 text-indigo-500" />
                      Super Admin Portal
                    </Link>
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
