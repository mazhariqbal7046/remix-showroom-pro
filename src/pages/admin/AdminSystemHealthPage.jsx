import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, Server } from 'lucide-react';
import { Button } from '../../components/common/Button';

const serviceUrl = (import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001').replace(/\/$/, '');

export const AdminSystemHealthPage = () => {
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${serviceUrl}/health`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Health endpoint returned ${response.status}.`);
      setHealth(await response.json());
    } catch (err) {
      setHealth(null);
      setError(err.message || 'Could not reach the backend health endpoint.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const checks = [
    ['FastAPI service', health?.ok ? 'Connected' : 'Unavailable'],
    ['Supabase database credentials', health?.supabase_configured ? 'Configured' : 'Not configured'],
    ['Email provider', health?.email_configured ? 'Configured' : 'Not configured'],
    ['Email queue worker', health?.email_worker_enabled ? 'Enabled' : 'Disabled'],
    ['AI provider', health?.ai_configured ? 'Configured' : 'Not configured'],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div><h1 className="text-2xl font-bold text-slate-900">Service Health</h1><p className="mt-1 text-sm text-slate-500">Live configuration reported by the backend health endpoint.</p></div>
        <Button variant="secondary" icon={RefreshCw} onClick={refresh} disabled={loading}>{loading ? 'Checking…' : 'Check now'}</Button>
      </div>
      {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertCircle size={18} className="mt-0.5 shrink-0" />{error}</div>}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-100 p-5"><Server size={18} className="text-blue-600" /><h2 className="font-semibold text-slate-900">Configured services</h2></div>
        <div className="divide-y divide-slate-100">
          {checks.map(([label, status]) => <div key={label} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
            <span className="text-slate-700">{label}</span><span className="inline-flex items-center gap-2 text-slate-600"><CheckCircle2 size={16} className={status === 'Connected' || status === 'Configured' || status === 'Enabled' ? 'text-emerald-600' : 'text-slate-400'} />{health ? status : 'Unknown'}</span>
          </div>)}
        </div>
      </div>
      <p className="text-xs text-slate-500">This endpoint confirms service availability and configuration only. It does not measure uptime history, traffic latency, or error rates.</p>
    </div>
  );
};
