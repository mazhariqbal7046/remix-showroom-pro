import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';

export const PublicLayout = () => {
  const { theme, toggleTheme } = useTheme();
  const { currentRole, setCurrentRole } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: 'Overview', href: '/#features' },
    { label: 'Capabilities', href: '/#benefits' },
    { label: 'Pricing Plans', href: '/pricing' },
    { label: 'FAQs', href: '/#faqs' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Banner for Demo Awareness */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs px-4 py-2 flex items-center justify-between shadow-xs">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase">
              Phase 1 Preview
            </span>
            <span>
              Commercial SaaS Frontend Demo • Ready for Supabase Backend Integration
            </span>
          </div>
          <div className="flex items-center gap-3 mx-auto sm:mx-0">
            <Link
              to="/super-admin"
              className="underline text-blue-100 hover:text-white text-xs font-medium flex items-center gap-1"
            >
              Super Admin Console <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Public Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                Showroom<span className="text-blue-600 dark:text-blue-400">Pro</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider ml-1.5 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                SaaS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              to="/pricing"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/pricing' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              Subscription Pricing
            </Link>
            <a
              href="/#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="/#faqs"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle color theme"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>

            <Link to="/signup">
              <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                Start Free Trial
              </Button>
            </Link>

            <Link to="/dashboard">
              <Button variant="secondary" size="sm">
                Live Demo App
              </Button>
            </Link>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200"
            >
              Home
            </Link>
            <Link
              to="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200"
            >
              Subscription Pricing
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-slate-800 dark:text-slate-200"
            >
              Sign In
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full">
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Showroom Dashboard
                </Button>
              </Link>
              <Link to="/super-admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full">
                  Super Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Professional SaaS Footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-16 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-white">
                  Showroom<span className="text-blue-400">Pro</span>
                </span>
              </Link>
              <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-4">
                The all-in-one commercial showroom management suite for luxury retail, automotive dealers, electronics distributors, and furniture galleries.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Simulated Frontend Demo • Backend Phase 2</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                Product
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Showroom Dashboard</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
                <li><Link to="/inventory" className="hover:text-white transition-colors">Inventory Control</Link></li>
                <li><Link to="/sales" className="hover:text-white transition-colors">Point of Sale</Link></li>
                <li><Link to="/partners" className="hover:text-white transition-colors">Partner Allocation</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                Plans & Partners
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><span className="text-slate-300 font-medium">Basic:</span> Max 2 Partners</li>
                <li><span className="text-slate-300 font-medium">Business:</span> Max 6 Partners</li>
                <li><span className="text-slate-300 font-medium">Enterprise:</span> Unlimited</li>
                <li className="pt-2">
                  <Link to="/pricing" className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                    Compare Limits <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">
                Super Admin
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li><Link to="/super-admin" className="hover:text-white transition-colors">Platform Overview</Link></li>
                <li><Link to="/super-admin/showrooms" className="hover:text-white transition-colors">Showroom Tenants</Link></li>
                <li><Link to="/super-admin/plans" className="hover:text-white transition-colors">Plan Management</Link></li>
                <li><Link to="/super-admin/system-health" className="hover:text-white transition-colors">System Health</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Showroom Pro Inc. All rights reserved. Built with React & Tailwind CSS.</p>
            <div className="flex items-center gap-6">
              <span>Demo Frontend Mode</span>
              <span>Initial Currency: PKR</span>
              <span>Fixed Partner Tiers: 2 / 6 / Unlimited</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
