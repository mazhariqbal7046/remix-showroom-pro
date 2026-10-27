import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  CheckCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';

export const SignupPage = () => {
  const { plans, updateShowroomSettings, updateUserProfile, updateSubscriptionPlan, signUp, isSupabaseConfigured } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    showroomName: '',
    businessCategory: 'Automotive Dealership',
    businessAddress: '',
    country: 'Pakistan',
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = "Owner's full name is required";
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please provide a valid email';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    if (!formData.showroomName.trim()) errs.showroomName = 'Showroom name is required';
    if (!formData.businessAddress.trim()) errs.businessAddress = 'Business address is required';
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!formData.acceptTerms) {
      errs.acceptTerms = 'You must accept the terms & conditions';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await signUp({ email: formData.email, password: formData.password, metadata: { fullName: formData.fullName, phone: formData.phone, showroomName: formData.showroomName, businessCategory: formData.businessCategory, businessAddress: formData.businessAddress, country: formData.country } });
      updateShowroomSettings({ name: formData.showroomName, category: formData.businessCategory, address: formData.businessAddress, country: formData.country, email: formData.email, phone: formData.phone });
      updateUserProfile({ fullName: formData.fullName, email: formData.email, phone: formData.phone });
      updateSubscriptionPlan('showroom');
      toast.success(isSupabaseConfigured && !result?.data?.session ? 'Account created. Check your email to confirm before signing in.' : `Showroom "${formData.showroomName}" created! Welcome to Showroom Pro.`, 'Registration Complete');
      navigate(isSupabaseConfigured && !result?.data?.session ? '/login' : '/dashboard');
    } catch (error) {
      toast.error(error.message || 'Unable to create account.', 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-slate-900 dark:text-white">
              Showroom<span className="text-blue-600 dark:text-blue-400">Pro</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Create Your Showroom Account
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Start with the complete showroom system, unlimited partner accounts, and monthly billing at Rs. 10,000.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl border border-slate-200 dark:border-slate-800 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Owner Details */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>1. Showroom Owner Details</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Tariq Mansoor"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.fullName && <p className="text-[11px] text-rose-500 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.phone && <p className="text-[11px] text-rose-500 mt-1">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="director@myshowroom.com"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 pr-10 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] text-rose-500 mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.confirmPassword && <p className="text-[11px] text-rose-500 mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Showroom Business Information */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>2. Showroom Information</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Showroom Name *
                  </label>
                  <input
                    type="text"
                    value={formData.showroomName}
                    onChange={(e) => setFormData({ ...formData, showroomName: e.target.value })}
                    placeholder="e.g. UrbanVolt EV Showroom"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.showroomName && <p className="text-[11px] text-rose-500 mt-1">{errors.showroomName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Category
                  </label>
                  <select
                    value={formData.businessCategory}
                    onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Automotive Dealership">Automotive Dealership</option>
                    <option value="Electronics & Appliances">Electronics & Appliances</option>
                    <option value="Luxury Watches & Jewelry">Luxury Watches & Jewelry</option>
                    <option value="Furniture & Home Décor">Furniture & Home Décor</option>
                    <option value="Two-Wheeler & Bikes">Two-Wheeler & Bikes</option>
                    <option value="Hardware & Machinery">Hardware & Machinery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Business Address *
                  </label>
                  <input
                    type="text"
                    value={formData.businessAddress}
                    onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                    placeholder="Plot #, Street, Commercial Area"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {errors.businessAddress && <p className="text-[11px] text-rose-500 mt-1">{errors.businessAddress}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Pakistan">Pakistan (PKR)</option>
                    <option value="United Arab Emirates">United Arab Emirates (AED)</option>
                    <option value="Saudi Arabia">Saudi Arabia (SAR)</option>
                    <option value="United States">United States (USD)</option>
                    <option value="United Kingdom">United Kingdom (GBP)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Single monthly subscription */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>3. Your Showroom Pro Plan</span>
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                One simple plan includes complete showroom operations and unlimited partners.
              </p>

              <div className="grid grid-cols-1 max-w-md gap-3">
                {plans.map((p) => {
                  return (
                    <div
                      key={p.id}
                      className="relative p-4 rounded-xl border border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-600/30 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {p.name}
                          </span>
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Rs. {Number(p.monthlyPrice).toLocaleString('en-PK')} / month</span>
                        </div>
                        <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">All features · Unlimited partners</div>
                      </div>
                      <div className="mt-3 text-[11px] text-slate-500">
                        {p.id === 'showroom' && 'Complete EV bike showroom office'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  I accept the Showroom Pro Terms of Service, Privacy Policy, and understand that in this Phase 1 preview, actions operate on simulated frontend demo state.
                </span>
              </label>
              {errors.acceptTerms && <p className="text-[11px] text-rose-500 mt-1">{errors.acceptTerms}</p>}
            </div>

            <Button type="submit" size="lg" variant="primary" className="w-full">
              Complete Registration & Enter Showroom
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
