import React, { useState } from 'react';
import { Outlet, NavLink, Link, Navigate } from 'react-router-dom';
import {
  ShieldAlert,
  Building,
  CreditCard,
  Sliders,
  DollarSign,
  TrendingUp,
  Activity,
  Server,
  FileText,
  Settings,
  ArrowLeft,
  Menu,
  X,
  Sun,
  Moon,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { isSuperAdminUser } from '../../lib/accessControl';
import { Badge } from '../common/Badge';

export const AdminLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { adminShowrooms, platformSettings, authUser, authLoading, isSupabaseConfigured } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (authLoading) {
    return <div className="min-h-screen grid place-items-center bg-slate-950 text-slate-300">Checking admin access…</div>;
  }

  if (!isSupabaseConfigured || !isSuperAdminUser(authUser)) {
    return <Navigate to="/login" replace />;
  }

  const adminNav = [
    { name: 'Platform Overview', path: '/super-admin', icon: TrendingUp },
    { name: 'Showrooms Directory', path: '/super-admin/showrooms', icon: Building, badge: `${adminShowrooms.length}` },
    { name: 'Subscriptions', path: '/super-admin/subscriptions', icon: CreditCard },
    { name: 'Plans & Pricing', path: '/super-admin/plans', icon: Sliders },
    { name: 'Payments Ledger', path: '/super-admin/payments', icon: DollarSign },
    { name: 'Revenue Analytics', path: '/super-admin/revenue', icon: TrendingUp },
    { name: 'Platform Analytics', path: '/super-admin/analytics', icon: Activity },
    { name: 'System Health', path: '/super-admin/system-health', icon: Server, badge: 'Live', badgeVariant: 'success' },
    { name: 'Activity Logs', path: '/super-admin/activity-logs', icon: FileText },
    { name: 'Platform Settings', path: '/super-admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-light-theme min-h-screen flex flex-col bg-slate-900 text-slate-100 antialiased">
      {/* Top Super Admin Warning Banner */}
      <div className="bg-indigo-950 border-b border-indigo-800/80 px-4 py-2 flex items-center justify-between text-xs text-indigo-200">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-semibold text-white">Super Admin Console:</span>
          <span>Managing SaaS multi-tenant showrooms & platform subscriptions (Simulated Demo Phase 1)</span>
        </div>
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Showroom App</span>
        </Link>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Mobile Backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Super Admin Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-white">
                  Super Admin
                </span>
                <span className="text-[10px] text-indigo-400 font-medium">
                  Platform Controller
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Platform Governance
            </div>
            {adminNav.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/super-admin'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <Badge variant={item.badgeVariant || 'indigo'} size="sm">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            ))}
          </div>

          {/* Quick info in sidebar footer */}
          <div className="p-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex justify-between items-center text-[11px]">
              <span>Architecture:</span>
              <span className="text-emerald-400 font-medium">Multi-tenant ready</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span>DB Target:</span>
              <span className="text-indigo-300 font-medium">Supabase / PG</span>
            </div>
            <Link
              to="/dashboard"
              className="mt-3 block text-center w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              ← Back to Showroom
            </Link>
          </div>
        </aside>

        {/* Admin Main Body */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
          {/* Admin Header */}
          <header className="h-14 bg-slate-950/80 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Showroom Pro Cloud Control</span>
                <span>/</span>
                <span className="text-slate-200 font-medium">Central Administration</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
              </button>
              <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-300">Live Health: Normal</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
