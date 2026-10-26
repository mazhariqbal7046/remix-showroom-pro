import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Receipt,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { formatDate, exportToCSV } from '../../utils/formatters';

export const AdminPaymentsPage = () => {
  const { adminPayments, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(() => {
    return adminPayments.filter((p) => {
      const match =
        p.reference.toLowerCase().includes(search.toLowerCase()) ||
        p.showroomName.toLowerCase().includes(search.toLowerCase()) ||
        p.plan.toLowerCase().includes(search.toLowerCase());

      if (!match) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      return true;
    });
  }, [adminPayments, search, statusFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage]);

  const handleExport = () => {
    exportToCSV(
      'superadmin-payments-ledger',
      filtered,
      [
        { key: 'reference', label: 'Payment Reference' },
        { key: 'showroomName', label: 'Showroom' },
        { key: 'plan', label: 'Plan' },
        { key: 'amount', label: 'Amount' },
        { key: 'method', label: 'Payment Method' },
        { key: 'date', label: 'Payment Date' },
        { key: 'status', label: 'Status' },
      ]
    );
    toast.info('Exported payments ledger to CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Subscription Payments Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global payment transactions across all tenant showroom subscriptions.
          </p>
        </div>

        <Button variant="secondary" size="md" onClick={handleExport}>
          Export Payments CSV
        </Button>
      </div>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search payment reference, showroom, plan..."
        filterOptions={[
          { label: 'All Statuses', value: 'all' },
          { label: 'Paid', value: 'Paid' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Failed', value: 'Failed' },
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
                <th className="py-3.5 px-6 font-semibold">Payment Ref</th>
                <th className="py-3.5 px-6 font-semibold">Tenant Showroom</th>
                <th className="py-3.5 px-6 font-semibold">Subscription Plan</th>
                <th className="py-3.5 px-6 font-semibold">Amount</th>
                <th className="py-3.5 px-6 font-semibold">Payment Gateway</th>
                <th className="py-3.5 px-6 font-semibold">Date</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {paginated.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-indigo-400">
                    {pay.reference}
                  </td>
                  <td className="py-4 px-6 font-bold text-white">
                    {pay.showroomName}
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {pay.plan}
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-400">
                    {formatAmount(pay.amount)}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {pay.method}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {formatDate(pay.date)}
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getStatusBadgeVariant(pay.status)} size="sm">
                      {pay.status}
                    </Badge>
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
