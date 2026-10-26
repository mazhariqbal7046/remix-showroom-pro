import React from 'react';
import {
  Activity,
  Users,
  Building,
  TrendingUp,
  Boxes,
  Zap,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/common/Badge';

export const AdminAnalyticsPage = () => {
  const { adminShowrooms, formatAmount } = useApp();

  const activityData = [
    { day: 'Mon', invoices: 24, activeUsers: 68 },
    { day: 'Tue', invoices: 38, activeUsers: 84 },
    { day: 'Wed', invoices: 42, activeUsers: 92 },
    { day: 'Thu', invoices: 31, activeUsers: 76 },
    { day: 'Fri', invoices: 55, activeUsers: 110 },
    { day: 'Sat', invoices: 62, activeUsers: 135 },
    { day: 'Sun', invoices: 29, activeUsers: 58 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Platform Engagement & Usage Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tenant application utilization, daily active users (DAU), and POS throughput.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Daily Active Staff & Partners
          </span>
          <div className="text-2xl font-black text-white mt-1">184 Users</div>
          <span className="text-[11px] text-emerald-400">Across 6 tenant showrooms</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total Inventory Units Managed
          </span>
          <div className="text-2xl font-black text-indigo-400 mt-1">393 Units</div>
          <span className="text-[11px] text-slate-400">Total catalog SKU stock</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Cumulative Showroom Sales Logged
          </span>
          <div className="text-2xl font-black text-emerald-400 mt-1">Rs. 82.8M</div>
          <span className="text-[11px] text-slate-400">Platform-wide GMV processed</span>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <h3 className="text-base font-bold text-white mb-1">
          Weekly Invoice Generation & Active Operator Sessions
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          High volume on Friday/Saturday showroom peak footfalls
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="invoices" fill="#3b82f6" name="Invoices Created" radius={[4, 4, 0, 0]} />
              <Bar dataKey="activeUsers" fill="#6366f1" name="Active Users" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
