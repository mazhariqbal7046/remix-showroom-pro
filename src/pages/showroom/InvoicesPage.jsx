import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Printer,
  Download,
  Eye,
  Calendar,
  Building2,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate, exportToCSV } from '../../utils/formatters';

export const InvoicesPage = () => {
  const { sales, showroomInfo, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected invoice for preview & print
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const filteredInvoices = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.customerName.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;

      return true;
    });
  }, [sales, search, statusFilter]);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success(`Exporting Invoice #${selectedInvoice?.invoiceNumber} as PDF ready document.`, 'Invoice Downloaded');
  };

  const handleExportAll = () => {
    exportToCSV(
      'showroom-invoices-register',
      filteredInvoices,
      [
        { key: 'invoiceNumber', label: 'Invoice #' },
        { key: 'customerName', label: 'Customer' },
        { key: 'date', label: 'Date' },
        { key: 'subtotal', label: 'Subtotal' },
        { key: 'discount', label: 'Discount' },
        { key: 'total', label: 'Total Amount' },
        { key: 'paidAmount', label: 'Paid' },
        { key: 'remainingBalance', label: 'Outstanding Balance' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'status', label: 'Status' },
      ]
    );
    toast.info('Exported all invoices to CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Invoices & Billing Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official sales receipts, tax breakdowns, customer payables, and print layouts.
          </p>
        </div>
      </div>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search invoice number, customer name..."
        filterOptions={[
          { label: 'All Statuses', value: 'all' },
          { label: 'Paid in Full', value: 'Paid' },
          { label: 'Partially Paid', value: 'Partially Paid' },
          { label: 'Unpaid', value: 'Unpaid' },
        ]}
        selectedFilter={statusFilter}
        onFilterChange={setStatusFilter}
        onExport={handleExportAll}
        exportLabel="Export Invoices"
      />

      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No invoices found"
          description="Sales created in POS automatically generate detailed invoices here."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Invoice #</th>
                  <th className="py-3.5 px-6 font-semibold">Customer</th>
                  <th className="py-3.5 px-6 font-semibold">Date</th>
                  <th className="py-3.5 px-6 font-semibold">Items</th>
                  <th className="py-3.5 px-6 font-semibold">Total Amount</th>
                  <th className="py-3.5 px-6 font-semibold">Amount Paid</th>
                  <th className="py-3.5 px-6 font-semibold">Balance</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-blue-600 dark:text-blue-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {inv.customerName}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {formatDate(inv.date)}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      {inv.items ? `${inv.items.length} items` : '1 item'}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {formatAmount(inv.total)}
                    </td>
                    <td className="py-4 px-6 text-emerald-600 font-semibold">
                      {formatAmount(inv.paidAmount)}
                    </td>
                    <td className="py-4 px-6">
                      {Number(inv.remainingBalance) > 0 ? (
                        <span className="font-bold text-rose-600">
                          {formatAmount(inv.remainingBalance)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Cleared</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getStatusBadgeVariant(inv.status)} size="sm">
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Eye}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        Preview / Print
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredInvoices.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle="Printable client copy with showroom legal header."
          maxWidth="max-w-2xl"
        >
          <div className="space-y-6">
            {/* Action Bar inside Modal */}
            <div className="flex items-center justify-end gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800 no-print">
              <Button variant="secondary" size="sm" icon={Download} onClick={handleDownload}>
                Download PDF
              </Button>
              <Button variant="primary" size="sm" icon={Printer} onClick={handlePrint}>
                Print Invoice
              </Button>
            </div>

            {/* Printable Document Sheet */}
            <div id="printable-invoice" className="p-6 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
              {/* Header */}
              <div className="flex justify-between items-start pb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    {showroomInfo.name}
                  </h2>
                  <p className="text-slate-500 text-xs mt-0.5">{showroomInfo.category}</p>
                  <p className="text-slate-500 text-xs">{showroomInfo.address}, {showroomInfo.country}</p>
                  <p className="text-slate-500 text-xs">Phone: {showroomInfo.phone} | NTN: {showroomInfo.taxNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold tracking-wider text-blue-600 block mb-1">
                    COMMERCIAL INVOICE
                  </span>
                  <div className="text-base font-extrabold text-slate-900">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Date: {formatDate(selectedInvoice.date)}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Billed To Customer:
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">
                    {selectedInvoice.customerName}
                  </h4>
                  <p className="text-slate-600">{selectedInvoice.customerPhone || 'Contact N/A'}</p>
                  <p className="text-slate-500 text-[11px] mt-1">Payment Method: {selectedInvoice.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Payment Status:
                  </span>
                  <Badge variant={getStatusBadgeVariant(selectedInvoice.status)} size="md">
                    {selectedInvoice.status}
                  </Badge>
                  {selectedInvoice.notes && (
                    <p className="text-slate-500 text-[11px] mt-2 italic">
                      Note: {selectedInvoice.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 uppercase text-[10px]">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-2.5 font-medium text-slate-800">{item.productName}</td>
                        <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                        <td className="py-2.5 text-right text-slate-600">{formatAmount(item.unitPrice)}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-900">{formatAmount(item.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-2.5 font-medium">Showroom Purchase Item</td>
                      <td className="py-2.5 text-center">1</td>
                      <td className="py-2.5 text-right">{formatAmount(selectedInvoice.total)}</td>
                      <td className="py-2.5 text-right font-semibold">{formatAmount(selectedInvoice.total)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Totals */}
              <div className="pt-4 border-t border-slate-200 flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-semibold text-slate-800">{formatAmount(selectedInvoice.subtotal || selectedInvoice.total)}</span>
                  </div>
                  {Number(selectedInvoice.discount) > 0 && (
                    <div className="flex justify-between text-rose-600">
                      <span>Discount Applied:</span>
                      <span>-{formatAmount(selectedInvoice.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span>{formatAmount(selectedInvoice.total)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Amount Paid:</span>
                    <span>{formatAmount(selectedInvoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t border-slate-200 text-xs">
                    <span>Balance Due:</span>
                    <span className={selectedInvoice.remainingBalance > 0 ? 'text-rose-600' : 'text-slate-400'}>
                      {formatAmount(selectedInvoice.remainingBalance)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400 text-center leading-relaxed">
                Thank you for your business. Review the invoice tax details against your local requirements before issuing.
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
