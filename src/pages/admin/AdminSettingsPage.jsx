import React from 'react';
import { AlertCircle, CreditCard, Globe, Mail, Shield } from 'lucide-react';

const items = [
  { label: 'Showroom account registration', value: 'Supabase Auth', icon: Shield },
  { label: 'Default showroom currency', value: 'PKR (showroom can change in Settings)', icon: Globe },
  { label: 'Subscription billing', value: 'Payment provider not connected', icon: CreditCard },
  { label: 'Platform support contact', value: 'Not configured', icon: Mail },
];

export const AdminSettingsPage = () => <div className="space-y-6 max-w-4xl">
  <div className="border-b border-slate-200 pb-4"><h1 className="text-2xl font-bold text-slate-900">Platform Configuration</h1><p className="mt-1 text-sm text-slate-500">Current service settings and connection status.</p></div>
  <div role="status" className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><AlertCircle className="mt-0.5 shrink-0" size={18}/><p>Editable platform governance settings are not backed by a database yet. This page shows the current setup and does not claim to save configuration changes.</p></div>
  <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">{items.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center justify-between gap-4 p-5"><div className="flex items-center gap-3 text-sm text-slate-700"><Icon size={18} className="text-blue-600"/>{label}</div><span className="text-sm font-medium text-slate-600">{value}</span></div>)}</div>
</div>;
