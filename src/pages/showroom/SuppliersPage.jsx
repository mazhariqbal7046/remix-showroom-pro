import React, { useState, useMemo } from 'react';
import {
  Truck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  MapPin,
  Download,
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
import { exportToCSV } from '../../utils/formatters';

export const SuppliersPage = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewSupplier, setViewSupplier] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    productsSupplied: '',
    outstandingBalance: 0,
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.company.toLowerCase().includes(search.toLowerCase()) ||
        s.productsSupplied.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search);

      if (!matchesSearch) return false;
      if (filter === 'has_balance') return Number(s.outstandingBalance) > 0;
      if (filter === 'zero_balance') return Number(s.outstandingBalance) <= 0;
      return true;
    });
  }, [suppliers, search, filter]);

  const paginatedSuppliers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSuppliers.slice(start, start + pageSize);
  }, [filteredSuppliers, currentPage]);

  const openAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      company: '',
      phone: '',
      email: '',
      address: '',
      productsSupplied: '',
      outstandingBalance: 0,
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const openEditModal = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name,
      company: sup.company,
      phone: sup.phone,
      email: sup.email,
      address: sup.address,
      productsSupplied: sup.productsSupplied,
      outstandingBalance: sup.outstandingBalance,
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Contact representative name is required';
    if (!formData.company.trim()) errs.company = 'Company name is required';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData);
      toast.success(`Supplier "${formData.company}" updated.`, 'Record Updated');
    } else {
      addSupplier(formData);
      toast.success(`Supplier "${formData.company}" registered.`, 'Supplier Added');
    }
    setFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteSupplier(deleteTarget.id);
      toast.success(`Supplier "${deleteTarget.company}" removed.`, 'Supplier Deleted');
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    exportToCSV(
      'showroom-suppliers-directory',
      filteredSuppliers,
      [
        { key: 'id', label: 'Supplier ID' },
        { key: 'company', label: 'Company' },
        { key: 'name', label: 'Contact Person' },
        { key: 'phone', label: 'Phone' },
        { key: 'email', label: 'Email' },
        { key: 'productsSupplied', label: 'Products Supplied' },
        { key: 'outstandingBalance', label: 'Payable Balance' },
      ]
    );
    toast.info('Suppliers exported to CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Suppliers & Vendors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track procurement partners, consignment sources, and payable balances.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Add Supplier
        </Button>
      </div>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search suppliers by company, rep, product line..."
        filterOptions={[
          { label: 'All Suppliers', value: 'all' },
          { label: 'Outstanding Payables', value: 'has_balance' },
          { label: 'Zero Payables', value: 'zero_balance' },
        ]}
        selectedFilter={filter}
        onFilterChange={setFilter}
        onExport={handleExport}
        exportLabel="Export CSV"
      />

      {filteredSuppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No suppliers found"
          description="Click below to add your first parts or product vendor."
          actionLabel="Add Supplier"
          onAction={openAddModal}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Vendor & Company</th>
                  <th className="py-3.5 px-6 font-semibold">Representative</th>
                  <th className="py-3.5 px-6 font-semibold">Contact</th>
                  <th className="py-3.5 px-6 font-semibold">Products Supplied</th>
                  <th className="py-3.5 px-6 font-semibold">Payable Balance</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {sup.company}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {sup.id}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">
                      {sup.name}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-700 dark:text-slate-300">{sup.phone}</div>
                      <div className="text-[11px] text-slate-400">{sup.email}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400 max-w-[200px] truncate" title={sup.productsSupplied}>
                      {sup.productsSupplied}
                    </td>
                    <td className="py-4 px-6">
                      {Number(sup.outstandingBalance) > 0 ? (
                        <span className="font-bold text-amber-600 dark:text-amber-400">
                          {formatAmount(sup.outstandingBalance)}
                        </span>
                      ) : (
                        <Badge variant="success" size="sm">Settled</Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewSupplier(sup)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(sup)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Supplier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(sup)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Supplier"
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
            totalItems={filteredSuppliers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add / Edit Supplier Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier Record' : 'Register New Supplier'}
        subtitle="Maintain vendor contact info and goods supplied."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Apex Velocity Imports"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {formErrors.company && <p className="text-[11px] text-rose-500 mt-1">{formErrors.company}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Representative Contact *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Tariq Javed"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {formErrors.name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 300 9876543"
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
                placeholder="orders@vendor.com"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Products / Materials Supplied
            </label>
            <input
              type="text"
              value={formData.productsSupplied}
              onChange={(e) => setFormData({ ...formData, productsSupplied: e.target.value })}
              placeholder="e.g. Tyres, Wheel Sets, Brakes"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Warehouse / Port Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, Commercial Area"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Payable Balance
              </label>
              <input
                type="number"
                min="0"
                value={formData.outstandingBalance}
                onChange={(e) => setFormData({ ...formData, outstandingBalance: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setFormModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingSupplier ? 'Update Vendor' : 'Save Supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Supplier View Modal */}
      {viewSupplier && (
        <Modal
          isOpen={!!viewSupplier}
          onClose={() => setViewSupplier(null)}
          title="Supplier Information"
          subtitle={viewSupplier.company}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Vendor ID:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{viewSupplier.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Company:</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewSupplier.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Contact Person:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{viewSupplier.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{viewSupplier.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="text-slate-700 dark:text-slate-300">{viewSupplier.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Address:</span>
                <span className="text-slate-700 dark:text-slate-300">{viewSupplier.address || 'N/A'}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <span className="text-slate-400">Products:</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{viewSupplier.productsSupplied}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-400">Payables Balance:</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  {formatAmount(viewSupplier.outstandingBalance)}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setViewSupplier(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Supplier?"
        message={`Are you sure you want to remove "${deleteTarget?.company}"?`}
        confirmText="Delete Supplier"
        variant="danger"
      />
    </div>
  );
};
