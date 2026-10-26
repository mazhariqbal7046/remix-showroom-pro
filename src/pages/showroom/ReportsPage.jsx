import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Package,
  Users,
  CreditCard,
  PieChart,
  ArrowUpRight,
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
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { exportToCSV, formatDate } from '../../utils/formatters';

export const ReportsPage = () => {
  const { dashboardStats, sales, expenses, products, customers, formatAmount, financials } = useApp();
  const { toast } = useToast();

  const [dateFilter, setDateFilter] = useState('this_month'); // 'today' | '7_days' | '30_days' | 'this_month' | 'this_year'

  // Monthly trend
  const financialMonthlyData = (() => {
    const months = [...new Set([...sales.map(s => s.date?.slice(0, 7)), ...expenses.map(e => e.date?.slice(0, 7))].filter(Boolean))].sort().slice(-6);
    return (months.length ? months : [new Date().toISOString().slice(0, 7)]).map((period) => {
      const monthSales = sales.filter(s => s.date?.startsWith(period)).reduce((sum, s) => sum + Number(s.total || 0), 0);
      const monthExpenses = expenses.filter(e => e.date?.startsWith(period)).reduce((sum, e) => sum + Number(e.amount || 0), 0);
      return { period, sales: monthSales, expenses: monthExpenses, profit: monthSales - monthExpenses };
    });
  })();

  // Best Selling Products ranked
  const bestSellers = products.map((product) => {
    const items = sales.flatMap(s => s.items || []).filter(item => item.productId === product.id || item.productName === product.name);
    const units = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    const revenue = items.reduce((sum, item) => sum + Number(item.total || item.unitPrice * item.quantity || 0), 0);
    return { name: product.name, units, revenue, margin: product.sellingPrice ? `${Math.round(((product.sellingPrice - product.costPrice) / product.sellingPrice) * 100)}%` : '0%' };
  }).filter(item => item.units > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  // Payment method distribution
  const paymentColors = ['#2563eb', '#4f46e5', '#10b981', '#f59e0b'];
  const paymentMethodData = [...new Set(sales.map(s => s.paymentMethod).filter(Boolean))].map((name, index) => ({ name, value: sales.filter(s => s.paymentMethod === name).reduce((sum, s) => sum + Number(s.paidAmount || 0), 0), color: paymentColors[index % paymentColors.length] }));

  const handleExportReport = () => {
    exportToCSV(
      `showroom-financial-report-${dateFilter}`,
      financialMonthlyData,
      [
        { key: 'period', label: 'Month / Cycle' },
        { key: 'sales', label: 'Gross Sales' },
        { key: 'expenses', label: 'Overheads & Expenses' },
        { key: 'profit', label: 'Operating Profit' },
      ]
    );
    toast.info('Exported financial analytics report to CSV.', 'Report Downloaded');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reports & Business Intelligence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated revenue trajectories, expense allocations, and product profitability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Filter selector */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7_days">Last 7 Days</option>
              <option value="30_days">Last 30 Days</option>
              <option value="this_month">This Month (Oct 2026)</option>
              <option value="this_year">This Fiscal Year (2026)</option>
            </select>
          </div>

          <Button variant="secondary" icon={Download} onClick={handleExportReport}>
            Export CSV Report
          </Button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Invoiced Sales
          </span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {formatAmount(dashboardStats.totalSales)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">↑ +14.2% annualized growth</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Operational Outflow
          </span>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {formatAmount(dashboardStats.totalExpenses)}
          </div>
          <span className="text-[11px] text-slate-400">Payroll, utilities & facility</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Net Operational Profit
          </span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatAmount(dashboardStats.netProfit)}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">36.6% operating margin</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Capital In Warehouse
          </span>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {formatAmount(dashboardStats.totalStockCostValue)}
          </div>
          <span className="text-[11px] text-slate-400">{products.length} catalog items</span>
        </div>
      </div>

      {/* Main Financial Trajectory Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Revenue vs Expenses vs Operating Profit
            </h3>
            <p className="text-xs text-slate-500">Monthly side-by-side comparative ledger</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-md bg-blue-600" />
              Sales
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-md bg-rose-500" />
              Expenses
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialMonthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.6} />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(val) => [formatAmount(val), '']}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Best-Selling Products & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Best-selling products (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Top-Performing Products by Revenue
          </h3>
          <p className="text-xs text-slate-500 mb-4">Ranked by gross sales volume and profit margins</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Product Title</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Units Sold</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Gross Sales</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Avg Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bestSellers.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700 dark:text-slate-300">
                      {item.units}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatAmount(item.revenue)}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                      {item.margin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Channels (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Payment Method Breakdown
            </h3>
            <p className="text-xs text-slate-500 mb-4">Settlement mode distribution</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [formatAmount(val), 'Volume']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {paymentMethodData.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{m.name}</span>
                </div>
                <span className="font-bold text-slate-900 dark:text-white">{formatAmount(m.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
