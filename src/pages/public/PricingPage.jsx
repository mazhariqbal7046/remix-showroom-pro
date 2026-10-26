import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const PricingPage = () => {
  const { plans } = useApp();
  const navigate = useNavigate();

  const handleSelectPlan = () => {
    navigate('/signup');
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
            One Simple Plan For Your Showroom
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            One fixed plan gives every EV bike showroom the complete office management system for Rs. 10,000 per month.
          </p>

          <div className="mt-3 text-[11px] text-slate-400">
            Online payment processing will be enabled when a payment provider is connected.
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 gap-8 mb-20 items-stretch max-w-xl mx-auto">
          {plans.map((plan) => {
            const price = Number(plan.monthlyPrice).toLocaleString('en-PK');

            return (
              <div
                key={plan.id}
                className="relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-slate-900 border-2 border-blue-600 shadow-xl ring-1 ring-blue-600/20"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {plan.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                      Rs. {price}
                    </span>
                    <span className="text-xs text-slate-500">/month</span>
                  </div>

                  <div className="p-3.5 rounded-xl border mb-6 text-xs font-semibold flex items-center gap-2.5 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300">
                    <Users className="w-4 h-4 shrink-0" />
                    <span>Unlimited Showroom Partners · Included</span>
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
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleSelectPlan}
                >
                  Create showroom account
                </Button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Everything Included
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
