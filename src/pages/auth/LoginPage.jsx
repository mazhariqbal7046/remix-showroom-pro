import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';
import { isSuperAdminUser, SUPER_ADMIN_EMAIL } from '../../lib/accessControl';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});

  const { toast } = useToast();
  const { setCurrentRole, signIn, isSupabaseConfigured } = useApp();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const result = await signIn(email, password);
      const signedInUser = result?.data?.user || result?.data?.session?.user;
      const isAdminEmail = email.trim().toLowerCase() === SUPER_ADMIN_EMAIL;
      const isAdmin = isSuperAdminUser(signedInUser);
      if (isAdminEmail && !isAdmin) {
        throw new Error('This account is not authorized for Super Admin access.');
      }
      const isPartner = result.role === 'partner';
      setCurrentRole(isAdmin ? 'super_admin' : isPartner ? 'partner' : 'owner');
      toast.success('Signed in securely.', isAdmin ? 'Super Admin Authentication' : 'Supabase Authentication');
      navigate(isAdmin ? '/super-admin' : isPartner ? '/partner-portal' : '/dashboard');
    } catch (error) {
      toast.error(error.message || 'Unable to sign in. Check your email and password.', 'Authentication failed');
    }
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
          Sign in to your showroom
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Or{' '}
          <Link to="/signup" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            create your showroom account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl border border-slate-200 dark:border-slate-800 sm:rounded-2xl sm:px-10">
          {/* Authentication status */}
          <div className="mb-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>{isSupabaseConfigured ? 'Supabase Authentication' : 'Account sign-in unavailable'}</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {isSupabaseConfigured ? 'Use the email and password registered for your showroom. Your session is handled by Supabase Auth.' : 'This app requires a live Supabase connection. Please contact the platform administrator while the service is configured.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  placeholder="owner@showroom.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800 border rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-rose-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">Remember this device</span>
              </label>
            </div>

            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={!isSupabaseConfigured}>
              Sign In to Showroom
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/signup" className="inline-flex w-full items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              Create New Showroom Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
