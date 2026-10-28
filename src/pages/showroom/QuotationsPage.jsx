import React, { useMemo, useState } from 'react';
import { FileText, Printer, Plus, Share2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { syncQuotation } from '../../lib/supabase';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

const newQuoteNumber = () => `QT-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`;

export const QuotationsPage = () => {
  const { products, showroomInfo, userProfile, formatAmount } = useApp();
  const { toast } = useToast();
  const bikes = useMemo(() => products.filter((product) => product.category === 'EV Bikes'), [products]);
  const [quoteNumber] = useState(newQuoteNumber);
  const [quoteDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState(() => ({
    customerName: '',
    customerPhone: '',
    bikeName: bikes[0]?.name || '',
    motorPower: bikes[0]?.motorPower || '',
    batteryType: bikes[0]?.batteryType || '',
    batteryCapacity: bikes[0]?.batteryCapacity || '',
    price: bikes[0]?.sellingPrice || '',
    notes: '',
    ownerSignature: userProfile?.fullName || '',
    ownerStamp: showroomInfo?.name || '',
  }));
  const selectedBike = bikes.find((bike) => bike.name === form.bikeName);
  const setField = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const printQuote = () => window.print();

  const saveQuote = async () => {
    if (!showroomInfo?.id) return toast.error('Showroom Supabase se connected nahi hai.');
    if (!form.customerName.trim() || !form.customerPhone.trim() || !form.bikeName.trim() || !form.price) {
      return toast.error('Customer name, phone, bike name aur quoted price fill karein.');
    }
    const result = await syncQuotation({
      showroomId: showroomInfo.id,
      quotation: {
        ...form,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        quoteNumber,
        total: Number(form.price || 0),
        subtotal: Number(form.price || 0),
        issueDate: quoteDate,
      },
      item: {
        productId: selectedBike?.id,
        productName: form.bikeName.trim(),
        motorPower: form.motorPower.trim(),
        batteryType: form.batteryType.trim(),
        batteryCapacity: form.batteryCapacity.trim(),
        unitPrice: Number(form.price || 0),
      },
    });
    if (result.error) return toast.error('Quotation save nahi hui. Supabase access check karein.');
    toast.success(`Quotation ${quoteNumber} Supabase mein save ho gayi.`);
  };

  const shareQuote = async () => {
    const text = [
      `Quotation from ${showroomInfo?.name || 'Showroom'}`,
      `Customer: ${form.customerName || '—'} · ${form.customerPhone || '—'}`,
      `Bike: ${form.bikeName || '—'}`,
      `Motor: ${form.motorPower || '—'} · Battery: ${[form.batteryType, form.batteryCapacity].filter(Boolean).join(' ') || '—'}`,
      `Quoted price: ${formatAmount(form.price)}`,
    ].join('\n');
    try {
      if (navigator.share) await navigator.share({ title: 'EV Bike Quotation', text });
      else {
        await navigator.clipboard?.writeText(text);
        toast.success('Quotation details copy ho gayi hain.');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') toast.error('Quotation share nahi ho saki.');
    }
  };

  const contactLine = [showroomInfo?.phone, showroomInfo?.email].filter(Boolean).join(' · ');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bike Quotations</h1>
          <p className="mt-1 text-xs text-slate-500">Customer ka naam/phone aur bike ki motor, battery aur price ke saath quotation banayein.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Share2} onClick={shareQuote}>Share</Button>
          <Button variant="secondary" onClick={saveQuote}><FileText size={16} />Save quotation</Button>
          <Button icon={Printer} onClick={printQuote}>Print quotation</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2 print:hidden">
          <h2 className="flex items-center gap-2 text-sm font-bold"><Plus size={16} />Quotation details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold">Customer name
              <input autoComplete="name" value={form.customerName} onChange={setField('customerName')} className="input mt-1" placeholder="Customer ka naam likhein" />
            </label>
            <label className="text-xs font-semibold">Phone number
              <input type="tel" inputMode="tel" autoComplete="tel" value={form.customerPhone} onChange={setField('customerPhone')} className="input mt-1" placeholder="03xx xxxxxxx" />
            </label>
            <label className="text-xs font-semibold">Bike name
              <input list="quotation-bike-suggestions" value={form.bikeName} onChange={(event) => {
                const bike = bikes.find((item) => item.name === event.target.value);
                setForm((current) => ({
                  ...current,
                  bikeName: event.target.value,
                  ...(bike ? {
                    motorPower: bike.motorPower || '',
                    batteryType: bike.batteryType || '',
                    batteryCapacity: bike.batteryCapacity || '',
                    price: bike.sellingPrice || '',
                  } : {}),
                }));
              }} className="input mt-1" placeholder="Bike ka naam likhein" />
              <datalist id="quotation-bike-suggestions">{bikes.map((bike) => <option key={bike.id} value={bike.name} />)}</datalist>
            </label>
            <label className="text-xs font-semibold">Quoted price
              <input type="number" min="0" step="1" value={form.price} onChange={setField('price')} className="input mt-1" placeholder="PKR" />
            </label>
            <label className="text-xs font-semibold">Motor power
              <input value={form.motorPower} onChange={setField('motorPower')} className="input mt-1" placeholder="Misal: 1500W" />
            </label>
            <label className="text-xs font-semibold">Battery type
              <input value={form.batteryType} onChange={setField('batteryType')} className="input mt-1" placeholder="Misal: Lithium LFP" />
            </label>
            <label className="text-xs font-semibold">Battery capacity
              <input value={form.batteryCapacity} onChange={setField('batteryCapacity')} className="input mt-1" placeholder="Misal: 60V / 30Ah" />
            </label>
            <label className="text-xs font-semibold">Owner signature
              <input value={form.ownerSignature} onChange={setField('ownerSignature')} className="input mt-1" placeholder="Owner ka naam" />
            </label>
            <label className="text-xs font-semibold">Owner stamp
              <input value={form.ownerStamp} onChange={setField('ownerStamp')} className="input mt-1" placeholder="Showroom stamp" />
            </label>
            <label className="text-xs font-semibold sm:col-span-2">Notes
              <textarea value={form.notes} onChange={setField('notes')} className="input mt-1 min-h-20" placeholder="Optional quotation notes" />
            </label>
          </div>
        </section>

        <article id="quotation-print" className="min-h-[650px] rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-white print:min-h-0 print:rounded-none print:border-0 print:p-0 print:shadow-none">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="text-2xl font-black tracking-tight text-blue-700">{showroomInfo?.name || 'Showroom'}</div>
              {showroomInfo?.address && <div className="mt-1 text-xs text-slate-500">{showroomInfo.address}</div>}
              {contactLine && <div className="mt-1 text-xs text-slate-500">{contactLine}</div>}
            </div>
            <FileText className="mt-1 shrink-0 text-blue-700" size={28} />
          </header>

          <div className="flex items-end justify-between border-b border-slate-200 py-5">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">EV Bike Quotation</div>
              <div className="mt-1 text-sm font-bold">{quoteNumber}</div>
            </div>
            <div className="text-right text-xs text-slate-500">Date: {formatDate(quoteDate)}</div>
          </div>

          <section className="grid grid-cols-2 gap-6 border-b border-slate-200 py-5 text-sm">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Customer</div>
              <div className="mt-2 font-bold">{form.customerName || 'Customer name'}</div>
              <div className="mt-1 text-slate-600">{form.customerPhone || 'Phone number'}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bike</div>
              <div className="mt-2 font-bold">{form.bikeName || 'Bike name'}</div>
            </div>
          </section>

          <section className="space-y-3 py-5 text-sm">
            <QuoteRow label="Motor power" value={form.motorPower} />
            <QuoteRow label="Battery type" value={form.batteryType} />
            <QuoteRow label="Battery capacity" value={form.batteryCapacity} />
            <div className="mt-5 flex items-center justify-between border-t-2 border-slate-900 pt-4 text-base">
              <span className="font-bold">Quoted price</span>
              <span className="text-xl font-black">{formatAmount(form.price)}</span>
            </div>
          </section>

          {form.notes && <div className="border-t border-slate-200 py-4 text-xs leading-5 text-slate-600"><b>Notes:</b> {form.notes}</div>}

          <footer className="mt-12 grid grid-cols-2 gap-8 pt-2 text-xs">
            <div className="border-t border-slate-400 pt-2"><div className="font-semibold">{form.ownerSignature || ' '}</div><div className="mt-1 text-slate-500">Owner signature</div></div>
            <div className="text-right"><div className="inline-block min-w-32 border border-slate-300 px-4 py-3 font-bold">{form.ownerStamp || 'Showroom stamp'}</div></div>
          </footer>
        </article>
      </div>
    </div>
  );
};

const QuoteRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-b border-dashed border-slate-200 pb-2">
    <span className="text-slate-500">{label}</span>
    <span className="text-right font-semibold">{value || 'Not specified'}</span>
  </div>
);
