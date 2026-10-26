import React, { useState } from 'react';
import {
  Settings,
  Building2,
  DollarSign,
  Globe,
  Bell,
  Palette,
  Save,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { COLOR_PALETTES, useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { CURRENCY_MAP } from '../../utils/formatters';

export const SettingsPage = () => {
  const { showroomInfo, updateShowroomSettings, resetDemoData } = useApp();
  const { theme, toggleTheme, palette, setPalette } = useTheme();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: showroomInfo.name || '',
    category: showroomInfo.category || '',
    email: showroomInfo.email || '',
    phone: showroomInfo.phone || '',
    address: showroomInfo.address || '',
    city: showroomInfo.city || '',
    country: showroomInfo.country || 'Pakistan',
    currency: showroomInfo.currency || 'PKR',
    taxNumber: showroomInfo.taxNumber || '',
    website: showroomInfo.website || '',
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reorderAlerts, setReorderAlerts] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateShowroomSettings(formData);
    toast.success('Showroom configurations and currency settings saved.', 'Settings Updated');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Showroom Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dealership business identity, regional currency, and interface preferences.
          </p>
        </div>

        <Button variant="primary" icon={Save} onClick={handleSubmit}>
          Save Settings
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Showroom Business Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Showroom Trade Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Physical Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                City / Region
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                NTN / Commercial Registration Number
              </label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Currency & Regional Preferences */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              2. Currency & Financial Formatting
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Active Display Currency *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
              >
                {Object.keys(CURRENCY_MAP).map((code) => (
                  <option key={code} value={code}>
                    {CURRENCY_MAP[code].label} ({CURRENCY_MAP[code].symbol})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Initial default is PKR (Pakistani Rupee). All POS invoices and catalogs adapt dynamically.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Country of Operation
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Pakistan">Pakistan</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Saudi Arabia">Saudi Arabia</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme & Display Options */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Palette className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3. Interface Appearance
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white">Color Theme</h4>
              <p className="text-xs text-slate-500">Toggle between professional clean light mode and high-contrast dark mode.</p>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2" role="radiogroup" aria-label="Color palette">
            {COLOR_PALETTES.map((option) => {
              const isSelected = palette === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setPalette(option.id)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20 dark:bg-slate-800'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-xs font-bold text-slate-900 dark:text-white">{option.name}</span>
                      <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">{option.description}</span>
                    </span>
                    {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />}
                  </span>
                  <span className="mt-3 flex gap-2" aria-hidden="true">
                    {option.colors.map((color) => (
                      <span key={color} className="h-6 flex-1 rounded-md border border-black/5" style={{ backgroundColor: color }} />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Palette changes apply immediately and are saved in this browser.</p>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" size="lg">
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};
