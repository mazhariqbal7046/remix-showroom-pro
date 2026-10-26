import React, { useMemo, useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { auth } from '../../lib/supabase';
import { calculateFinancials } from '../../utils/businessLogic';

export const AIAssistantPage = () => {
  const { sales, purchases, expenses, bookings, products, showroomInfo, formatAmount } = useApp();
  const { toast } = useToast();
  const [question, setQuestion] = useState('Aaj showroom ka profit aur bookings batao');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const financials = useMemo(() => calculateFinancials({ sales, purchases, expenses, bookings, products }), [sales, purchases, expenses, bookings, products]);

  const localAnswer = (text) => {
    const q = text.toLowerCase();
    const receivables = bookings.reduce((sum, booking) => sum + Math.max(0, Number(booking.totalPrice || 0) - Number(booking.amountReceived || 0)), 0);
    if (q.includes('stock') || q.includes('inventory') || q.includes('bike')) return `Current local inventory has ${products.length} products. Available quantities should be checked from the Inventory page.`;
    if (q.includes('booking') || q.includes('reservation')) return `${bookings.length} bookings are recorded. Outstanding booking balance is ${formatAmount(receivables)}.`;
    if (q.includes('sale') || q.includes('revenue')) return `Recorded revenue is ${formatAmount(financials.revenue)}. Booking deposits are not counted as completed sales revenue.`;
    return `Net profit is ${formatAmount(financials.netProfit)}, gross profit is ${formatAmount(financials.grossProfit)}, and outstanding bookings are ${formatAmount(receivables)}.`;
  };

  const ask = async (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || loading) return;
    setLoading(true);
    let answer = localAnswer(text);
    const apiUrl = import.meta.env.VITE_AI_SERVICE_URL;
    const showroomId = showroomInfo?.id;
    try {
      const sessionResult = await auth.getSession();
      const token = sessionResult?.data?.session?.access_token;
      if (apiUrl && showroomId && token) {
        const response = await fetch(`${apiUrl}/api/ai/ask`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'x-showroom-id': showroomId }, body: JSON.stringify({ question: text }) });
        if (response.ok) answer = (await response.json()).answer || answer;
        else if (response.status === 403) toast.error('Supabase showroom access is not ready for this account.', 'AI access denied');
      }
      setMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', text: answer }]);
      setQuestion('');
    } catch {
      setMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', text: answer }]);
      toast.info('AI service unavailable, so verified local figures were used.', 'Offline fallback');
    } finally {
      setLoading(false);
    }
  };

  return <div className="space-y-6 max-w-4xl"><div><div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-violet-100 text-violet-700"><Bot size={22} /></div><div><h1 className="text-2xl font-bold text-slate-900 dark:text-white">AI Showroom Assistant</h1><p className="text-xs text-slate-500 mt-1">Ask about profit, sales, bookings, receivables, or EV bike stock.</p></div></div></div><div className="grid grid-cols-1 md:grid-cols-3 gap-3"><Metric title="Net profit" value={formatAmount(financials.netProfit)} /><Metric title="Revenue" value={formatAmount(financials.revenue)} /><Metric title="Bookings" value={bookings.length} /></div><div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 min-h-[360px] flex flex-col"><div className="flex-1 space-y-3">{messages.length === 0 && <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-800 dark:text-violet-200 text-sm"><Sparkles size={16} className="inline mr-2" />Your answers will use Supabase records when you are signed in. Without a session, the local verified fallback is used.</div>}{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`max-w-[90%] p-3 rounded-xl text-sm ${message.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'}`}>{message.text}</div>)}</div><form onSubmit={ask} className="flex gap-2 mt-5"><input value={question} onChange={(event) => setQuestion(event.target.value)} className="input flex-1" placeholder="Ask your showroom question..." /><Button type="submit" icon={Send} disabled={loading}>{loading ? 'Thinking...' : 'Ask'}</Button></form></div></div>;
};

const Metric = ({ title, value }) => <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4"><div className="text-[10px] uppercase tracking-wide text-slate-500">{title}</div><div className="mt-2 font-bold text-lg text-slate-900 dark:text-white">{value}</div></div>;
