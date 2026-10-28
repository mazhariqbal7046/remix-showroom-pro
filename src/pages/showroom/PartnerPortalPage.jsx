import React, { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, WalletCards, HandCoins } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';

export const PartnerPortalPage = () => {
  const { fetchPartnerSummary } = useApp();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    fetchPartnerSummary().then(({ data, error: requestError }) => {
      if (!active) return;
      setSummary(data || null);
      setError(requestError?.message || '');
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading your partner account…</div>;
  if (error || !summary) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">{error || 'Partner information is unavailable.'}</div>;
  const currency = summary.showroom?.currency || 'PKR';
  const invested = summary.investments.filter((row) => row.status !== 'Reversed').reduce((total, row) => total + Number(row.amount || 0), 0);
  const received = summary.settlements.filter((row) => row.settlement_type === 'Profit payment').reduce((total, row) => total + Number(row.amount || 0), 0);
  const withdrawals = summary.settlements.filter((row) => row.settlement_type === 'Withdrawal').reduce((total, row) => total + Number(row.amount || 0), 0);
  const amount = (value) => formatCurrency(Number(value || 0), currency);

  return <div className="space-y-6">
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
      <div><p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Partner portal · Read only</p><h1 className="mt-1 text-2xl font-bold text-slate-900">{summary.partner.full_name}</h1><p className="mt-1 text-sm text-slate-500">{summary.showroom.name} · Your account and financial history</p></div>
      <button onClick={() => window.location.reload()} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" aria-label="Refresh partner account"><RefreshCw size={17}/></button>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ['Ownership', `${Number(summary.partner.ownership_percentage || 0)}%`, TrendingUp],
        ['Profit sharing', `${Number(summary.partner.profit_sharing_percentage || 0)}%`, HandCoins],
        ['Invested capital', amount(invested), WalletCards],
        ['Profit paid', amount(received), HandCoins],
      ].map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><Icon className="mb-4 text-blue-600" size={19}/><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold text-slate-900">{value}</p></div>)}
    </div>
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-4"><h2 className="font-bold text-slate-900">My investments</h2></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{summary.investments.map((row) => <tr key={row.id}><td className="p-3">{row.entry_date}</td><td className="p-3 capitalize">{String(row.entry_type || 'investment').replaceAll('_', ' ')}</td><td className="p-3 font-semibold">{amount(row.amount)}</td></tr>)}{!summary.investments.length && <tr><td colSpan="3" className="p-6 text-center text-slate-400">No investments recorded.</td></tr>}</tbody></table></div></section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 p-4"><h2 className="font-bold text-slate-900">My settlements & withdrawals</h2><p className="mt-1 text-xs text-slate-500">Withdrawals recorded: {amount(withdrawals)}</p></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="p-3">Date</th><th className="p-3">Type</th><th className="p-3">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{summary.settlements.map((row) => <tr key={row.id}><td className="p-3">{row.settlement_date}</td><td className="p-3">{row.settlement_type}</td><td className="p-3 font-semibold">{amount(row.amount)}</td></tr>)}{!summary.settlements.length && <tr><td colSpan="3" className="p-6 text-center text-slate-400">No settlements recorded.</td></tr>}</tbody></table></div></section>
    </div>
  </div>;
};
