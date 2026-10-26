import React from 'react';
import { Check, LockKeyhole } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/common/Badge';

export const AdminPlansPage = () => {
  const { plans } = useApp();
  const plan = plans[0];

  if (!plan) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-2 border-b border-slate-800">
        <h1 className="text-2xl font-bold tracking-tight text-white">Showroom Pro Subscription</h1>
        <p className="text-xs text-slate-400 mt-1">
          One fixed monthly price for every showroom. All core features and unlimited partner accounts are included.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <Badge variant="primary" size="sm">One fixed plan</Badge>
            <h2 className="mt-3 text-2xl font-bold text-white">{plan.name}</h2>
            <p className="mt-2 max-w-xl text-sm text-slate-400">{plan.description}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-wider text-slate-400">Monthly subscription</p>
            <p className="mt-1 text-3xl font-extrabold text-white">
              Rs. {Number(plan.monthlyPrice).toLocaleString('en-PK')}
              <span className="ml-1 text-xs font-normal text-slate-400">/ month</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-blue-900/60 bg-blue-950/30 p-3 text-sm text-blue-200">
          <LockKeyhole className="h-4 w-4 shrink-0" />
          Unlimited partner accounts are included at the same monthly price.
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {plan.features.map((feature) => (
            <div key={feature} className="flex items-start gap-2 text-sm text-slate-300">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
          Price is fixed at Rs. 10,000 per month. Online payment collection still needs a payment provider.
        </p>
      </section>
    </div>
  );
};
