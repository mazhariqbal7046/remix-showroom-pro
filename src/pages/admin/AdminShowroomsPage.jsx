import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Building2, Download, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { exportToCSV, formatDate } from '../../utils/formatters';

const statusLabel = (row) => row.subscription?.status ? row.subscription.status.replace(/^./, (char) => char.toUpperCase()) : 'No subscription';

export const AdminShowroomsPage = () => {
  const { fetchAdminShowrooms, formatAmount } = useApp();
  const [showrooms, setShowrooms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const refresh = async () => {
    setLoading(true);
    const result = await fetchAdminShowrooms();
    setShowrooms(result.data?.showrooms || []);
    setError(result.error?.message || '');
    setLoading(false);
  };
  useEffect(() => { void refresh(); }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return showrooms.filter((row) => [row.name, row.email, row.phone, row.city, row.country].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [showrooms, search]);
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const exportRows = () => exportToCSV('showroom-directory', filtered.map((row) => ({ ...row, status: statusLabel(row), mrr: row.subscription?.status === 'active' ? row.subscription.monthly_amount : 0 })), [
    { key: 'name', label: 'Showroom' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'city', label: 'City' }, { key: 'status', label: 'Subscription status' }, { key: 'mrr', label: 'Active MRR' }, { key: 'created_at', label: 'Registered at' },
  ]);

  return <div className="space-y-6">
    <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4"><div><h1 className="text-2xl font-bold text-slate-900">Showroom Directory</h1><p className="mt-1 text-sm text-slate-500">Registered showroom accounts from Supabase.</p></div><div className="flex gap-2"><Button variant="secondary" icon={Download} onClick={exportRows}>Export CSV</Button><Button variant="secondary" icon={RefreshCw} onClick={refresh} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</Button></div></div>
    {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
    <SearchFilterBar searchQuery={search} onSearchChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search showroom, email, phone, or city..." onExport={exportRows} exportLabel="Export CSV" />
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{['Showroom','Contact','Location','Partners','Subscription','Active MRR','Registered'].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{pageRows.map((row) => <tr key={row.id}>
          <td className="px-4 py-4"><div className="flex items-center gap-2 font-semibold text-slate-900"><Building2 size={16} className="text-blue-600" />{row.name}</div><div className="mt-1 text-xs text-slate-400">{row.category || 'EV Bike Showroom'}</div></td>
          <td className="px-4 py-4 text-slate-600">{row.email || '—'}<div className="text-xs text-slate-400">{row.phone || ''}</div></td>
          <td className="px-4 py-4 text-slate-600">{[row.city, row.country].filter(Boolean).join(', ') || '—'}</td>
          <td className="px-4 py-4 text-slate-600">{row.active_partners}</td>
          <td className="px-4 py-4 capitalize text-slate-600">{statusLabel(row)}</td>
          <td className="px-4 py-4 text-slate-700">{row.subscription?.status === 'active' ? formatAmount(row.subscription.monthly_amount) : formatAmount(0)}</td>
          <td className="px-4 py-4 text-slate-500">{row.created_at ? formatDate(row.created_at.slice(0, 10)) : '—'}</td>
        </tr>)}
        {!loading && pageRows.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">{error ? 'Showroom records could not be loaded.' : 'No showroom accounts match this search.'}</td></tr>}</tbody>
      </table></div>
      <Pagination currentPage={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />
    </div>
  </div>;
};
