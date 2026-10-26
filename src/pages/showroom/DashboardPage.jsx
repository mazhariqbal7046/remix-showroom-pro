import React from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  Package,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight,
  Receipt,
  Boxes,
  Plus,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

export const DashboardPage = () => {
  const {
    showroomInfo,
    activePlan,
    subscription,
    partnerLimitInfo,
    dashboardStats,
    sales,
    customers,
    products,
    expenses,
    bookings,
    financials,
    bookingStats,
    formatAmount,
  } = useApp();

  // Monthly Sales Chart Data
  const salesChartData = (() => {
    const months = [...new Set(sales.map((sale) => sale.date?.slice(0, 7)).filter(Boolean))].sort().slice(-6);
    return (months.length ? months : [new Date().toISOString().slice(0, 7)]).map((period) => {
      const monthSales = sales.filter((sale) => sale.date?.startsWith(period)).reduce((sum, sale) => sum + Number(sale.total || 0), 0);
      const monthExpenses = expenses.filter((expense) => expense.date?.startsWith(period)).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      return { month: period, sales: monthSales, profit: monthSales - monthExpenses };
    });
  })();

  // Category Distribution Data
  const categoryColors = ['#2563eb', '#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'];
  const categoryData = Object.entries(products.reduce((groups, product) => {
    const key = product.category || 'Other';
    groups[key] = (groups[key] || 0) + Number(product.costPrice || 0) * Number(product.quantity || 0);
    return groups;
  }, {})).map(([name, value], index) => ({ name, value, color: categoryColors[index % categoryColors.length] })).sort((a, b) => b.value - a.value).slice(0, 6);

  const lowStockItems = products.filter(p => p.quantity <= p.minStockThreshold);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Showroom Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time key performance indicators, sales volume, and partner capacity for <span className="font-semibold text-slate-700 dark:text-slate-300">{showroomInfo.name}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/sales">
            <Button variant="primary" size="md" icon={Plus}>
              New Sale / POS
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="secondary" size="md">
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Subscription & Partner Status Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
            <Sparkles className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white">{activePlan.name}</span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold uppercase">
                {subscription.status}
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-1">
              Partner Quota:{' '}
              <span className="font-bold text-white">
                {partnerLimitInfo.isUnlimited
                  ? `${partnerLimitInfo.count} Partners (Unlimited Plan)`
                  : `${partnerLimitInfo.count} of ${partnerLimitInfo.limit} slots used`}
              </span>
              {' '}— Next renewal on <span className="text-white font-medium">{formatDate(subscription.renewalDate)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
          <Link to="/partners">
            <button className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-colors">
              Manage Partners
            </button>
          </Link>
          <Link to="/subscription">
            <button className="px-3.5 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold shadow-xs transition-colors">
              Upgrade Subscription
            </button>
          </Link>
        </div>
      </div>

      {/* 6 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Sales */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Sales</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {formatAmount(dashboardStats.totalSales)}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs last period</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Customers</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {dashboardStats.totalCustomers}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
            <span>Enrolled in directory</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Products</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {dashboardStats.totalProducts}
          </div>
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500">
            <span>Catalog SKUs</span>
          </div>
        </div>

        {/* Stock Valuation */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Stock Valuation</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white truncate" title={formatAmount(dashboardStats.totalStockCostValue)}>
            {formatAmount(dashboardStats.totalStockCostValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Cost base inventory
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {formatAmount(dashboardStats.totalExpenses)}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
            Rent, Salaries & Ops
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatAmount(dashboardStats.netProfit)}
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1 font-medium">
            Revenue minus expenses
          </div>
        </div>

        {/* Pending Bookings */}
        <Link to="/bookings" className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-blue-200 dark:border-blue-900 shadow-xs hover:border-blue-400 transition-colors">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Bookings</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-3">{bookingStats.pending}</div>
          <div className="text-[11px] text-slate-500 mt-1">Reserved EV units</div>
        </Link>
        {/* Unpaid balances */}
        <Link to="/business-reports" className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900 shadow-xs hover:border-amber-400 transition-colors">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Booking Receivables</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-3">{formatAmount(bookingStats.outstanding)}</div>
          <div className="text-[11px] text-slate-500 mt-1">Customer balances</div>
        </Link>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Overview Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Sales Volume & Operating Profit
              </h3>
              <p className="text-xs text-slate-500">6-Month historical performance trajectory</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                Sales
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                Profit
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value) => [formatAmount(value), '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Valuation by Category Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Inventory Category Share
            </h3>
            <p className="text-xs text-slate-500 mb-4">Stock capital allocation</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatAmount(val), 'Value']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 mt-2 text-xs">
            {categoryData.slice(0, 4).map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{c.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{formatAmount(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sales Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Sales Transactions
              </h3>
              <p className="text-xs text-slate-500">Invoices generated through showroom POS</p>
            </div>
            <Link to="/sales">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View all sales →
              </span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5 font-semibold">Invoice #</th>
                  <th className="py-3 px-5 font-semibold">Customer</th>
                  <th className="py-3 px-5 font-semibold">Date</th>
                  <th className="py-3 px-5 font-semibold">Total</th>
                  <th className="py-3 px-5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sales.slice(0, 4).map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-5 font-medium text-blue-600 dark:text-blue-400">
                      {sale.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-slate-800 dark:text-slate-200">
                      {sale.customerName}
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      {formatDate(sale.date)}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-900 dark:text-white">
                      {formatAmount(sale.total)}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={getStatusBadgeVariant(sale.status)} size="sm">
                        {sale.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert Sidebar Card (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Low Stock Attention
                </h3>
              </div>
              <Badge variant="warning" size="sm">
                {lowStockItems.length} Warnings
              </Badge>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Products below their designated minimum threshold:
            </p>

            <div className="space-y-3">
              {lowStockItems.map((prod) => (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div className="pr-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[170px]" title={prod.name}>
                      {prod.name}
                    </p>
                    <span className="text-[10px] text-slate-400">SKU: {prod.sku}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`font-bold ${prod.quantity === 0 ? 'text-rose-600' : 'text-amber-600'}`}>
                      {prod.quantity === 0 ? 'Out of Stock' : `${prod.quantity} Left`}
                    </span>
                    <p className="text-[10px] text-slate-400">Min: {prod.minStockThreshold}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Link to="/inventory" className="mt-4 block">
            <Button variant="secondary" size="sm" className="w-full">
              Manage Inventory Reorders →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
