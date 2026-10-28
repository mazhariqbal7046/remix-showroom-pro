import React from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  ShieldCheck,
  Clock,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';

export const SubscriptionPage = () => {
  const {
    subscription,
    activePlan,
    partnerLimitInfo,
    updateSubscriptionPlan,
  } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription & Licensing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your showroom has one fixed monthly plan with all core features and unlimited partner accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">Billing provider not connected</span>
          <Link to="/pricing" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View plan details</Link>
        </div>
      </div>

      {/* Expiry Banner / Notice */}
      <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Data Retention Guarantee:</span> Your showroom data, product catalogs, customer histories, and invoices are permanent. If a subscription lapses or expires, business records are safely retained and never deleted.
        </div>
      </div>

      {/* Main Subscription Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Showroom Pro Plan
              </span>
              <Badge variant={getStatusBadgeVariant(subscription.status)} size="sm">
                {subscription.status}
              </Badge>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {activePlan.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {activePlan.description}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Current Billing Rate</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Rs. {Number(activePlan.monthlyPrice).toLocaleString('en-PK')}
              <span className="text-xs text-slate-400 font-normal">
                /month
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Online payment provider not connected yet</span>
          </div>
        </div>

        {/* 4 Details Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-semibold uppercase">Partner Accounts</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              Unlimited
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {partnerLimitInfo.displayLimitText}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-semibold uppercase">Next Renewal</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {subscription.renewalDate ? formatDate(subscription.renewalDate) : 'Not scheduled'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Billing cycle: Monthly
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-semibold uppercase">Subscription Age</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {subscription.startDate ? `Since ${formatDate(subscription.startDate)}` : 'No start date recorded'}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              Current status: {subscription.status}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span className="text-[11px] font-semibold uppercase">Payment Method</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              Not connected
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Payment details are not stored in Showroom Pro.
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Invoices History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Subscription Billing Ledger
            </h3>
            <p className="text-xs text-slate-500">Historical payments for your showroom license</p>
          </div>
          <span className="text-xs font-medium text-slate-500">Recorded transactions only</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-6 font-semibold">Reference #</th>
                <th className="py-3 px-6 font-semibold">Invoice Date</th>
                <th className="py-3 px-6 font-semibold">Plan Name</th>
                <th className="py-3 px-6 font-semibold">Amount</th>
                <th className="py-3 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subscription.invoices.length ? subscription.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300">
                    {formatDate(inv.date)}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                    {inv.plan}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                    {formatAmount(inv.amount)}
                  </td>
                  <td className="py-3.5 px-6">
                    <Badge variant="success" size="sm">
                      {inv.status}
                    </Badge>
                  </td>
                </tr>
              )) : <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No subscription payments have been recorded. Billing checkout is unavailable until a payment provider is connected.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
