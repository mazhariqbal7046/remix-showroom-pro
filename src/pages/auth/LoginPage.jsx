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
  Shield,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';

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
      await signIn(email, password);
      const isAdmin = email.trim().toLowerCase() === 'mazhariqbal4016@gmail.com';
      setCurrentRole(isAdmin ? 'super_admin' : 'showroom_owner');
      toast.success(isSupabaseConfigured ? 'Signed in securely.' : 'Signed in to the local demo session.', isAdmin ? 'Super Admin Authentication' : (isSupabaseConfigured ? 'Supabase Authentication' : 'Demo Authentication'));
      navigate(isAdmin ? '/super-admin' : '/dashboard');
    } catch (error) {
      toast.error(error.message || 'Unable to sign in. Check your email and password.', 'Authentication failed');
    }
  };

  const handleQuickAdminLogin = () => {
    setCurrentRole('super_admin');
    toast.info('Super Admin role active for demo evaluation.', 'Admin Mode');
    navigate('/super-admin');
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
            start your 14-day free trial
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl border border-slate-200 dark:border-slate-800 sm:rounded-2xl sm:px-10">
          {/* Demo disclaimer banner */}
          <div className="mb-6 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <ShieldAlert className="w-4 h-4 text-blue-600" />
              <span>{isSupabaseConfigured ? 'Supabase Authentication' : 'Simulated Frontend Session'}</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {isSupabaseConfigured ? 'Use the email and password you created on the Sign up page. Your session is handled by Supabase Auth.' : 'Supabase credentials are not configured, so this screen uses a local demo session.'}
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

            <Button type="submit" variant="primary" size="lg" className="w-full">
              Sign In to Showroom
            </Button>
          </form>

          <div className="mt-5 text-center">
            <Link to="/signup" className="inline-flex w-full items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
              Create New Showroom Account
            </Link>
          </div>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center mb-3">
              Fast Demo Switcher
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('director@apexshowroom.com');
                  setPassword('demo-password-123');
                  setCurrentRole('showroom_owner');
                  navigate('/dashboard');
                }}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left text-xs transition-colors"
              >
                <div className="font-semibold text-slate-800 dark:text-slate-200">Showroom Owner</div>
                <div className="text-[10px] text-slate-400">Apex Luxury</div>
              </button>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="p-2 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left text-xs transition-colors text-indigo-700 dark:text-indigo-300"
              >
                <div className="font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3 text-indigo-600" />
                  Super Admin
                </div>
                <div className="text-[10px] text-indigo-500">Platform Owner</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
