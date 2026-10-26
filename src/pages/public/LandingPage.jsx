import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle,
  TrendingUp,
  Package,
  Boxes,
  Users,
  CreditCard,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  HelpCircle,
  ChevronDown,
  Layers,
  ChevronRight,
  Star,
  Check,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden bg-gradient-to-b from-blue-50/50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-950 dark:to-slate-950">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-400/10 dark:bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Showroom Management SaaS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
            Manage Your Showroom. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Grow Your Business.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            One powerful platform to manage your customers, inventory, sales, partners, expenses, and business performance.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="primary" icon={ArrowRight} iconPosition="right" className="w-full sm:w-auto shadow-md">
                Start Free Trial
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </a>
            <Link to="/pricing">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                View Pricing
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              14-Day Free Evaluation
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              Strict Partner Limit Enforcement
            </span>
          </div>
        </div>

        {/* 2. PRODUCT DASHBOARD PREVIEW */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-14 max-w-5xl">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-2xl p-2 sm:p-4 ring-1 ring-slate-900/5">
            <div className="bg-slate-100 dark:bg-slate-950 rounded-xl p-3 sm:p-5 border border-slate-200 dark:border-slate-800">
              {/* Window chrome */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-400 ml-2 font-mono">showroompro.app/dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" size="sm">Active Demo Session</Badge>
                  <Badge variant="indigo" size="sm">Business Plan (4/6 Partners)</Badge>
                </div>
              </div>

              {/* Mock Dashboard Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4">
                <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Revenue</span>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">Rs. 1,310,000</div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">↑ +14.2% vs last month</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Customers</span>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">6 Active</div>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">+2 this week</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Stock Valuation</span>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">Rs. 4,120,500</div>
                  <span className="text-[11px] text-slate-500 font-medium">8 Categories</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold">Partner Allocation</span>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">4 of 6 Slots</div>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">2 Slots Available</span>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Live Point-of-Sale & Inventory Sync</h4>
                    <p className="text-[11px] text-slate-400">Inventory automatically decrements when sales invoices are generated.</p>
                  </div>
                </div>
                <Link to="/dashboard">
                  <Button size="sm" variant="primary">Launch Interactive Demo →</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN FEATURES GRID */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              End-to-End Management
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Engineered specifically for high-value showrooms
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">
              Forget clunky spreadsheets. Showroom Pro gives automotive dealerships, electronics showrooms, and retail studios absolute operational clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                <Boxes className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Precision Inventory Control
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Track SKUs, barcodes, cost vs. retail margins, real-time stock levels, and instant low-stock thresholds.
              </p>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ Automatic status tags (In Stock / Low / Out)</li>
                <li className="flex items-center gap-2">✓ Cost & retail inventory valuation</li>
                <li className="flex items-center gap-2">✓ Reorder threshold alerts</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Partner Equity & Limits
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Built-in quotas for multiple partners. Strictly enforces tier limits (Basic: 2, Business: 6, Enterprise: Unlimited).
              </p>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ Clear usage counters ("4 of 6 used")</li>
                <li className="flex items-center gap-2">✓ Role assignment (Commercial, Imports, Finance)</li>
                <li className="flex items-center gap-2">✓ Equity share distribution tracking</li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
                Sales, Invoices & POS
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Record point-of-sale transactions with multiple line items, instant discount computation, and printable invoices.
              </p>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ Multiple payment modes (Cash, Wire, Card)</li>
                <li className="flex items-center gap-2">✓ Outstanding customer balance ledger</li>
                <li className="flex items-center gap-2">✓ Printable professional invoices</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BUSINESS BENEFITS */}
      <section id="benefits" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 block">
                Why Showrooms Choose Us
              </span>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">
                Stop revenue leaks and keep all partners in total alignment
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Multi-Currency Ready (Default PKR)
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Customized for commercial dealers with full support for Pakistani Rupee (PKR), USD, EUR, and GCC currencies with instant switching in settings.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Supplier Purchases & Payables
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      Track every consignment received from local or international suppliers, record advance payments, and monitor remaining payables.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                      Super Admin Multi-Tenant Governance
                    </h5>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      A dedicated Super Admin platform console to monitor registered showroom tenants, subscription MRR, payment ledgers, and system metrics.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Callout */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Showroom Pro Feature Checklist</span>
                <Badge variant="success" size="sm">Phase 1 Complete</Badge>
              </h4>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Customer CRM & Balances</span>
                  <span className="text-emerald-600 font-semibold">Included</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Product & Barcode Catalog</span>
                  <span className="text-emerald-600 font-semibold">Included</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Point-of-Sale Billing & Invoicing</span>
                  <span className="text-emerald-600 font-semibold">Included</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Supplier Consignments</span>
                  <span className="text-emerald-600 font-semibold">Included</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Partner Limits (2 / 6 / Unlimited)</span>
                  <span className="text-emerald-600 font-semibold">Enforced</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Expenses by Category</span>
                  <span className="text-emerald-600 font-semibold">Included</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Super Admin Platform Console</span>
                  <span className="text-emerald-600 font-semibold">Included</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">Supabase Backend Hooks</span>
                  <span className="text-blue-600 font-semibold">Phase 2 Target</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING TEASER */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2 block">
            Transparent Pricing
          </span>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Plans built to scale with your showroom size
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto mb-12">
            Every plan includes complete core showroom operations. Tiers are cleanly separated by business scale and partner allocations.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Basic Plan */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Starter</span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Basic Plan</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">For small showrooms & boutique stores.</p>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  Rs. 14,000 <span className="text-xs font-normal text-slate-500">/month (Demo)</span>
                </div>
                <div className="my-4 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  Fixed Quota: Maximum 2 Partners
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">✓ Full Showroom Dashboard</li>
                  <li className="flex items-center gap-2">✓ Customer & Product Management</li>
                  <li className="flex items-center gap-2">✓ Sales Records & Invoices</li>
                  <li className="flex items-center gap-2">✓ Expense Tracking</li>
                </ul>
              </div>
              <Link to="/pricing" className="mt-6 block">
                <Button variant="secondary" className="w-full">Explore Basic</Button>
              </Link>
            </div>

            {/* Business Plan */}
            <div className="p-6 rounded-2xl border-2 border-blue-600 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Growth</span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Business Plan</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">For established commercial showrooms.</p>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  Rs. 35,000 <span className="text-xs font-normal text-slate-500">/month (Demo)</span>
                </div>
                <div className="my-4 p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-700 text-xs font-semibold text-blue-800 dark:text-blue-200">
                  Fixed Quota: Maximum 6 Partners
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">✓ All Basic Features</li>
                  <li className="flex items-center gap-2">✓ Advanced Analytics & KPI Dashboard</li>
                  <li className="flex items-center gap-2">✓ Detailed Financial & Profit Reports</li>
                  <li className="flex items-center gap-2">✓ Supplier & Purchase Order Tracking</li>
                </ul>
              </div>
              <Link to="/pricing" className="mt-6 block">
                <Button variant="primary" className="w-full">Select Business</Button>
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Large Scale</span>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Enterprise Plan</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">Multi-branch and high-volume dealers.</p>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                  Rs. 75,000 <span className="text-xs font-normal text-slate-500">/month (Demo)</span>
                </div>
                <div className="my-4 p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  Partner Quota: Unlimited Partners
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">✓ All Business Features</li>
                  <li className="flex items-center gap-2">✓ Unlimited Partner Accounts</li>
                  <li className="flex items-center gap-2">✓ Multi-branch Architecture Ready</li>
                  <li className="flex items-center gap-2">✓ Custom Templates & 24/7 SLA</li>
                </ul>
              </div>
              <Link to="/pricing" className="mt-6 block">
                <Button variant="secondary" className="w-full">Explore Enterprise</Button>
              </Link>
            </div>
          </div>

          <div className="mt-10">
            <Link to="/pricing" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Compare complete feature matrix →
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FAQS */}
      <section id="faqs" className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-14">
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h3>
            <p className="text-slate-500 text-sm mt-2">
              Everything you need to know about Showroom Pro partner rules and platform capabilities.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                What are the strict partner limits on each plan?
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Basic Plan allows a maximum of 2 partners. Business Plan allows a maximum of 6 partners. Enterprise Plan has no fixed partner limit (unlimited partners). When you reach your quota, the platform prevents adding additional partners until you upgrade.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                What happens to our showroom records if a subscription expires?
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Your business records, customers, products, and invoices are never deleted upon subscription expiry. You will see a renewal reminder banner to renew your plan.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                What is the initial default currency?
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                PKR (Pakistani Rupee) is configured as the initial demo currency. You can switch between PKR, USD, EUR, GBP, AED, or SAR at any time in Showroom Settings.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Is this application ready for backend integration?
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes. All frontend states, routing, modals, and tables are structured cleanly with a clean service layer ready for seamless Supabase PostgreSQL & Auth integration in Phase 2.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CALL TO ACTION */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
            Ready to upgrade your showroom management?
          </h3>
          <p className="text-blue-100 text-sm mb-8 leading-relaxed">
            Test the live interactive dashboard right now with preloaded showroom demo records.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-semibold border-none">
                Start Free Evaluation
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-white border-white/40 hover:bg-white/10">
                Launch Showroom App
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
