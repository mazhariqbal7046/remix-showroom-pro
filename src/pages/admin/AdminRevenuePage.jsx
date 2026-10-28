import React, { useEffect, useState } from 'react';
import { AlertCircle, CreditCard, RefreshCw, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';

export const AdminRevenuePage = () => {
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

  const values = [
    ['Current monthly recurring revenue', metrics ? formatAmount(metrics.mrr) : '—', CreditCard],
    ['Active subscription records', metrics?.active_subscription_count ?? '—', CreditCard],
    ['Trial subscriptions', metrics?.trial_count ?? '—', CreditCard],
    ['Recorded subscriptions', metrics?.subscription_count ?? '—', CreditCard],
    ['Verified bank transfers (lifetime)', metrics ? formatAmount(metrics.verified_payment_total) : '—', CreditCard],
    ['Projected annual run rate', metrics ? formatAmount(Number(metrics.mrr) * 12) : '—', TrendingUp],
  ];
  return <div className="space-y-6">
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4"><div><h1 className="text-2xl font-bold text-slate-900">Subscription Revenue</h1><p className="mt-1 text-sm text-slate-500">Current subscription records and run rate from Supabase.</p></div><Button variant="secondary" icon={RefreshCw} onClick={refresh} disabled={loading}>{loading ? 'Refreshing…' : 'Refresh'}</Button></div>
    {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2">{values.map(([label, value, Icon]) => <div key={label} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between text-sm text-slate-500"><span>{label}</span><Icon size={18} className="text-blue-600" /></div><div className="mt-3 text-2xl font-bold text-slate-900">{value}</div></div>)}</div>
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-950"><b>Manual transfer verification is active.</b> MRR is projected from active subscription records. Verified transfer totals include only submissions approved by the admin; automatic recurring debit is not connected.</div>
  </div>;
};
