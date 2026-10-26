import React from 'react';
import {
  TrendingUp,
  DollarSign,
  CreditCard,
  Download,
  Calendar,
  Sparkles,
  PieChart,
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

export const AdminRevenuePage = () => {
  const { adminShowrooms, formatAmount } = useApp();
  const { toast } = useToast();

  const subscribedShowrooms = adminShowrooms.filter((showroom) => ['Active', 'Expiring Soon'].includes(showroom.status)).length;
  const totalMRR = subscribedShowrooms * 10000;
  const arr = totalMRR * 12;

  const monthlyRevenueTrend = [
    { month: 'May 2026', revenue: 98000 },
    { month: 'Jun 2026', revenue: 133000 },
    { month: 'Jul 2026', revenue: 168000 },
    { month: 'Aug 2026', revenue: 182000 },
    { month: 'Sep 2026', revenue: 203000 },
    { month: 'Oct 2026', revenue: totalMRR },
  ];

  const planRevenueBreakdown = [
    { name: 'Showroom Pro · Rs. 10,000/month', value: totalMRR, color: '#185df1' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Platform Revenue Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            SaaS subscription revenue from the single Rs. 10,000 monthly plan.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          icon={Download}
          onClick={() => toast.info('Exported simulated revenue report.', 'Downloaded')}
        >
          Export Revenue Report
        </Button>
      </div>

      {/* 4 Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Monthly Recurring Revenue (MRR)
          </span>
          <div className="text-2xl font-black text-white mt-1">
            {formatAmount(totalMRR)}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">↑ +18.2% vs Sep 2026</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Annual Run-Rate (ARR)
          </span>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            {formatAmount(arr)}
          </div>
          <span className="text-[11px] text-slate-400">Projected 12-month billing</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Average Revenue Per Showroom
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {formatAmount(totalMRR / (adminShowrooms.length || 1))}
          </div>
          <span className="text-[11px] text-slate-400">Blended ARPU</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Subscription Churn Rate
          </span>
          <div className="text-2xl font-black text-white mt-1">
            0.8%
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Industry leading retention</span>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Monthly Subscription Revenue Trend</h3>
            <p className="text-xs text-slate-400">Historical subscription revenue</p>
          </div>
          <Badge variant="indigo" size="sm">Simulated MRR</Badge>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyRevenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v) => [formatAmount(v), 'Revenue']}
                contentStyle={{ backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tier Revenue Shares */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Revenue from the Single Plan</h3>
            <p className="text-xs text-slate-400 mb-4">Every subscribed showroom pays the same monthly rate.</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPie>
                  <Pie
                    data={planRevenueBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {planRevenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => [formatAmount(v), 'Contribution']}
                    contentStyle={{ backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #1e293b', color: '#fff', fontSize: '11px' }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-4 border-t border-slate-800">
            {planRevenueBreakdown.map((p, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-300">{p.name}</span>
                </div>
                <span className="font-bold text-white">{formatAmount(p.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-base font-bold text-white mb-1">Showroom Pro Subscription</h3>
          <p className="text-xs text-slate-400 mb-4">All features and unlimited partner accounts are included.</p>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
              <div>
                <span className="font-bold text-white">One plan · Unlimited partner accounts</span>
                <p className="text-[11px] text-slate-400">Same monthly rate for every showroom</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-blue-400">Rs. 10,000 / mo</span>
                <span className="block text-[10px] text-slate-400">{subscribedShowrooms} Subscribed Showrooms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
