import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';

export const AdminPaymentsPage = () => {
  const { fetchSubscriptionPayments, reviewSubscriptionPayment, formatAmount } = useApp();
  const { toast } = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState('');
  const refresh = async () => {
    setLoading(true);
    const { data, error } = await fetchSubscriptionPayments();
    if (error) toast.error(error.message, 'Could not load payments');
    else setPayments(data?.payments || []);
    setLoading(false);
  };
  useEffect(() => { void refresh(); }, []);
  const review = async (payment, decision) => {
    const action = decision === 'approve' ? 'approve' : 'reject';
    if (action === 'reject' && !window.confirm('Reject this subscription transfer submission?')) return;
    setWorking(payment.id);
    const { error } = await reviewSubscriptionPayment(payment.id, { decision: action });
    setWorking('');
    if (error) toast.error(error.message, 'Payment review failed');
    else { toast.success(action === 'approve' ? 'Payment approved and subscription activated.' : 'Payment marked as rejected.', 'Review saved'); await refresh(); }
  };
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4"><div><h1 className="text-2xl font-bold text-white">Subscription Payments</h1><p className="mt-1 text-sm text-slate-400">Review bank transfers submitted by showroom owners. Approving activates one billing month.</p></div><Button variant="secondary" onClick={refresh}><RefreshCw size={15} className="mr-2"/>Refresh</Button></div>
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-slate-800 bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400"><tr>{['Showroom','Owner email','Amount','Transfer ref','Transfer date','Status','Review'].map((x)=><th key={x} className="px-5 py-3.5 font-semibold">{x}</th>)}</tr></thead><tbody className="divide-y divide-slate-900">{payments.map((p)=><tr key={p.id} className="text-slate-300"><td className="px-5 py-4 font-semibold text-white">{p.showroom?.name || 'Showroom'}</td><td className="px-5 py-4">{p.showroom?.email || '—'}</td><td className="px-5 py-4 font-bold text-emerald-400">{formatAmount(p.amount)}</td><td className="px-5 py-4 font-mono">{p.transfer_reference}</td><td className="px-5 py-4">{p.transfer_date}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 ${p.status==='approved'?'bg-emerald-900 text-emerald-200':p.status==='rejected'?'bg-rose-900 text-rose-200':'bg-amber-900 text-amber-200'}`}>{p.status}</span>{p.review_note && <p className="mt-1 max-w-48 text-[10px] text-slate-500">{p.review_note}</p>}</td><td className="px-5 py-4"><div className="flex gap-2">{p.status==='pending_review' && <><button disabled={!!working} onClick={()=>review(p,'approve')} title="Approve and activate subscription" className="rounded-lg bg-emerald-700 p-2 text-white disabled:opacity-50"><CheckCircle size={16}/></button><button disabled={!!working} onClick={()=>review(p,'reject')} title="Reject transfer" className="rounded-lg bg-rose-800 p-2 text-white disabled:opacity-50"><XCircle size={16}/></button></>}</div></td></tr>)}{!loading && payments.length===0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">No subscription transfer submissions yet.</td></tr>}{loading && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">Loading payment submissions…</td></tr>}</tbody></table></div></div>
  </div>;
};
