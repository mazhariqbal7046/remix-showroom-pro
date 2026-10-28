import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Mail, Lock, UserRound, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';

export const PartnerInvitePage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { authUser, signIn, signUp, fetchPartnerInvitation, acceptPartnerInvitation } = useApp();
  const token = params.get('token') || '';
  const [invitation, setInvitation] = useState(null);
  const [mode, setMode] = useState('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchPartnerInvitation(token).then(({ data, error: requestError }) => {
      if (!active) return;
      setInvitation(data || null);
      setEmail(data?.email || '');
      setError(requestError?.message || '');
      setLoading(false);
    });
    return () => { active = false; };
  }, [token]);

  const accept = async () => {
    setWorking(true);
    setError('');
    const result = await acceptPartnerInvitation(token);
    setWorking(false);
    if (result.error) { setError(result.error.message); return; }
    toast.success('Your account is linked to your partner record. Access is read-only.', 'Invitation accepted');
    navigate('/partner-portal', { replace: true });
  };

  const submit = async (event) => {
    event.preventDefault();
    setWorking(true);
    setError('');
    try {
      if (mode === 'signup') {
        if (!name.trim() || password.length < 8) throw new Error('Enter your name and a password with at least 8 characters.');
        const result = await signUp({ email, password, metadata: { fullName: name.trim() }, redirectTo: window.location.href });
        if (!result.data?.session) {
          setMessage('Account created. Confirm the email sent by Supabase, then open this same invitation link and sign in.');
          setWorking(false);
          return;
        }
      } else {
        await signIn(email, password);
      }
      const result = await acceptPartnerInvitation(token);
      if (result.error) throw result.error;
      toast.success('Your account is linked to your partner record. Access is read-only.', 'Invitation accepted');
      navigate('/partner-portal', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Could not accept the invitation.');
    } finally { setWorking(false); }
  };

  return <main className="min-h-screen bg-slate-50 px-4 py-12 dark:bg-slate-950"><div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <Link to="/" className="mb-6 inline-flex items-center gap-2 font-bold text-slate-900 dark:text-white"><Building2 className="text-blue-600"/> Showroom Pro</Link>
    {loading ? <p className="py-10 text-sm text-slate-500">Checking your secure invitation…</p> : !invitation ? <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{error || 'This invitation is invalid or expired.'}</div> : <>
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">Partner account</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">Welcome, {invitation.partner_name}</h1><p className="mt-2 text-sm text-slate-500">{invitation.showroom_name} invited you to view your own partner record and financial history.</p>
      <div className="my-5 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900"><ShieldCheck size={17} className="shrink-0"/><span>Read-only access: you can see your ownership, profit share, investments and settlements. Other showroom and partner records stay private.</span></div>
      {authUser ? <div className="space-y-4"><p className="text-sm text-slate-600">Signed in as <b>{authUser.email}</b></p>{error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">{error}</p>}<Button onClick={accept} disabled={working || authUser.email?.toLowerCase() !== invitation.email.toLowerCase()} className="w-full">{working ? 'Accepting…' : 'Accept invitation'}</Button>{authUser.email?.toLowerCase() !== invitation.email.toLowerCase() && <p className="text-xs text-rose-700">Sign out and sign in with {invitation.email} to accept this invite.</p>}</div> : <>
        <div className="mb-4 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800"><button type="button" onClick={() => setMode('signin')} className={`flex-1 rounded-md py-2 text-xs font-semibold ${mode === 'signin' ? 'bg-white shadow dark:bg-slate-700' : 'text-slate-500'}`}>I have an account</button><button type="button" onClick={() => setMode('signup')} className={`flex-1 rounded-md py-2 text-xs font-semibold ${mode === 'signup' ? 'bg-white shadow dark:bg-slate-700' : 'text-slate-500'}`}>Create account</button></div>
        <form onSubmit={submit} className="space-y-4">{mode === 'signup' && <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Full name<div className="relative mt-1"><UserRound className="absolute left-3 top-2.5 text-slate-400" size={16}/><input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"/></div></label>}
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Invited email<div className="relative mt-1"><Mail className="absolute left-3 top-2.5 text-slate-400" size={16}/><input readOnly value={email} className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"/></div></label>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password<div className="relative mt-1"><Lock className="absolute left-3 top-2.5 text-slate-400" size={16}/><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-800"/></div></label>
          {message && <p className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800">{message}</p>}{error && <p className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">{error}</p>}
          <Button type="submit" disabled={working} className="w-full">{working ? 'Please wait…' : mode === 'signup' ? 'Create account & accept' : 'Sign in & accept'}</Button>
        </form>
      </>}
    </>}
  </div></main>;
};
