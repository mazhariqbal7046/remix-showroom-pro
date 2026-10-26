import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Sparkles,
  Users,
  Shield,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const PricingPage = () => {
  const { plans, subscription, updateSubscriptionPlan, formatAmount } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [billingInterval, setBillingInterval] = useState('monthly'); // 'monthly' | 'yearly'

  const handleSelectPlan = (plan) => {
    // If user is already on dashboard, update their simulated plan
    updateSubscriptionPlan(plan.id, billingInterval);
    toast.success(`Selected ${plan.name} (${billingInterval}). Updated in demo state.`, 'Plan Updated');
    navigate('/subscription');
  };

  const comparisonFeatures = [
    { feature: 'Unlimited showroom partners', highlight: true },
    { feature: 'Full showroom dashboard' },
    { feature: 'Customer management and balances' },
    { feature: 'EV bike product and inventory catalog' },
    { feature: 'Bookings, payments, receipts and quotations' },
    { feature: 'Expenses, COGS, gross profit and net profit' },
    { feature: 'Partner ownership, profit sharing and settlements' },
    { feature: 'Daily and monthly reports' },
    { feature: 'Email notification workflows' },
  ];

  return (
    <div className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <Badge variant="indigo" size="md" className="mb-4">
            Showroom Pro Subscription
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            Simple, Transparent Pricing For Your Showroom
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            One simple plan gives every EV bike showroom the complete office management system. Select monthly or yearly billing below.
          </p>

          {/* Billing Interval Toggle */}
          <div className="mt-8 inline-flex items-center p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                billingInterval === 'monthly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                billingInterval === 'yearly'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px] px-1.5 py-0.5 rounded font-bold">
                Save 17%
              </span>
            </button>
          </div>

          <div className="mt-3 text-[11px] text-slate-400">
            * All figures are configurable simulated demo rates. Final pricing will be linked to payment gateway in Phase 2.
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 mb-20 items-stretch max-w-xl mx-auto">
          {plans.map((plan) => {
            const isCurrent = subscription.planId === plan.id;
            const price = billingInterval === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
            const period = billingInterval === 'yearly' ? '/year' : '/month';

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                  plan.popular
                    ? 'bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-xl ring-1 ring-blue-600/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-xs">
                    Most Popular Choice
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {plan.badge}
                    </span>
                    {isCurrent && (
                      <Badge variant="success" size="sm">
                        Current Plan
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                      {formatAmount(price)}
                    </span>
                    <span className="text-xs text-slate-500">{period}</span>
                  </div>

                  {/* STRICT PARTNER LIMIT HIGHLIGHT */}
                  <div className={`p-3.5 rounded-xl border mb-6 text-xs font-semibold flex items-center gap-2.5 ${
                    plan.isUnlimitedPartners
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300'
                      : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                  }`}>
                    <Users className="w-4 h-4 shrink-0" />
                    <span>
                      {plan.isUnlimitedPartners
                        ? 'Unlimited Showroom Partners'
                        : `Maximum ${plan.partnerLimit} Partners Allowed`}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Plan Inclusions
                    </span>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant={plan.popular ? 'primary' : 'secondary'}
                  size="lg"
                  className="w-full"
                  onClick={() => handleSelectPlan(plan)}
                >
                  {isCurrent ? 'Current Active Plan' : `Select ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Detailed Plan Feature Comparison
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Everything included in one complete showroom plan.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Capability</th>
                  <th className="py-3.5 px-6 font-semibold">Showroom Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {comparisonFeatures.map((row, i) => (
                  <tr key={i} className={row.highlight ? 'bg-blue-50/40 dark:bg-blue-950/20 font-semibold' : ''}>
                    <td className="py-3 px-6 text-slate-900 dark:text-white">
                      {row.feature}
                    </td>
                    <td className="py-3 px-6 text-slate-600 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
