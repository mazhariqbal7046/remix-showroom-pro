import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit2,
  Trash2,
  Tag,
  AlertTriangle,
  Boxes,
  Barcode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { exportToCSV } from '../../utils/formatters';

export const ProductsPage = () => {
  const { products, suppliers, addProduct, updateProduct, deleteProduct, formatAmount } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Tyres & Wheels',
    brand: '',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    minStockThreshold: 3,
    supplier: '',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(set)];
  }, [products]);

  // Filtered & Searched Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search)) ||
        p.brand.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;

      return true;
    });
  }, [products, search, categoryFilter]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const getStockStatus = (prod) => {
    if (prod.quantity <= 0) return 'Out of Stock';
    if (prod.quantity <= prod.minStockThreshold) return 'Low Stock';
    return 'In Stock';
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `890123456${Math.floor(1000 + Math.random() * 9000)}`,
      category: 'Tyres & Wheels',
      brand: '',
      costPrice: '',
      sellingPrice: '',
      quantity: '',
      minStockThreshold: 3,
      supplier: suppliers[0]?.company || 'Direct Import',
      description: '',
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode || '',
      category: prod.category,
      brand: prod.brand,
      costPrice: prod.costPrice,
      sellingPrice: prod.sellingPrice,
      quantity: prod.quantity,
      minStockThreshold: prod.minStockThreshold,
      supplier: prod.supplier,
      description: prod.description || '',
    });
    setFormErrors({});
    setFormModalOpen(true);
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Product title is required';
    if (!formData.sku.trim()) errs.sku = 'SKU is required';
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) {
      errs.sellingPrice = 'Valid selling price required';
    }
    if (formData.quantity === '' || Number(formData.quantity) < 0) {
      errs.quantity = 'Quantity cannot be negative';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      toast.success(`Updated "${formData.name}".`, 'Product Saved');
    } else {
      addProduct(formData);
      toast.success(`Added "${formData.name}" to catalog.`, 'Product Created');
    }
    setFormModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteProduct(deleteTarget.id);
      toast.success(`Product "${deleteTarget.name}" deleted.`, 'Product Removed');
      setDeleteTarget(null);
    }
  };

  const handleExport = () => {
    exportToCSV(
      'showroom-products-catalog',
      filteredProducts,
      [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Product Name' },
        { key: 'sku', label: 'SKU' },
        { key: 'barcode', label: 'Barcode' },
        { key: 'category', label: 'Category' },
        { key: 'brand', label: 'Brand' },
        { key: 'costPrice', label: 'Cost Price' },
        { key: 'sellingPrice', label: 'Selling Price' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'minStockThreshold', label: 'Min Threshold' },
        { key: 'supplier', label: 'Supplier' },
      ]
    );
    toast.info('Exported products catalog to CSV.', 'Export Complete');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Product Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain item specifications, barcodes, margins, and stock parameters.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={openAddModal}>
          Add Product
        </Button>
      </div>

      {/* Search & Filter */}
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Search by product name, SKU, barcode, or brand..."
        filterOptions={categories.map((c) => ({
          label: c === 'all' ? 'All Categories' : c,
          value: c,
        }))}
        selectedFilter={categoryFilter}
        onFilterChange={setCategoryFilter}
        onExport={handleExport}
        exportLabel="Export Catalog"
      />

      {/* Products Table */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try selecting another category or click below to register a new product."
          actionLabel="Add Product"
          onAction={openAddModal}
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Item & Brand</th>
                  <th className="py-3.5 px-6 font-semibold">Category & SKU</th>
                  <th className="py-3.5 px-6 font-semibold">Cost Price</th>
                  <th className="py-3.5 px-6 font-semibold">Selling Price</th>
                  <th className="py-3.5 px-6 font-semibold">Stock Qty</th>
                  <th className="py-3.5 px-6 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedProducts.map((prod) => {
                  const status = getStockStatus(prod);
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {prod.name}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Brand: {prod.brand || 'Unbranded'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-700 dark:text-slate-300 font-medium mb-1">
                          {prod.category}
                        </span>
                        <div className="font-mono text-[11px] text-slate-400">
                          {prod.sku}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">
                        {formatAmount(prod.costPrice)}
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                        {formatAmount(prod.sellingPrice)}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {prod.quantity}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">
                          (min: {prod.minStockThreshold})
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={getStatusBadgeVariant(status)} size="sm">
                          {status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewProduct(prod)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Product Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(prod)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingProduct ? 'Edit Product Item' : 'Add New Product to Inventory'}
        subtitle="Specify SKU, pricing, margins, and reorder levels."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Product Title *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Brembo Ceramic Brake Kit"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {formErrors.name && <p className="text-[11px] text-rose-500 mt-1">{formErrors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                SKU Code *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-1001"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
              {formErrors.sku && <p className="text-[11px] text-rose-500 mt-1">{formErrors.sku}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Barcode (EAN/UPC)
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                placeholder="890123456..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Brembo, Pioneer"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Tyres, Audio, Accessories"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supplier
              </label>
              <select
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.company}>
                    {s.company}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cost Price
              </label>
              <input
                type="number"
                min="0"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Selling Price *
              </label>
              <input
                type="number"
                min="0"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {formErrors.sellingPrice && <p className="text-[11px] text-rose-500 mt-1">{formErrors.sellingPrice}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Initial Stock *
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {formErrors.quantity && <p className="text-[11px] text-rose-500 mt-1">{formErrors.quantity}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Min Stock Alert
              </label>
              <input
                type="number"
                min="1"
                value={formData.minStockThreshold}
                onChange={(e) => setFormData({ ...formData, minStockThreshold: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical specs, compatibility, warranty info..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setFormModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? 'Save Changes' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Product Detail Modal */}
      {viewProduct && (
        <Modal
          isOpen={!!viewProduct}
          onClose={() => setViewProduct(null)}
          title="Product Specifications"
          subtitle={`SKU: ${viewProduct.sku}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Barcode:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{viewProduct.barcode || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Brand:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{viewProduct.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{viewProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Supplier:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{viewProduct.supplier}</span>
              </div>
              {(viewProduct.category === 'EV Bikes' || viewProduct.batteryCapacity) && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-2">EV bike specifications:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Spec label="Model" value={viewProduct.model} />
                    <Spec label="Top speed" value={viewProduct.topSpeed} />
                    <Spec label="Motor" value={viewProduct.motorPower} />
                    <Spec label="Battery" value={`${viewProduct.batteryType || ''} ${viewProduct.batteryCapacity || ''}`.trim()} />
                    <Spec label="Range" value={viewProduct.rangeKm ? `${viewProduct.rangeKm} km` : ''} />
                    <Spec label="Charging" value={viewProduct.chargingTime} />
                    <Spec label="Color" value={viewProduct.color} />
                    <Spec label="Warranty" value={viewProduct.warranty} />
                  </div>
                </div>
              )}
              {viewProduct.description && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block mb-1">Description:</span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{viewProduct.description}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Cost</span>
                <div className="font-bold text-slate-700 dark:text-slate-300 mt-1">{formatAmount(viewProduct.costPrice)}</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Selling</span>
                <div className="font-bold text-emerald-600 mt-1">{formatAmount(viewProduct.sellingPrice)}</div>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase">Margin</span>
                <div className="font-bold text-blue-600 mt-1">
                  {formatAmount(viewProduct.sellingPrice - viewProduct.costPrice)}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setViewProduct(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product?"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from your catalog?`}
        confirmText="Delete Product"
        variant="danger"
      />
    </div>
  );
};

const Spec = ({ label, value }) => (
  <div>
    <span className="text-[10px] text-slate-400 uppercase">{label}</span>
    <div className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{value || 'Not specified'}</div>
  </div>
);
