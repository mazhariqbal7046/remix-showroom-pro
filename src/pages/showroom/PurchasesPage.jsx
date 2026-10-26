import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Download,
  Eye,
  Calendar,
  Building,
  DollarSign,
  PackageCheck,
  CheckCircle,
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

export const PurchasesPage = () => {
  const { purchases, suppliers, products, addPurchase, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // New Purchase Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [invoiceRef, setInvoiceRef] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [unitCost, setUnitCost] = useState(50000);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch =
        p.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        p.invoiceRef.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (supplierFilter !== 'all' && p.supplierName !== supplierFilter) return false;

      return true;
    });
  }, [purchases, search, supplierFilter]);

  const paginatedPurchases = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPurchases.slice(start, start + pageSize);
  }, [filteredPurchases, currentPage]);

  const openNewPurchase = () => {
    const sup = suppliers[0];
    const prod = products[0];
    setSelectedSupplierId(sup ? sup.id : '');
    setInvoiceRef(`REF-${Math.floor(1000 + Math.random() * 9000)}`);
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setSelectedProductId(prod ? prod.id : '');
    setUnitCost(prod ? prod.costPrice : 50000);
    setQuantity(10);
    setPaidAmount(0);
    setPaymentMethod('Bank Transfer');
    setModalOpen(true);
  };

  const handleProductSelect = (pId) => {
    setSelectedProductId(pId);
    const prod = products.find((p) => p.id === pId);
    if (prod) {
      setUnitCost(prod.costPrice);
    }
  };

  const handleSavePurchase = (e) => {
    e.preventDefault();
    const sup = suppliers.find((s) => s.id === selectedSupplierId);
    const prod = products.find((p) => p.id === selectedProductId);

    const qty = Number(quantity) || 1;
    const cost = Number(unitCost) || 0;
    const totalCost = qty * cost;
    const paid = Number(paidAmount) || 0;

    const payload = {
      supplierId: selectedSupplierId,
      supplierName: sup ? sup.company : 'Direct Supplier',
      invoiceRef: invoiceRef || `REF-${Date.now()}`,
      date: purchaseDate,
      items: [
        {
          productId: prod?.id,
          productName: prod ? prod.name : 'Procured Inventory Unit',
          quantity: qty,
          unitCost: cost,
          total: totalCost,
        },
      ],
      totalCost,
      paidAmount: paid,
      paymentMethod,
    };

    addPurchase(payload);
    toast.success(`Purchase order recorded! Stock for "${prod?.name}" increased by ${qty} units.`, 'Consignment Recorded');
    setModalOpen(false);
  };

  const handleExport = () => {
    exportToCSV(
      'showroom-purchases-log',
      filteredPurchases,
      [
        { key: 'invoiceRef', label: 'Supplier Reference' },
        { key: 'supplierName', label: 'Supplier Company' },
        { key: 'date', label: 'Consignment Date' },
        { key: 'totalCost', label: 'Total Cost' },
        { key: 'paidAmount', label: 'Paid' },
        { key: 'remainingBalance', label: 'Payables Balance' },
        { key: 'status', label: 'Status' },
      ]
    );
    toast.info('Exported purchases history to CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Procurement & Purchases
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Record supplier orders and automatically replenish inventory quantities.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openNewPurchase}>
          Record Purchase
        </Button>
      </div>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search purchases by reference or supplier..."
        filterOptions={suppliers.map((s) => ({
          label: s.company,
          value: s.company,
        }))}
        selectedFilter={supplierFilter}
        onFilterChange={setSupplierFilter}
        onExport={handleExport}
        exportLabel="Export Purchases"
      />

      {filteredPurchases.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No purchase orders found"
          description="Log consignments received from parts suppliers to keep inventory stocked."
          actionLabel="Record Purchase"
          onAction={openNewPurchase}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Invoice Ref</th>
                  <th className="py-3.5 px-6 font-semibold">Supplier</th>
                  <th className="py-3.5 px-6 font-semibold">Date</th>
                  <th className="py-3.5 px-6 font-semibold">Items & Qty</th>
                  <th className="py-3.5 px-6 font-semibold">Total Cost</th>
                  <th className="py-3.5 px-6 font-semibold">Paid Amount</th>
                  <th className="py-3.5 px-6 font-semibold">Payable Balance</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedPurchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {pur.invoiceRef}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {pur.supplierName}
                    </td>
                    <td className="py-4 px-6 text-slate-500">
                      {formatDate(pur.date)}
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300">
                      {pur.items ? pur.items.map((i, idx) => (
                        <div key={idx} className="truncate max-w-[200px]">
                          {i.productName} ({i.quantity} units)
                        </div>
                      )) : 'Consignment'}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                      {formatAmount(pur.totalCost)}
                    </td>
                    <td className="py-4 px-6 text-emerald-600 font-semibold">
                      {formatAmount(pur.paidAmount)}
                    </td>
                    <td className="py-4 px-6">
                      {Number(pur.remainingBalance) > 0 ? (
                        <span className="font-bold text-rose-600">
                          {formatAmount(pur.remainingBalance)}
                        </span>
                      ) : (
                        <span className="text-slate-400">Settled</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getStatusBadgeVariant(pur.status)} size="sm">
                        {pur.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredPurchases.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Record Purchase Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Supplier Purchase Order"
        subtitle="Replenish warehouse units and record payable invoices."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSavePurchase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Supplier *
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.company}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supplier Invoice Reference #
              </label>
              <input
                type="text"
                value={invoiceRef}
                onChange={(e) => setInvoiceRef(e.target.value)}
                placeholder="e.g. VI-9842"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Product to Replenish *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current Stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Units *
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit Purchase Cost
              </label>
              <input
                type="number"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between font-bold text-sm">
              <span>Total Consignment Cost:</span>
              <span className="text-blue-600 dark:text-blue-400">{formatAmount(Number(quantity) * Number(unitCost))}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 font-medium">Initial Amount Paid:</span>
              <input
                type="number"
                min="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-32 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded text-right font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Log Purchase & Update Stock
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
