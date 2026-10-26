import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  DollarSign,
  CreditCard,
  ShieldAlert,
  Server,
  Users,
  ArrowUpRight,
  Sparkles,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
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

export const AdminOverviewPage = () => {
  const { adminShowrooms, adminPayments, adminLogs, formatAmount, fetchAdminMetrics } = useApp();
  const [liveMetrics, setLiveMetrics] = useState(null);
  useEffect(() => { fetchAdminMetrics().then((result) => { if (!result.error) setLiveMetrics(result.data); }); }, []);

  const totalShowrooms = liveMetrics?.signup_count ?? adminShowrooms.length;
  const activeCount = liveMetrics?.active_showrooms ?? adminShowrooms.filter(s => s.status === 'Active').length;
  const trialCount = adminShowrooms.filter(s => s.status === 'Trial').length;
  const suspendedCount = adminShowrooms.filter(s => s.status === 'Suspended').length;

  const totalMRR = liveMetrics?.mrr ?? adminShowrooms.reduce((sum, s) => sum + (Number(s.mrr) || 0), 0);
  const totalPaidRevenue = adminPayments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const mrrGrowthData = [
    { month: 'Jun', mrr: 120000, showrooms: 4 },
    { month: 'Jul', mrr: 155000, showrooms: 5 },
    { month: 'Aug', mrr: 194000, showrooms: 5 },
    { month: 'Sep', mrr: 229000, showrooms: 6 },
    { month: 'Oct', mrr: totalMRR, showrooms: totalShowrooms },
  ];

  const planDistribution = [
    { name: 'Basic (Max 2)', count: adminShowrooms.filter(s => s.plan === 'basic').length, color: '#3b82f6' },
    { name: 'Business (Max 6)', count: adminShowrooms.filter(s => s.plan === 'business').length, color: '#6366f1' },
    { name: 'Enterprise (Unlim)', count: adminShowrooms.filter(s => s.plan === 'enterprise').length, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Super Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Super Admin SaaS Overview
            </h1>
            <Badge variant="indigo" size="sm">Platform Owner View</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Global metrics across all registered tenant showrooms and subscription billing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/super-admin/showrooms">
            <Button variant="primary" size="md">
              Manage Tenants
            </Button>
          </Link>
          <Link to="/super-admin/plans">
            <Button variant="secondary" size="md">
              Configure Plans
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Key Platform Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Showrooms</div>
          <div className="text-2xl font-black text-white mt-1">{totalShowrooms}</div>
          <div className="text-[11px] text-blue-400 mt-1">+2 new this month</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Monthly Run-Rate (MRR)</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{formatAmount(totalMRR)}</div>
          <div className="text-[11px] text-emerald-500 mt-1">↑ +24.8% growth</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Paid Tenants</div>
          <div className="text-2xl font-black text-white mt-1">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">{trialCount} active trial</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cumulative Revenue</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{formatAmount(totalPaidRevenue)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Settled subscriptions</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform Uptime</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">99.98%</div>
          <div className="text-[11px] text-emerald-500 mt-1">Zero downtime SLA</div>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Suspended Tenants</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{suspendedCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Non-payment flags</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MRR Growth Trajectory */}
        <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Recurring Revenue Growth (MRR)</h3>
              <p className="text-xs text-slate-400">Platform subscription expansion</p>
            </div>
            <Badge variant="indigo" size="sm">Simulated Platform MRR</Badge>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mrrGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAdminMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v) => [formatAmount(v), 'MRR']}
                  contentStyle={{ backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="mrr" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAdminMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Showroom Plan Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Tenants by subscription tier</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #1e293b', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 text-xs pt-4 border-t border-slate-800">
            {planDistribution.map((p, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-300">{p.name}</span>
                </div>
                <span className="font-bold text-white">{p.count} Showrooms</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Recent Registered Showrooms & Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Showrooms directory teaser */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-white">Registered Showroom Tenants</h3>
            <Link to="/super-admin/showrooms" className="text-xs text-indigo-400 hover:underline">
              View all {adminShowrooms.length} →
            </Link>
          </div>

          <div className="space-y-3">
            {adminShowrooms.slice(0, 4).map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{s.name}</h4>
                  <p className="text-[11px] text-slate-400">{s.owner} • {s.city}</p>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusBadgeVariant(s.status)} size="sm">
                    {s.status}
                  </Badge>
                  <p className="text-[11px] font-semibold text-indigo-300 mt-1">{s.planName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Logs teaser */}
        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-sm font-bold text-white">Platform System Activity</h3>
            <Link to="/super-admin/activity-logs" className="text-xs text-indigo-400 hover:underline">
              Audit log →
            </Link>
          </div>

          <div className="space-y-3">
            {adminLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{log.action}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{log.timestamp.slice(11)}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{log.target}</p>
                <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                  <span>Actor: {log.actor}</span>
                  <span className="text-indigo-400 uppercase">{log.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
