import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Download, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { exportToCSV, formatDate } from '../../utils/formatters';

export const AdminSubscriptionsPage = () => {
  const { fetchAdminShowrooms, formatAmount } = useApp();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const refresh = async () => { setLoading(true); const result = await fetchAdminShowrooms(); setRows(result.data?.showrooms || []); setError(result.error?.message || ''); setLoading(false); };
  useEffect(() => { void refresh(); }, []);
  const filtered = useMemo(() => rows.filter((row) => {
    const query = search.trim().toLowerCase();
    const matches = [row.name, row.email, row.subscription?.plan_id].some((value) => String(value || '').toLowerCase().includes(query));
    return matches && (status === 'all' || (row.subscription?.status || 'none') === status);
  }), [rows, search, status]);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const exportRows = () => exportToCSV('subscription-records', filtered.map((row) => ({ name: row.name, email: row.email, plan: row.subscription?.plan_id || '', status: row.subscription?.status || 'none', monthly_amount: row.subscription?.monthly_amount || 0, started_at: row.subscription?.started_at || '' })), [
    { key: 'name', label: 'Showroom' }, { key: 'email', label: 'Email' }, { key: 'plan', label: 'Plan' }, { key: 'status', label: 'Status' }, { key: 'monthly_amount', label: 'Monthly amount' }, { key: 'started_at', label: 'Started at' },
  ]);
  return <div className="space-y-6">
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4"><div><h1 className="text-2xl font-bold text-slate-900">Subscription Records</h1><p className="mt-1 text-sm text-slate-500">Current database subscription status. Payment collection is not connected.</p></div><div className="flex gap-2"><Button variant="secondary" icon={Download} onClick={exportRows}>Export CSV</Button><Button variant="secondary" icon={RefreshCw} onClick={refresh} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</Button></div></div>
    {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
    <SearchFilterBar searchQuery={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search showroom, email, or plan..." filterOptions={[{ label: 'All statuses', value: 'all' }, { label: 'Trial', value: 'trial' }, { label: 'Active', value: 'active' }, { label: 'Past due', value: 'past_due' }, { label: 'Cancelled', value: 'cancelled' }, { label: 'No subscription', value: 'none' }]} selectedFilter={status} onFilterChange={(value) => { setStatus(value); setPage(1); }} onExport={exportRows} exportLabel="Export CSV" />
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Showroom','Plan','Status','Monthly amount','Start date','Next billing date'].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{pageRows.map((row) => <tr key={row.id}><td className="px-4 py-4 font-semibold text-slate-900">{row.name}<div className="text-xs font-normal text-slate-400">{row.email || ''}</div></td><td className="px-4 py-4 text-slate-600">{row.subscription?.plan_id || '—'}</td><td className="px-4 py-4 capitalize text-slate-600">{row.subscription?.status || 'No subscription'}</td><td className="px-4 py-4 text-slate-700">{row.subscription ? formatAmount(row.subscription.monthly_amount) : '—'}</td><td className="px-4 py-4 text-slate-500">{row.subscription?.started_at ? formatDate(row.subscription.started_at) : '—'}</td><td className="px-4 py-4 text-slate-500">{row.subscription?.next_billing_date ? formatDate(row.subscription.next_billing_date) : 'Not scheduled'}</td></tr>)}{!loading && pageRows.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">{error ? 'Subscription records could not be loaded.' : 'No subscription records found.'}</td></tr>}</tbody></table></div><Pagination currentPage={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage}/></div>
  </div>;
};
