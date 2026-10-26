import React, { useState, useMemo } from 'react';
import {
  Building,
  Search,
  Filter,
  Eye,
  ShieldAlert,
  CheckCircle,
  Ban,
  RotateCcw,
  Users,
  DollarSign,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { formatDate, exportToCSV } from '../../utils/formatters';

export const AdminShowroomsPage = () => {
  const { adminShowrooms, toggleShowroomStatus, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [viewShowroom, setViewShowroom] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const filteredShowrooms = useMemo(() => {
    return adminShowrooms.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.owner.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (planFilter !== 'all' && s.plan !== planFilter) return false;

      return true;
    });
  }, [adminShowrooms, search, statusFilter, planFilter]);

  const paginatedShowrooms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShowrooms.slice(start, start + pageSize);
  }, [filteredShowrooms, currentPage]);

  const handleConfirmToggle = () => {
    if (toggleTarget) {
      toggleShowroomStatus(toggleTarget.id);
      const next = toggleTarget.status === 'Active' ? 'Suspended' : 'Reactivated';
      toast.success(`Showroom "${toggleTarget.name}" is now ${next}.`, 'Status Updated');
      setToggleTarget(null);
    }
  };

  const handleExport = () => {
    exportToCSV(
      'superadmin-showrooms-tenants',
      filteredShowrooms,
      [
        { key: 'id', label: 'Tenant ID' },
        { key: 'name', label: 'Showroom' },
        { key: 'owner', label: 'Owner' },
        { key: 'email', label: 'Email' },
        { key: 'city', label: 'City' },
        { key: 'planName', label: 'Plan' },
        { key: 'activePartners', label: 'Active Partners' },
        { key: 'activePartners', label: 'Active Partner Accounts' },
        { key: 'mrr', label: 'Monthly MRR' },
        { key: 'status', label: 'Tenant Status' },
      ]
    );
    toast.info('Showroom tenants exported to CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tenant Showrooms Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global showroom multi-tenant roster, partner usage, subscription tiers, and account status.
          </p>
        </div>

        <Button variant="secondary" size="md" onClick={handleExport}>
          Export Tenants CSV
        </Button>
      </div>

      {/* Info notice about backend authorization */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-900/60 text-xs text-indigo-300 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-white">Multi-Tenant Architecture Notice:</span> In this Phase 1 preview, suspension toggles update local demo state. Actual tenant isolation, Row Level Security (RLS), and server-side authorization will be enforced by Supabase in Phase 2.
        </p>
      </div>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search by showroom name, owner, city, email..."
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

      {/* Showrooms Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Tenant Showroom</th>
                <th className="py-3.5 px-6 font-semibold">Owner & City</th>
                <th className="py-3.5 px-6 font-semibold">Plan & Partners</th>
                <th className="py-3.5 px-6 font-semibold">Monthly MRR</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold">Registered</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {paginatedShowrooms.map((shw) => (
                <tr key={shw.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">
                      {shw.name}
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {shw.id} • {shw.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-slate-200 font-medium">{shw.owner}</div>
                    <div className="text-[11px] text-slate-400">{shw.city}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-800/60 mb-1">
                      {shw.planName}
                    </span>
                    <div className="text-[11px] text-slate-400">
                      {shw.activePartners} active · Unlimited included
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-emerald-400">
                    {formatAmount(shw.mrr)}
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getStatusBadgeVariant(shw.status)} size="sm">
                      {shw.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {formatDate(shw.registeredDate)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewShowroom(shw)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                        title="View Tenant Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setToggleTarget(shw)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          shw.status === 'Suspended'
                            ? 'text-emerald-400 hover:bg-emerald-950/60'
                            : 'text-rose-400 hover:bg-rose-950/60'
                        }`}
                        title={shw.status === 'Suspended' ? 'Reactivate Tenant' : 'Suspend Tenant'}
                      >
                        {shw.status === 'Suspended' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredShowrooms.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Showroom Details Modal */}
      {viewShowroom && (
        <Modal
          isOpen={!!viewShowroom}
          onClose={() => setViewShowroom(null)}
          title={`Tenant: ${viewShowroom.name}`}
          subtitle={`Platform ID: ${viewShowroom.id}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Primary Contact:</span>
                <span className="font-bold text-white">{viewShowroom.owner}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-300">{viewShowroom.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="text-slate-300">{viewShowroom.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">City / Country:</span>
                <span className="text-slate-300">{viewShowroom.city}, Pakistan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Business Niche:</span>
                <span className="text-slate-300">{viewShowroom.category}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Active Tier</span>
                <div className="font-bold text-indigo-400 mt-1">{viewShowroom.planName}</div>
                <span className="text-[11px] text-slate-400">
                  {viewShowroom.partnerLimit ? `Max ${viewShowroom.partnerLimit} partners` : 'Unlimited partners'}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Showroom Sales Logged</span>
                <div className="font-bold text-emerald-400 mt-1">{formatAmount(viewShowroom.totalSalesLogged)}</div>
                <span className="text-[11px] text-slate-400">{viewShowroom.inventoryCount} items in stock</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setViewShowroom(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Suspend / Activate Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleConfirmToggle}
        title={toggleTarget?.status === 'Active' ? 'Suspend Tenant Account?' : 'Reactivate Tenant Account?'}
        message={
          toggleTarget?.status === 'Active'
            ? `Suspending "${toggleTarget?.name}" will simulate disabling login access while safely preserving all showroom records.`
            : `Reactivate "${toggleTarget?.name}" to restore full showroom functionality.`
        }
        confirmText={toggleTarget?.status === 'Active' ? 'Suspend Tenant' : 'Reactivate'}
        variant={toggleTarget?.status === 'Active' ? 'danger' : 'primary'}
      />
    </div>
  );
};
