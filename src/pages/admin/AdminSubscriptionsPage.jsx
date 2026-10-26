import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { formatDate, exportToCSV } from '../../utils/formatters';

export const AdminSubscriptionsPage = () => {
  const { adminShowrooms, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return adminShowrooms.filter((s) => {
      const match = s.name.toLowerCase().includes(search.toLowerCase()) || s.planName.toLowerCase().includes(search.toLowerCase());
      if (!match) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    });
  }, [adminShowrooms, search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleExport = () => {
    exportToCSV(
      'superadmin-subscriptions-ledger',
      filtered,
      [
        { key: 'name', label: 'Showroom' },
        { key: 'planName', label: 'Plan' },
        { key: 'partnerLimit', label: 'Partner Quota' },
        { key: 'mrr', label: 'Monthly Amount' },
        { key: 'status', label: 'Status' },
        { key: 'registeredDate', label: 'Start Date' },
      ]
    );
    toast.info('Exported subscriptions ledger to CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tenant Subscriptions Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor tenant licensing tiers, renewals, partner quotas, and payment statuses.
          </p>
        </div>

        <Button variant="secondary" size="md" onClick={handleExport}>
          Export Subscriptions
        </Button>
      </div>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search by showroom or plan tier..."
        filterOptions={[
          { label: 'All Statuses', value: 'all' },
          { label: 'Active', value: 'Active' },
          { label: 'Trial', value: 'Trial' },
          { label: 'Expiring Soon', value: 'Expiring Soon' },
          { label: 'Suspended', value: 'Suspended' },
        ]}
        selectedFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onExport={handleExport}
        exportLabel="Export CSV"
      />

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Tenant Showroom</th>
                <th className="py-3.5 px-6 font-semibold">Plan Tier</th>
                <th className="py-3.5 px-6 font-semibold">Partner Allocation</th>
                <th className="py-3.5 px-6 font-semibold">Billing Interval</th>
                <th className="py-3.5 px-6 font-semibold">Monthly MRR</th>
                <th className="py-3.5 px-6 font-semibold">Licensing Status</th>
                <th className="py-3.5 px-6 font-semibold">Renewal Horizon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {paginated.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">
                    {sub.name}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-indigo-400">
                      {sub.planName}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {sub.partnerLimit === null
                      ? 'Unlimited Partners'
                      : `Max ${sub.partnerLimit} Partners (${sub.activePartners} used)`}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Monthly Renewal
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-400">
                    {formatAmount(sub.mrr)}
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getStatusBadgeVariant(sub.status)} size="sm">
                      {sub.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    Nov 01, 2026 (Simulated)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};
