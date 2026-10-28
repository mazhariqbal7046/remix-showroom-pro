import React, { useEffect, useState } from 'react';
import { AlertCircle, Building2, CreditCard, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';

export const AdminOverviewPage = () => {
  const { formatAmount, fetchAdminMetrics } = useApp();
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const result = await fetchAdminMetrics();
    setMetrics(result.data || null);
    setError(result.error?.message || '');
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  const cards = [
    { label: 'Registered accounts', value: metrics?.signup_count ?? '—', icon: Users },
    { label: 'Active showrooms', value: metrics?.active_showrooms ?? '—', icon: Building2 },
    { label: 'Recorded subscriptions', value: metrics?.subscription_count ?? '—', icon: CreditCard },
    { label: 'Current MRR', value: metrics ? formatAmount(metrics.mrr) : '—', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
          <p className="mt-1 text-sm text-slate-500">Current counts read from the Showroom Pro database.</p>
        </div>
        <Button variant="secondary" icon={RefreshCw} onClick={refresh} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button>
      </div>

      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between text-sm text-slate-500"><span>{label}</span><Icon size={18} className="text-blue-600" /></div>
          <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
        </div>)}
      </div>

      {!loading && !error && metrics && <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
        Counts reflect current showroom and subscription rows. Historical revenue and activity analytics will appear when payment and audit records are collected.
      </div>}
    </div>
  );
};
