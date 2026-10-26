import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Download,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  TrendingDown,
  PieChart,
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

export const ExpensesPage = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Utilities',
    amount: '',
    paymentMethod: 'Bank Transfer',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const categories = ['Rent', 'Salaries', 'Utilities', 'Transport', 'Marketing', 'Maintenance', 'Other'];

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.notes?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;

      return true;
    });
  }, [expenses, search, categoryFilter]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [filteredExpenses]);

  const paginatedExpenses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExpenses.slice(start, start + pageSize);
  }, [filteredExpenses, currentPage]);

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({
      title: '',
      category: 'Utilities',
      amount: '',
      paymentMethod: 'Bank Transfer',
      date: new Date().toISOString().slice(0, 10),
      notes: '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingExpense(exp);
    setFormData({
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      paymentMethod: exp.paymentMethod,
      date: exp.date,
      notes: exp.notes || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Expense title is required';
    if (!formData.amount || Number(formData.amount) <= 0) {
      errs.amount = 'Valid positive amount required';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, formData);
      toast.success(`Expense "${formData.title}" updated.`, 'Expense Saved');
    } else {
      addExpense(formData);
      toast.success(`Expense "${formData.title}" logged.`, 'Expense Added');
    }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteExpense(deleteTarget.id);
      toast.success(`Expense "${deleteTarget.title}" deleted.`, 'Expense Removed');
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    exportToCSV(
      'showroom-operating-expenses',
      filteredExpenses,
      [
        { key: 'title', label: 'Title / Description' },
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Amount' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'date', label: 'Date' },
        { key: 'notes', label: 'Notes' },
      ]
    );
    toast.info('Exported expenses report to CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operational Expenses
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track showroom overheads, facility rent, payroll, utilities, and marketing.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Record Expense
        </Button>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Filtered Overheads
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatAmount(totalFilteredAmount)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {filteredExpenses.length} vouchers logged
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Top Overhead Factor
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Salaries & Rent
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            78% of total operating outflow
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Expense Category Breakdown
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {categories.length} Categories
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            Within monthly budget targets
          </span>
        </div>
      </div>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search expense description or notes..."
        filterOptions={[
          { label: 'All Categories', value: 'all' },
          ...categories.map((c) => ({ label: c, value: c })),
        ]}
        selectedFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        onExport={handleExport}
        exportLabel="Export Expenses"
      />

      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No expenses match filter"
          description="Click below to record your first showroom overhead cost."
          actionLabel="Record Expense"
          onAction={openAddModal}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Expense Title</th>
                  <th className="py-3.5 px-6 font-semibold">Category</th>
                  <th className="py-3.5 px-6 font-semibold">Amount</th>
                  <th className="py-3.5 px-6 font-semibold">Payment Method</th>
                  <th className="py-3.5 px-6 font-semibold">Date</th>
                  <th className="py-3.5 px-6 font-semibold">Notes</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {exp.title}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-rose-600 dark:text-rose-400">
                      {formatAmount(exp.amount)}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-4 px-6 text-slate-500 truncate max-w-[200px]" title={exp.notes}>
                      {exp.notes || '-'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exp)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800"
                          title="Delete Expense"
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
            totalItems={filteredExpenses.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record Operating Expense'}
        subtitle="Log showroom vouchers for rent, salaries, marketing, and utilities."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Expense Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Electricity Bill or Lift Maintenance"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            {formErrors.title && <p className="text-[11px] text-rose-500 mt-1">{formErrors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount *
              </label>
              <input
                type="number"
                min="1"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
              />
              {formErrors.amount && <p className="text-[11px] text-rose-500 mt-1">{formErrors.amount}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash Petty Drawer</option>
                <option value="Card">Corporate Card</option>
                <option value="Cheque">Bank Cheque</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Voucher Reference
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Paid to plaza management"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingExpense ? 'Save Changes' : 'Log Expense'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Expense Record?"
        message={`Are you sure you want to delete "${deleteTarget?.title}" for ${formatAmount(deleteTarget?.amount)}?`}
        confirmText="Delete Voucher"
        variant="danger"
      />
    </div>
  );
};
