import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Calendar,
  ShieldCheck,
  Clock,
  Users,
  Landmark,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge, getStatusBadgeVariant } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';

export const SubscriptionPage = () => {
  const {
    subscription,
    activePlan,
    partnerLimitInfo,
    updateSubscriptionPlan,
    fetchBillingSubscription,
    submitSubscriptionPayment,
    formatAmount,
  } = useApp();
  const { toast } = useToast();
  const [billing, setBilling] = useState(null);
  const [reference, setReference] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const refreshBilling = async () => {
    const { data, error } = await fetchBillingSubscription();
    if (error) toast.error(error.message, 'Billing details unavailable');
    else setBilling(data);
    setLoadingBilling(false);
  };
  useEffect(() => { void refreshBilling(); }, []);
  const submitTransfer = async (event) => {
    event.preventDefault(); setSubmitting(true);
    const { error } = await submitSubscriptionPayment({ transfer_reference: reference, transfer_date: transferDate });
    setSubmitting(false);
    if (error) toast.error(error.message, 'Payment submission failed');
    else { toast.success('Transfer is pending admin verification.', 'Payment submitted'); setReference(''); await refreshBilling(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription & Licensing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Your showroom has one fixed monthly plan with all core features and unlimited partner accounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900">Manual bank transfer</span>
          <Link to="/pricing" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">View plan details</Link>
        </div>
      </div>

      {/* Expiry Banner / Notice */}
      <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Data Retention Guarantee:</span> Your showroom data, product catalogs, customer histories, and invoices are permanent. If a subscription lapses or expires, business records are safely retained and never deleted.
        </div>
      </div>

      {/* Main Subscription Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Showroom Pro Plan
              </span>
              <Badge variant={getStatusBadgeVariant(subscription.status)} size="sm">
                {subscription.status}
              </Badge>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {activePlan.name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              {activePlan.description}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Current Billing Rate</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              Rs. {Number(activePlan.monthlyPrice).toLocaleString('en-PK')}
              <span className="text-xs text-slate-400 font-normal">
                /month
              </span>
            </div>
            <span className="text-[10px] text-slate-500">Paid transfers require admin verification</span>
          </div>
        </div>

        {/* 4 Details Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-semibold uppercase">Partner Accounts</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              Unlimited
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {partnerLimitInfo.displayLimitText}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-semibold uppercase">Next Renewal</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {subscription.renewalDate ? formatDate(subscription.renewalDate) : 'Not scheduled'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Billing cycle: Monthly
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span className="text-[11px] font-semibold uppercase">Subscription Age</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {subscription.startDate ? `Since ${formatDate(subscription.startDate)}` : 'No start date recorded'}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              Current status: {subscription.status}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span className="text-[11px] font-semibold uppercase">Payment Method</span>
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              Bank transfer
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Submit transfer reference for verification.
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2"><Landmark className="h-5 w-5 text-blue-600"/><h3 className="font-bold text-slate-900 dark:text-white">Platform bank account</h3></div>
          {loadingBilling ? <p className="text-sm text-slate-500">Loading payment details…</p> : billing?.payment_details ? <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <p><b>Account holder:</b> {billing.payment_details.account_holder}</p><p><b>Bank:</b> {billing.payment_details.bank_name}</p><p><b>Account number:</b> {billing.payment_details.account_number}</p>
            {billing.payment_details.iban && <p><b>IBAN:</b> {billing.payment_details.iban}</p>}{billing.payment_details.raast_id && <p><b>Raast ID:</b> {billing.payment_details.raast_id}</p>}
            {billing.payment_details.payment_instructions && <p className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">{billing.payment_details.payment_instructions}</p>}
            <p className="pt-2 font-semibold">Monthly amount: {formatAmount(billing.subscription?.monthly_amount || activePlan.monthlyPrice)}</p>
          </div> : <p className="text-sm text-amber-700">Payout bank details abhi admin ne configure nahi ki hain.</p>}
        </div>
        <form onSubmit={submitTransfer} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white">Submit a bank transfer</h3>
          <label className="block space-y-1"><span className="text-xs font-medium text-slate-600 dark:text-slate-300">Bank transfer reference / transaction ID</span><input required minLength={3} maxLength={120} value={reference} onChange={(e)=>setReference(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label>
          <label className="block space-y-1"><span className="text-xs font-medium text-slate-600 dark:text-slate-300">Transfer date</span><input required type="date" value={transferDate} onChange={(e)=>setTransferDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" /></label>
          <Button type="submit" disabled={submitting || !billing?.payment_details}>{submitting ? 'Submitting…' : 'Submit for verification'}</Button>
          <p className="text-xs text-slate-500">Subscription activates after the platform admin verifies the transfer.</p>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 font-bold text-slate-900 dark:text-white">Submitted transfers</h3>
        {billing?.payments?.length ? <div className="space-y-2">{billing.payments.map((payment)=><div key={payment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-800"><span>{payment.transfer_reference} · {formatDate(payment.transfer_date)}</span><span className="font-semibold">{formatAmount(payment.amount)} · {payment.status.replace('_',' ')}</span></div>)}</div> : <p className="text-sm text-slate-500">No bank transfer submissions yet.</p>}
      </section>

      {/* Subscription Invoices History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Subscription Billing Ledger
            </h3>
            <p className="text-xs text-slate-500">Historical payments for your showroom license</p>
          </div>
          <span className="text-xs font-medium text-slate-500">Recorded transactions only</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-6 font-semibold">Reference #</th>
                <th className="py-3 px-6 font-semibold">Invoice Date</th>
                <th className="py-3 px-6 font-semibold">Plan Name</th>
                <th className="py-3 px-6 font-semibold">Amount</th>
                <th className="py-3 px-6 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subscription.invoices.length ? subscription.invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-6 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {inv.id}
                  </td>
                  <td className="py-3.5 px-6 text-slate-600 dark:text-slate-300">
                    {formatDate(inv.date)}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                    {inv.plan}
                  </td>
                  <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-white">
                    {formatAmount(inv.amount)}
                  </td>
                  <td className="py-3.5 px-6">
                    <Badge variant="success" size="sm">
                      {inv.status}
                    </Badge>
                  </td>
                </tr>
              )) : <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">No subscription payments have been recorded. Billing checkout is unavailable until a payment provider is connected.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
