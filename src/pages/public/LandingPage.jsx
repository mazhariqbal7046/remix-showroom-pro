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
                Create Showroom Account
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
              Supabase-secured account access
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              PKR pricing shown before signup
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              Unlimited Partner Accounts Included
            </span>
          </div>
        </div>
      </section>

        {/* 2. SHOWROOM WORKFLOW */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-10 max-w-5xl" aria-label="Showroom workflow">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6 text-center"><h2 className="text-xl font-bold text-slate-900">One workflow for EV showroom operations</h2><p className="mt-2 text-sm text-slate-500">Keep the customer, bike, booking, payments and delivery record together.</p></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            {['Register bike stock', 'Record customer booking', 'Track advance & balance', 'Complete delivery'].map((step, index) => <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center"><div className="mx-auto mb-2 grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">{index + 1}</div><div className="text-sm font-semibold text-slate-800">{step}</div></div>)}
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
                Partner Management & Equity
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Add every showroom partner with unlimited partner accounts included in one monthly plan.
              </p>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">✓ Unlimited partner accounts included</li>
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
                <Badge variant="success" size="sm">Showroom operations</Badge>
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
                  <span className="text-slate-600 dark:text-slate-300">Partner accounts</span>
                  <span className="text-emerald-600 font-semibold">Unlimited · Included</span>
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
                  <span className="text-emerald-600 font-semibold">Connected</span>
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
            One complete plan for every showroom
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto mb-12">
            All showroom operations, partner finance, reports, and EV bike management for one fixed monthly price.
          </p>

          <div className="max-w-3xl mx-auto text-left">
            <div className="rounded-2xl border-2 border-blue-600 bg-white dark:bg-slate-900 p-7 sm:p-9 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">One plan · All features</span>
                  <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Showroom Pro</h4>
                  <p className="text-sm text-slate-500 mt-2">Complete EV bike showroom operations for every business size.</p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white">Rs. 10,000</div>
                  <div className="text-xs text-slate-500">per showroom / month</div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span>✓ Unlimited partner accounts</span>
                <span>✓ Customers, EV bikes & inventory</span>
                <span>✓ Bookings, receipts & quotations</span>
                <span>✓ Sales, purchases & suppliers</span>
                <span>✓ Partner finance & settlements</span>
                <span>✓ Profit, daily & monthly reports</span>
              </div>
              <Link to="/signup" className="mt-7 block sm:max-w-xs">
                <Button variant="primary" className="w-full">Get Showroom Pro</Button>
              </Link>
              <p className="mt-4 text-[11px] text-slate-400">Online payment processing will be enabled when a payment provider is connected.</p>
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
                How many partners are included?
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Unlimited showroom partner accounts are included in the single Showroom Pro plan. There are no partner-based tiers or upgrade limits.
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
                PKR is the default showroom currency. Currency selection is available in Showroom Settings.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <h5 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Is this application ready for backend integration?
              </h5>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Yes. Account authentication and showroom records use Supabase. Email and online subscription payments depend on their provider configuration.
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
            Create an account to set up your own showroom workspace.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-white text-blue-700 hover:bg-blue-50 font-semibold border-none">
                Create Showroom Account
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
