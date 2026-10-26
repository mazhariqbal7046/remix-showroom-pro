import React from 'react';
import {
  Server,
  Activity,
  Database,
  Cpu,
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const AdminSystemHealthPage = () => {
  const { toast } = useToast();

  const latencyHistory = [
    { time: '00:00', api: 38, db: 16 },
    { time: '04:00', api: 34, db: 14 },
    { time: '08:00', api: 48, db: 22 },
    { time: '12:00', api: 56, db: 25 },
    { time: '16:00', api: 44, db: 19 },
    { time: '20:00', api: 41, db: 17 },
    { time: 'Now', api: 42, db: 18 },
  ];

  const services = [
    { name: 'Supabase PostgreSQL Primary', status: 'Operational', latency: '18ms', uptime: '99.99%' },
    { name: 'Fastify / Node API Edge Layer', status: 'Operational', latency: '42ms', uptime: '99.98%' },
    { name: 'Auth & JWT Token Service', status: 'Operational', latency: '24ms', uptime: '100%' },
    { name: 'Storage Bucket & Media CDN', status: 'Operational', latency: '35ms', uptime: '99.97%' },
    { name: 'Invoice PDF Rendering Engine', status: 'Operational', latency: '85ms', uptime: '99.95%' },
  ];

  const handleSimulateHealthCheck = () => {
    toast.success('Heartbeat probe completed. All microservices responding normally.', 'System Healthy');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            System Health & Infrastructure Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulated monitoring interface prepared for Phase 2 Supabase backend connectivity.
          </p>
        </div>

        <Button variant="secondary" size="md" icon={RefreshCw} onClick={handleSimulateHealthCheck}>
          Run Heartbeat Probe
        </Button>
      </div>

      {/* Honesty disclaimer */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-bold text-white">Simulated Telemetry:</span> These monitoring metrics illustrate the platform observability architecture. In Phase 2, this view will bind to real Prometheus/Grafana or Supabase health endpoints.
        </p>
      </div>

      {/* 6 Health Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">API Response</span>
          <div className="text-2xl font-black text-white mt-1">42 ms</div>
          <span className="text-[11px] text-emerald-400">Global median</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">Database Latency</span>
          <div className="text-2xl font-black text-indigo-400 mt-1">18 ms</div>
          <span className="text-[11px] text-emerald-400">Pool healthy</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">Error Rate</span>
          <div className="text-2xl font-black text-white mt-1">0.04%</div>
          <span className="text-[11px] text-emerald-400">Well below SLA</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">Storage Usage</span>
          <div className="text-2xl font-black text-white mt-1">34%</div>
          <span className="text-[11px] text-slate-400">120 GB of 350 GB</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">Active Sessions</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">184</div>
          <span className="text-[11px] text-slate-400">Concurrent sockets</span>
        </div>

        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400">Availability</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">99.98%</div>
          <span className="text-[11px] text-emerald-400">30-day window</span>
        </div>
      </div>

      {/* Latency History Chart */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white">API & Database Roundtrip Latency (24h)</h3>
            <p className="text-xs text-slate-400">Response time in milliseconds</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-blue-500" /> API Gateway
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> Database Query
            </span>
          </div>
        </div>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={latencyHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#020617', borderRadius: '8px', border: '1px solid #1e293b', color: '#fff', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="api" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="db" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white">Microservice Status Breakdown</h3>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-6 font-semibold">Service Name</th>
              <th className="py-3 px-6 font-semibold">Status</th>
              <th className="py-3 px-6 font-semibold">Latency</th>
              <th className="py-3 px-6 font-semibold">Availability SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {services.map((svc, i) => (
              <tr key={i} className="hover:bg-slate-900/60">
                <td className="py-3.5 px-6 font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {svc.name}
                </td>
                <td className="py-3.5 px-6">
                  <Badge variant="success" size="sm">{svc.status}</Badge>
                </td>
                <td className="py-3.5 px-6 text-slate-300 font-mono">{svc.latency}</td>
                <td className="py-3.5 px-6 text-emerald-400 font-semibold">{svc.uptime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
