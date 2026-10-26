import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate, exportToCSV } from '../../utils/formatters';

export const CustomersPage = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewCustomer, setViewCustomer] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    outstandingBalance: 0,
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Filtered & Searched data
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.fullName.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        String(c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === 'has_balance') return Number(c.outstandingBalance) > 0;
      if (filter === 'no_balance') return Number(c.outstandingBalance) <= 0;
      return true;
    });
  }, [customers, search, filter]);

  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      address: '',
      outstandingBalance: 0,
      status: 'Active',
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const openEditModal = (cust) => {
    setEditingCustomer(cust);
    setFormData({
      fullName: cust.fullName,
      phone: cust.phone,
      email: cust.email,
      address: cust.address,
      outstandingBalance: cust.outstandingBalance,
      status: cust.status || 'Active',
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid email format required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
      toast.success(`Customer ${formData.fullName} updated.`, 'Record Updated');
    } else {
      addCustomer(formData);
      toast.success(`Customer ${formData.fullName} added successfully.`, 'Customer Created');
    }
    setFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteCustomer(deleteTarget.id);
      toast.success(`Customer ${deleteTarget.fullName} deleted.`, 'Customer Removed');
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    exportToCSV(
      'showroom-customers',
      filteredCustomers,
      [
        { key: 'id', label: 'Customer ID' },
        { key: 'fullName', label: 'Full Name' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'address', label: 'Address' },
        { key: 'totalPurchases', label: 'Total Purchases' },
        { key: 'outstandingBalance', label: 'Outstanding Balance' },
        { key: 'registrationDate', label: 'Registration Date' },
      ]
    );
    toast.info('Exported customer records to CSV.', 'CSV Downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage showroom client relationships, purchase histories, and receivables ledger.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          New Customer
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search by name, phone, email, or ID..."
        filterOptions={[
          { label: 'All Customers', value: 'all' },
          { label: 'With Outstanding Balance', value: 'has_balance' },
          { label: 'Cleared Balance (Zero)', value: 'no_balance' },
        ]}
        selectedFilter={filter}
        onFilterChange={setFilter}
        onExport={handleExport}
        exportLabel="Export CSV"
      />

      {/* Customer Table */}
      {filteredCustomers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers match criteria"
          description="Try modifying your search or click below to enroll a new client."
          actionLabel="Add Customer"
          onAction={openAddModal}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Client Info</th>
                  <th className="py-3.5 px-6 font-semibold">Contact & Location</th>
                  <th className="py-3.5 px-6 font-semibold">Total Purchases</th>
                  <th className="py-3.5 px-6 font-semibold">Outstanding Balance</th>
                  <th className="py-3.5 px-6 font-semibold">Joined Date</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {cust.fullName}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {cust.id}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {cust.phone}
                      </div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[200px]" title={cust.address}>
                        {cust.address}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {formatAmount(cust.totalPurchases)}
                    </td>
                    <td className="py-4 px-6">
                      {Number(cust.outstandingBalance) > 0 ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {formatAmount(cust.outstandingBalance)}
                        </span>
                      ) : (
                        <Badge variant="success" size="sm">Cleared</Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {formatDate(cust.registrationDate)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewCustomer(cust)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(cust)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cust)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
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
            totalItems={filteredCustomers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Information' : 'Enroll New Customer'}
        subtitle="Manage client details and starting receivables balance."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Malik Zeeshan"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {formErrors.fullName && <p className="text-[11px] text-rose-500 mt-1">{formErrors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 321 8899123"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {formErrors.phone && <p className="text-[11px] text-rose-500 mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@domain.pk"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {formErrors.email && <p className="text-[11px] text-rose-500 mt-1">{formErrors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Physical Address / Location
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Sector, Street, City"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Outstanding Balance
            </label>
            <input
              type="number"
              min="0"
              value={formData.outstandingBalance}
              onChange={(e) => setFormData({ ...formData, outstandingBalance: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setFormModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Details Modal */}
      {viewCustomer && (
        <Modal
          isOpen={!!viewCustomer}
          onClose={() => setViewCustomer(null)}
          title="Customer Profile & Balance"
          subtitle={`Details for ${viewCustomer.fullName}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{viewCustomer.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Full Name:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{viewCustomer.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Phone:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{viewCustomer.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-700 dark:text-slate-300">{viewCustomer.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Address:</span>
                <span className="text-slate-700 dark:text-slate-300 text-right">{viewCustomer.address || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Enrolled Since:</span>
                <span className="text-slate-700 dark:text-slate-300">{formatDate(viewCustomer.registrationDate)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Purchases</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {formatAmount(viewCustomer.totalPurchases)}
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Balance</span>
                <div className="text-base font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {formatAmount(viewCustomer.outstandingBalance)}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="secondary" onClick={() => setViewCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Customer Record?"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}? Their associated purchase records will remain intact.`}
        confirmText="Delete Customer"
        variant="danger"
      />
    </div>
  );
};
