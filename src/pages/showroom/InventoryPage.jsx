import React, { useState, useMemo } from 'react';
import {
  Boxes,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowUpDown,
  SlidersHorizontal,
  PackagePlus,
  RefreshCw,
  Search,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { exportToCSV } from '../../utils/formatters';

export const InventoryPage = () => {
  const { products, updateProduct, dashboardStats, bookingStats, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'low' | 'out' | 'in_stock'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Stock Adjustment Modal
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Stock Count Reconciliation');
  const reservationByProduct = bookingStats?.reservedByProduct || {};

  const filteredInventory = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (stockFilter === 'low') return p.quantity > 0 && p.quantity <= p.minStockThreshold;
      if (stockFilter === 'out') return p.quantity <= 0;
      if (stockFilter === 'in_stock') return p.quantity > p.minStockThreshold;

      return true;
    });
  }, [products, search, stockFilter]);

  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInventory.slice(start, start + pageSize);
  }, [filteredInventory, currentPage]);

  const openAdjustModal = (product) => {
    setAdjustTarget(product);
    setAdjustQty(String(product.quantity));
    setAdjustReason('Physical Count Verification');
  };

  const handleAdjustSubmit = (e) => {
    e.preventDefault();
    const newQty = parseInt(adjustQty, 10);
    if (isNaN(newQty) || newQty < 0) {
      toast.error('Stock quantity cannot be negative or invalid.', 'Invalid Quantity');
      return;
    }

    updateProduct(adjustTarget.id, { quantity: newQty });
    toast.success(`Inventory for "${adjustTarget.name}" adjusted to ${newQty} units.`, 'Stock Updated');
    setAdjustTarget(null);
  };

  const handleExport = () => {
    exportToCSV(
      'showroom-inventory-valuation',
      filteredInventory,
      [
        { key: 'id', label: 'Product ID' },
        { key: 'name', label: 'Item' },
        { key: 'sku', label: 'SKU' },
        { key: 'quantity', label: 'Current Units' },
        { key: 'minStockThreshold', label: 'Threshold' },
        { key: 'costPrice', label: 'Cost Unit Price' },
        { key: 'sellingPrice', label: 'Retail Price' },
      ]
    );
    toast.info('Inventory valuation exported to CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Inventory & Stock Valuations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time showroom warehouse levels, reorder alerts, and capital valuations.
          </p>
        </div>
      </div>

      {/* 4 Inventory Valuation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Stock Cost Value</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {formatAmount(dashboardStats.totalStockCostValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Working capital tied in warehouse
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Retail Sales Potential</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatAmount(dashboardStats.totalStockRetailValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Projected gross revenue value
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Low Stock Warnings</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {dashboardStats.lowStockCount} Products
          </div>
          <div className="text-[11px] text-amber-600 mt-1">
            Approaching reorder minimum
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {dashboardStats.outOfStockCount} Products
          </div>
          <div className="text-[11px] text-rose-600 mt-1">
            Immediate supplier PO needed
          </div>
        </div>
      </div>

      {/* Search and Stock Level Filter */}
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Filter by title, SKU, or category..."
        filterOptions={[
          { label: 'All Inventory Levels', value: 'all' },
          { label: 'Low Stock Warnings', value: 'low' },
          { label: 'Out of Stock Only', value: 'out' },
          { label: 'Adequate Stock Level', value: 'in_stock' },
        ]}
        selectedFilter={stockFilter}
        onFilterChange={setStockFilter}
        onExport={handleExport}
        exportLabel="Export Valuations"
      />

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Product & SKU</th>
                <th className="py-3.5 px-6 font-semibold">Stock Quantity</th>
                <th className="py-3.5 px-6 font-semibold">Reserved / Available</th>
                <th className="py-3.5 px-6 font-semibold">Min Threshold</th>
                <th className="py-3.5 px-6 font-semibold">Stock Status</th>
                <th className="py-3.5 px-6 font-semibold">Total Cost Value</th>
                <th className="py-3.5 px-6 font-semibold">Total Retail Value</th>
                <th className="py-3.5 px-6 font-semibold text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedInventory.map((item) => {
                const isOut = item.quantity <= 0;
                const isLow = !isOut && item.quantity <= item.minStockThreshold;
                const status = isOut ? 'Out of Stock' : (isLow ? 'Low Stock' : 'In Stock');
                const costVal = item.costPrice * item.quantity;
                const retailVal = item.sellingPrice * item.quantity;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {item.name}
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {item.sku}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-amber-600">{reservationByProduct[item.id] || 0} reserved</span>
                      <span className="block text-[10px] text-slate-500">{Math.max(0, Number(item.quantity || 0) - Number(reservationByProduct[item.id] || 0))} available</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-base font-bold ${
                        isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'
                      }`}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {item.minStockThreshold} units
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={getStatusBadgeVariant(status)} size="sm">
                        {status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-300">
                      {formatAmount(costVal)}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900 dark:text-white">
                      {formatAmount(retailVal)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={ArrowUpDown}
                        onClick={() => openAdjustModal(item)}
                      >
                        Adjust Qty
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredInventory.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Adjust Stock Quantity Modal */}
      {adjustTarget && (
        <Modal
          isOpen={!!adjustTarget}
          onClose={() => setAdjustTarget(null)}
          title="Adjust Inventory Quantity"
          subtitle={`Product: ${adjustTarget.name} (${adjustTarget.sku})`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs flex justify-between">
              <span className="text-slate-400">Current Stock in System:</span>
              <span className="font-bold text-slate-900 dark:text-white">{adjustTarget.quantity} units</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Cannot be negative.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason for Adjustment
              </label>
              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Physical Count Verification">Physical Count Verification</option>
                <option value="Damaged / Written Off">Damaged / Written Off</option>
                <option value="Supplier Return">Supplier Return</option>
                <option value="Showroom Display Unit Conversion">Showroom Display Unit Conversion</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" onClick={() => setAdjustTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Update Stock
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
