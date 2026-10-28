import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { auth, isSupabaseConfigured } from '../../lib/supabase';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await auth.resetPassword(email.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error.message || 'Could not send password recovery email.');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white">
            Showroom<span className="text-blue-600 dark:text-blue-400">Pro</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Reset Password
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter the email address on your account to receive a secure recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl border border-slate-200 dark:border-slate-800 sm:rounded-2xl sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Reset Link Dispatched
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                If an account exists for <span className="font-medium text-slate-800 dark:text-slate-200">{email}</span>, Supabase has sent a password recovery link.
              </p>
              <Link to="/login" className="block mt-4">
                <Button variant="primary" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="director@apexshowroom.com"
                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                {error && <p className="text-[11px] text-rose-500 mt-1">{error}</p>}
              </div>

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading || !isSupabaseConfigured}>
                {loading ? 'Sending…' : 'Send Reset Instructions'}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
