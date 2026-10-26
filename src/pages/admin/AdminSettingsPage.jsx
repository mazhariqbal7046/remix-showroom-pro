import React, { useState } from 'react';
import {
  Settings,
  Shield,
  DollarSign,
  Mail,
  Sliders,
  AlertTriangle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';

export const AdminSettingsPage = () => {
  const { platformSettings, formatAmount } = useApp();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    platformName: platformSettings.platformName || 'Showroom Pro Enterprise SaaS',
    supportEmail: platformSettings.supportEmail || 'support@showroompro.io',
    defaultCurrency: platformSettings.defaultCurrency || 'PKR',
    trialDays: platformSettings.trialDurationDays || 14,
    reminderDays: platformSettings.reminderDaysBeforeExpiry || 7,
    allowSignups: true,
    maintenanceMode: false,
  });

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Platform configurations updated in demo state.', 'Settings Saved');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Global Platform Governance Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global parameters controlling tenant onboarding, trial periods, and default currency.
          </p>
        </div>

        <Button variant="primary" icon={Save} onClick={handleSave}>
          Save Platform Config
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & identity */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            1. Platform Brand Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                SaaS Platform Title
              </label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Central Operations Support Email
              </label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Subscription Policies */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            2. Tenant Trial & Expiry Policies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Default Currency Code
              </label>
              <select
                value={settings.defaultCurrency}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
              >
                <option value="PKR">Pakistani Rupee (PKR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="AED">UAE Dirham (AED)</option>
                <option value="SAR">Saudi Riyal (SAR)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Free Trial Duration (Days)
              </label>
              <input
                type="number"
                min="3"
                value={settings.trialDays}
                onChange={(e) => setSettings({ ...settings, trialDays: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expiry Notice Horizon (Days)
              </label>
              <input
                type="number"
                min="1"
                value={settings.reminderDays}
                onChange={(e) => setSettings({ ...settings, reminderDays: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
              />
            </div>
          </div>
        </div>

        {/* Feature Flags & Controls */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-3 border-b border-slate-800">
            3. Platform Governance Controls
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="font-semibold text-white">Public Showroom Self-Registration</span>
                <p className="text-[11px] text-slate-400">Allow dealers to enroll directly from the public landing page</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSignups}
                onChange={(e) => setSettings({ ...settings, allowSignups: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
              <div>
                <span className="font-semibold text-white">Platform Maintenance Mode</span>
                <p className="text-[11px] text-slate-400">Temporarily suspend tenant access for database migrations</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="lg">
            Save Platform Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
