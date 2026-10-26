import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Users,
  ShieldCheck,
  Download,
  ArrowRight,
  RefreshCw,
  Clock,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';

export const SubscriptionPage = () => {
  const {
    subscription,
    activePlan,
    plans,
    partnerLimitInfo,
    updateSubscriptionPlan,
    formatAmount,
  } = useApp();

  const { toast } = useToast();

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(subscription.planId);
  const [billingInterval, setBillingInterval] = useState(subscription.billingInterval || 'monthly');

  const handleSimulateRenewal = () => {
    updateSubscriptionPlan(subscription.planId, subscription.billingInterval);
    toast.success(`Simulated renewal processed for ${activePlan.name}. Renewal date extended.`, 'Payment Recorded');
  };

  const handleConfirmUpgrade = () => {
    updateSubscriptionPlan(selectedPlanId, billingInterval);
    const chosenPlan = plans.find(p => p.id === selectedPlanId);
    toast.success(`Showroom successfully upgraded to ${chosenPlan?.name} (${billingInterval}).`, 'Subscription Updated');
    setUpgradeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription & Licensing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your showroom SaaS tier, partner limits, renewal dates, and billing receipts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" icon={RefreshCw} onClick={handleSimulateRenewal}>
            Simulate Renewal
          </Button>
          <Button variant="primary" icon={Sparkles} onClick={() => setUpgradeModalOpen(true)}>
            Change / Upgrade Plan
          </Button>
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
                Active SaaS Tier
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
              {formatAmount(
                subscription.billingInterval === 'yearly'
                  ? activePlan.yearlyPrice
                  : activePlan.monthlyPrice
              )}
              <span className="text-xs text-slate-400 font-normal">
                /{subscription.billingInterval}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Auto-renews via Card (•••• 4242)</span>
          </div>
        </div>

        {/* 4 Details Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-semibold uppercase">Partner Quota</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {partnerLimitInfo.isUnlimited ? 'Unlimited' : `${partnerLimitInfo.limit} Partners`}
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
              {formatDate(subscription.renewalDate)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Billing cycle: {subscription.billingInterval}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-semibold uppercase">Subscription Age</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              Since {formatDate(subscription.startDate)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              Active & in good standing
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span className="text-[11px] font-semibold uppercase">Payment Method</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              Visa ending {subscription.cardLast4}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Simulated payment card
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
          <span className="text-xs font-medium text-slate-500">All payments simulated</span>
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
                <th className="py-3 px-6 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subscription.invoices.map((inv) => (
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
                  <td className="py-3.5 px-6 text-right">
                    <button
                      onClick={() => toast.info(`Receipt for ${inv.id} downloaded (simulated).`, 'Receipt Exported')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Download PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Upgrade or Switch Subscription Plan"
        subtitle="Select a plan below to scale your showroom partner allocation."
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-xs mx-auto text-xs">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`flex-1 py-1.5 rounded-lg font-semibold ${
                billingInterval === 'monthly' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`flex-1 py-1.5 rounded-lg font-semibold ${
                billingInterval === 'yearly' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs' : 'text-slate-500'
              }`}
            >
              Yearly (Save 17%)
            </button>
          </div>

          <div className="space-y-3">
            {plans.map((p) => {
              const isSelected = selectedPlanId === p.id;
              const price = billingInterval === 'yearly' ? p.yearlyPrice : p.monthlyPrice;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h4>
                      <Badge variant={p.id === 'enterprise' ? 'indigo' : 'primary'} size="sm">
                        {p.isUnlimitedPartners ? 'Unlimited Partners' : `Max ${p.partnerLimit} Partners`}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{p.description}</p>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-base text-slate-900 dark:text-white">
                      {formatAmount(price)}
                    </div>
                    <span className="text-[10px] text-slate-400">/{billingInterval}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setUpgradeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmUpgrade}>
              Confirm Selection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
