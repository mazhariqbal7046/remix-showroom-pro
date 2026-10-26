import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Receipt,
  Search,
  DollarSign,
  Download,
  Eye,
  Calendar,
  CreditCard,
  User,
  ArrowRight,
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

export const SalesPage = () => {
  const { sales, customers, products, addSale, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // New Sale POS Modal
  const [posModalOpen, setPosModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [lineItems, setLineItems] = useState([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paidAmountInput, setPaidAmountInput] = useState(0);
  const [saleNotes, setSaleNotes] = useState('');

  // Selected item addition buffer
  const [bufferProductId, setBufferProductId] = useState('');
  const [bufferQuantity, setBufferQuantity] = useState(1);

  // Line calculations
  const subtotal = useMemo(() => {
    return lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [lineItems]);

  const discount = Number(discountAmount) || 0;
  const grandTotal = Math.max(0, subtotal - discount);
  const paid = Number(paidAmountInput) || 0;
  const remaining = Math.max(0, grandTotal - paid);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.customerName.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (methodFilter !== 'all' && s.paymentMethod !== methodFilter) return false;

      return true;
    });
  }, [sales, search, methodFilter]);

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, currentPage]);

  const openNewSale = () => {
    const defaultCust = customers[0]?.id || '';
    const defaultProd = products[0]?.id || '';
    setSelectedCustomerId(defaultCust);
    setSaleDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('Cash');
    setLineItems([]);
    setDiscountAmount(0);
    setPaidAmountInput(0);
    setSaleNotes('');
    setBufferProductId(defaultProd);
    setBufferQuantity(1);
    setPosModalOpen(true);
  };

  const handleAddLineItem = () => {
    const prod = products.find((p) => p.id === bufferProductId);
    if (!prod) return;

    const qty = parseInt(bufferQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      toast.warning('Please set quantity to at least 1.', 'Invalid Quantity');
      return;
    }

    if (qty > prod.quantity) {
      toast.warning(`Only ${prod.quantity} units currently available in stock.`, 'Stock Warning');
    }

    // Check if already in lineItems
    const existingIndex = lineItems.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...lineItems];
      updated[existingIndex].quantity += qty;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setLineItems(updated);
    } else {
      setLineItems([
        ...lineItems,
        {
          productId: prod.id,
          productName: prod.name,
          quantity: qty,
          unitPrice: prod.sellingPrice,
          total: qty * prod.sellingPrice,
        },
      ]);
    }

    // Reset buffer qty
    setBufferQuantity(1);
  };

  const handleRemoveLineItem = (index) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSaveSale = (e) => {
    e.preventDefault();
    if (lineItems.length === 0) {
      toast.error('Add at least one product line item to save sale.', 'Empty Order');
      return;
    }

    const cust = customers.find((c) => c.id === selectedCustomerId);

    const salePayload = {
      customerId: selectedCustomerId,
      customerName: cust ? cust.fullName : 'Walk-in Customer',
      customerPhone: cust ? cust.phone : '',
      date: saleDate,
      items: lineItems,
      subtotal,
      discount,
      total: grandTotal,
      paidAmount: paid,
      remainingBalance: remaining,
      paymentMethod,
      notes: saleNotes,
    };

    addSale(salePayload);
    toast.success(`Sale recorded! Auto-generated invoice for ${salePayload.customerName}.`, 'Sale Saved');
    setPosModalOpen(false);
  };

  const handleExport = () => {
    exportToCSV(
      'showroom-sales-history',
      filteredSales,
      [
        { key: 'invoiceNumber', label: 'Invoice #' },
        { key: 'customerName', label: 'Customer' },
        { key: 'date', label: 'Date' },
        { key: 'paymentMethod', label: 'Payment Method' },
        { key: 'total', label: 'Total Amount' },
        { key: 'paidAmount', label: 'Amount Paid' },
        { key: 'remainingBalance', label: 'Balance' },
        { key: 'status', label: 'Status' },
      ]
    );
    toast.info('Sales history exported to CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Point of Sale & Invoicing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate customer sales receipts, apply discounts, and deduct warehouse inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/invoices">
            <Button variant="secondary" icon={Receipt}>
              View All Invoices
            </Button>
          </Link>
          <Button variant="primary" icon={Plus} onClick={openNewSale}>
            Create New Sale
          </Button>
        </div>
      </div>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search sales by invoice # or customer..."
        filterOptions={[
          { label: 'All Payment Methods', value: 'all' },
          { label: 'Cash', value: 'Cash' },
          { label: 'Bank Transfer', value: 'Bank Transfer' },
          { label: 'Card', value: 'Card' },
          { label: 'Other', value: 'Other' },
        ]}
        selectedFilter={methodFilter}
        onFilterChange={setMethodFilter}
        onExport={handleExport}
        exportLabel="Export Sales"
      />

      {filteredSales.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No sales transactions recorded"
          description="Start billing your customers by creating a new sale record."
          actionLabel="Create Sale"
          onAction={openNewSale}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Invoice #</th>
                  <th className="py-3.5 px-6 font-semibold">Customer</th>
                  <th className="py-3.5 px-6 font-semibold">Sale Date</th>
                  <th className="py-3.5 px-6 font-semibold">Payment Method</th>
                  <th className="py-3.5 px-6 font-semibold">Total Amount</th>
                  <th className="py-3.5 px-6 font-semibold">Amount Paid</th>
                  <th className="py-3.5 px-6 font-semibold">Balance</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-blue-600 dark:text-blue-400">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {sale.customerName}
                      </div>
                      <span className="text-[11px] text-slate-400">{sale.customerPhone}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {formatDate(sale.date)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {formatAmount(sale.total)}
                    </td>
                    <td className="py-4 px-6 text-emerald-600 font-semibold">
                      {formatAmount(sale.paidAmount)}
                    </td>
                    <td className="py-4 px-6">
                      {Number(sale.remainingBalance) > 0 ? (
                        <span className="font-bold text-rose-600">
                          {formatAmount(sale.remainingBalance)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Nil</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getStatusBadgeVariant(sale.status)} size="sm">
                        {sale.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to="/invoices"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Print
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredSales.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Point of Sale Modal */}
      <Modal
        isOpen={posModalOpen}
        onClose={() => setPosModalOpen(false)}
        title="Point of Sale — Create Showroom Bill"
        subtitle="Select customer, add line items, calculate discount, and record receipt."
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSaveSale} className="space-y-5">
          {/* Top row: Customer & Date & Payment method */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Invoice Date
              </label>
              <input
                type="date"
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Cash">Cash Counter</option>
                <option value="Bank Transfer">Bank Transfer (Raast / Wire)</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Other">Other / Cheque</option>
              </select>
            </div>
          </div>

          {/* Line item buffer builder */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Add Products to Order
            </span>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label className="block text-[11px] text-slate-500 mb-1">Product</label>
                <select
                  value={bufferProductId}
                  onChange={(e) => setBufferProductId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatAmount(p.sellingPrice)} (Stock: {p.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-[11px] text-slate-500 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={bufferQuantity}
                  onChange={(e) => setBufferQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-center font-bold"
                />
              </div>

              <Button variant="primary" size="md" onClick={handleAddLineItem}>
                + Add Item
              </Button>
            </div>
          </div>

          {/* Added Line Items Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Item</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Qty</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Unit Price</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Total</th>
                  <th className="py-2.5 px-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {lineItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No products added yet. Select a product above and click "+ Add Item".
                    </td>
                  </tr>
                ) : (
                  lineItems.map((item, index) => (
                    <tr key={index}>
                      <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {item.productName}
                      </td>
                      <td className="py-2.5 px-4 text-center font-bold text-slate-900 dark:text-white">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-4 text-right text-slate-600 dark:text-slate-400">
                        {formatAmount(item.unitPrice)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-900 dark:text-white">
                        {formatAmount(item.total)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pricing Summary calculations */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatAmount(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Discount:</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-28 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-right font-medium"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm">
              <span className="font-bold text-slate-900 dark:text-white">Net Bill Amount:</span>
              <span className="font-extrabold text-blue-600 dark:text-blue-400">{formatAmount(grandTotal)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Customer Payment Received:</span>
              <input
                type="number"
                min="0"
                value={paidAmountInput}
                onChange={(e) => setPaidAmountInput(e.target.value)}
                className="w-32 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 rounded text-right font-bold text-emerald-600"
              />
            </div>

            <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-500">Remaining Balance Due:</span>
              <span className={`font-bold ${remaining > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {formatAmount(remaining)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Sale Notes / Raast Reference
            </label>
            <input
              type="text"
              value={saleNotes}
              onChange={(e) => setSaleNotes(e.target.value)}
              placeholder="e.g. Cleared via Raast ID 884729"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setPosModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={lineItems.length === 0}>
              Save Sale & Generate Invoice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
