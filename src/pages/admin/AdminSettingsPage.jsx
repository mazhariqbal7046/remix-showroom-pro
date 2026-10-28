import React, { useEffect, useState } from 'react';
import { AlertCircle, CreditCard, Globe, Mail, Save, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';

const blank = { account_holder: '', bank_name: '', account_number: '', iban: '', raast_id: '', payment_instructions: '' };
const items = [
  { label: 'Showroom account registration', value: 'Supabase Auth', icon: Shield },
  { label: 'Default showroom currency', value: 'PKR (showroom can change in Settings)', icon: Globe },
  { label: 'Subscription billing', value: 'Manual bank transfer; admin verification required', icon: CreditCard },
  { label: 'Platform support contact', value: 'Not configured', icon: Mail },
];

export const AdminSettingsPage = () => {
  const { fetchPlatformPaymentSettings, savePlatformPaymentSettings } = useApp();
  const { toast } = useToast();
  const [form, setForm] = useState(blank);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let mounted = true;
    fetchPlatformPaymentSettings().then(({ data, error }) => {
      if (!mounted) return;
      if (error) toast.error(error.message, 'Could not load payout account');
      else if (data?.settings) setForm({ ...blank, ...data.settings });
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);
  const save = async (event) => {
    event.preventDefault(); setSaving(true);
    const { error } = await savePlatformPaymentSettings(form);
    setSaving(false);
    if (error) toast.error(error.message, 'Could not save payout account');
    else toast.success('Showroom subscription payments will use these bank details.', 'Payout account saved');
  };
  const field = (key, label, required = false) => <label key={key} className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">{label}{required && ' *'}</span><input required={required} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500" /></label>;
  return <div className="max-w-4xl space-y-6">
    <div className="border-b border-slate-200 pb-4"><h1 className="text-2xl font-bold text-slate-900">Platform Configuration</h1><p className="mt-1 text-sm text-slate-500">Set the bank account where showroom owners send their monthly subscription payment.</p></div>
    <div role="status" className="flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><AlertCircle className="mt-0.5 shrink-0" size={18}/><p>Owners submit the transfer reference here. Subscription access changes to active only after you approve the payment in the Payments page. This does not automatically debit a bank account.</p></div>
    <form onSubmit={save} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Subscription payout account</h2>
      {loading ? <p className="text-sm text-slate-500">Loading saved account…</p> : <>
        <div className="grid gap-4 md:grid-cols-2">{field('account_holder','Account holder name',true)}{field('bank_name','Bank name',true)}{field('account_number','Account number',true)}{field('iban','IBAN')}{field('raast_id','Raast ID')}</div>
        <label className="block space-y-1.5"><span className="text-sm font-medium text-slate-700">Payment instructions</span><textarea rows={3} value={form.payment_instructions} onChange={(e) => setForm({ ...form, payment_instructions: e.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900" placeholder="Add any transfer instructions for showroom owners" /></label>
        <Button type="submit" disabled={saving}><Save size={16} className="mr-2"/>{saving ? 'Saving…' : 'Save payout account'}</Button>
      </>}
    </form>
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">{items.map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center justify-between gap-4 p-5"><div className="flex items-center gap-3 text-sm text-slate-700"><Icon size={18} className="text-blue-600"/>{label}</div><span className="text-right text-sm font-medium text-slate-600">{value}</span></div>)}</div>
  </div>;
};
