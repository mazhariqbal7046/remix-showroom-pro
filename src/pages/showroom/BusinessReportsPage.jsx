import React, { useMemo, useState } from 'react';
import { Download, Printer, LockKeyhole } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { exportToCSV } from '../../utils/formatters';
import { calculateFinancials, monthBounds, inDateRange } from '../../utils/businessLogic';

export const BusinessReportsPage = () => {
  const { sales, expenses, purchases, bookings, products, partnerFinance, formatAmount, closeMonthlyReport } = useApp();
  const { toast } = useToast();
  const [tab, setTab] = useState('daily');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [closing, setClosing] = useState(false);
  const range = tab === 'daily' ? { from: date, to: date } : monthBounds(month);
  const f = calculateFinancials({ sales, purchases, expenses, bookings, products, ...range });
  const daily = useMemo(() => [
    ...sales.filter((item) => inDateRange(item.date, range.from, range.to)).map((item) => ({ date: item.date, type: 'Completed sale', customer: item.customerName, reference: item.invoiceNumber, total: item.total, received: item.paidAmount, status: item.status })),
    ...bookings.filter((item) => inDateRange(item.bookingDate, range.from, range.to)).map((item) => ({ date: item.bookingDate, type: 'Booking payment', customer: item.customerName, reference: item.bookingNumber, total: item.totalPrice, received: item.amountReceived, status: item.status })),
    ...expenses.filter((item) => inDateRange(item.date, range.from, range.to)).map((item) => ({ date: item.date, type: 'Expense', customer: item.title, reference: item.id, total: item.amount, received: item.amount, status: 'Posted' })),
  ], [sales, bookings, expenses, range.from, range.to]);
  const metrics = tab === 'daily'
    ? { sales: daily.filter((item) => item.type === 'Completed sale').reduce((sum, item) => sum + Number(item.total || 0), 0), bookings: bookings.filter((item) => item.bookingDate === date).length, collections: daily.reduce((sum, item) => sum + Number(item.received || 0), 0), expenses: expenses.filter((item) => item.date === date).reduce((sum, item) => sum + Number(item.amount || 0), 0) }
    : { sales: f.revenue, bookings: bookings.filter((item) => item.bookingDate?.startsWith(month)).length, collections: daily.reduce((sum, item) => sum + Number(item.received || 0), 0), expenses: f.operatingExpenses };
  const closeMonth = async () => {
    setClosing(true);
    const result = await closeMonthlyReport(`${month}-01`, `Closed from Business Reports for ${month}.`);
    setClosing(false);
    if (result.error) return toast.error(result.error.message, 'Monthly closing failed');
    toast.success(`Monthly figures for ${month} saved in Supabase.`, 'Month closed');
  };
  const exportReport = () => exportToCSV(`${tab}-showroom-report`, daily, [{ key: 'date', label: 'Date' }, { key: 'type', label: 'Type' }, { key: 'customer', label: 'Customer' }, { key: 'reference', label: 'Reference' }, { key: 'total', label: 'Amount' }, { key: 'received', label: 'Received' }, { key: 'status', label: 'Status' }]);
  return <div className="space-y-6">
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">Business Reports</h1><p className="text-xs text-slate-500 mt-1">Calculated from recorded transactions; bookings are not revenue until delivered.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => setTab('daily')} className={`px-3 py-2 rounded-lg text-xs font-semibold ${tab === 'daily' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}`}>Daily report</button><button onClick={() => setTab('monthly')} className={`px-3 py-2 rounded-lg text-xs font-semibold ${tab === 'monthly' ? 'bg-blue-600 text-white' : 'bg-white border text-slate-600'}`}>Monthly report</button><input type={tab === 'daily' ? 'date' : 'month'} value={tab === 'daily' ? date : month} onChange={(event) => tab === 'daily' ? setDate(event.target.value) : setMonth(event.target.value)} className="px-3 py-2 rounded-lg border text-xs" />{tab === 'monthly' && <Button icon={LockKeyhole} onClick={closeMonth} disabled={closing}>{closing ? 'Closing...' : 'Close Month'}</Button>}<Button variant="secondary" icon={Download} onClick={exportReport}>CSV</Button><Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print</Button></div></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4"><K label={tab === 'daily' ? 'Sales completed' : 'Revenue'} value={formatAmount(metrics.sales)} /><K label="Bookings" value={metrics.bookings} /><K label="Collections" value={formatAmount(metrics.collections)} /><K label="Expenses" value={formatAmount(metrics.expenses)} /></div>
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4"><K label="COGS" value={formatAmount(f.cogs)} /><K label="Gross profit" value={formatAmount(f.grossProfit)} /><K label="Net profit" value={formatAmount(f.netProfit)} /><K label="Outstanding bookings" value={formatAmount(bookings.reduce((sum, item) => sum + Math.max(0, Number(item.totalPrice) - Number(item.amountReceived)), 0))} /><K label="Low-stock bikes" value={products.filter((item) => (item.category === 'EV Bikes' || item.model) && Number(item.quantity || 0) - Number(item.reservedQuantity || 0) <= Number(item.minStockThreshold || 0)).length} /></div>
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="p-4 border-b text-sm font-bold">{tab === 'daily' ? 'Daily activity' : 'Monthly activity'} — {tab === 'daily' ? date : month}</div><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800 text-slate-500"><tr>{['Date', 'Type', 'Customer / Description', 'Reference', 'Total', 'Received', 'Status'].map((label) => <th key={label} className="px-4 py-3 text-left">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{daily.map((item, index) => <tr key={`${item.reference}-${index}`}><td className="px-4 py-3">{item.date}</td><td className="px-4 py-3 font-semibold">{item.type}</td><td className="px-4 py-3">{item.customer}</td><td className="px-4 py-3 text-blue-600">{item.reference}</td><td className="px-4 py-3">{formatAmount(item.total)}</td><td className="px-4 py-3 text-emerald-600">{formatAmount(item.received)}</td><td className="px-4 py-3">{item.status}</td></tr>)}</tbody></table></div></div>
    {tab === 'monthly' && <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="p-4 border-b text-sm font-bold">Partner profit allocation — distributable {formatAmount(f.distributableProfit)}</div><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800"><tr><th className="p-3 text-left">Partner</th><th className="p-3 text-left">Share</th><th className="p-3 text-left">Allocated profit</th></tr></thead><tbody>{partnerFinance.map((partner) => <tr key={partner.id} className="border-t"><td className="p-3 font-semibold">{partner.fullName}</td><td className="p-3">{partner.profitShare}%</td><td className="p-3 text-emerald-600">{formatAmount(f.distributableProfit * Number(partner.profitShare || 0) / 100)}</td></tr>)}</tbody></table></div>}
  </div>;
};

const K = ({ label, value }) => <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800"><div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div><div className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{value}</div></div>;
