import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Shield,
  Camera,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const ProfilePage = () => {
  const { userProfile, updateUserProfile, activePlan } = useApp();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: userProfile.fullName || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    role: userProfile.role || 'Managing Partner',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(formData);
    toast.success('Your executive profile details were saved.', 'Profile Updated');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Executive Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Personal identity credentials and administrative role on Showroom Pro.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        {/* Avatar header */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <img
              src={userProfile.avatar}
              alt={userProfile.fullName}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-blue-100 dark:ring-blue-900/40"
            />
            <button
              type="button"
              onClick={() => toast.info('Profile photo upload is not configured yet.', 'Avatar')}
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-blue-600 text-white shadow-md hover:bg-blue-700"
              title="Change photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {userProfile.fullName}
              </h2>
              <Badge variant="primary" size="sm">
                {userProfile.role}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">{userProfile.email}</p>
            <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Full Showroom Administrator Access</span>
            </div>
          </div>
        </div>

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Executive Designation / Title
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
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
                Direct Mobile Phone
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="submit" variant="primary" icon={Save}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
