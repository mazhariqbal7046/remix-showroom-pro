import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Users,
  Check,
  Edit2,
  Lock,
  ShieldCheck,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const AdminPlansPage = () => {
  const { plans, updatePlanConfig, formatAmount } = useApp();
  const { toast } = useToast();

  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: '',
  });

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      description: plan.description,
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editingPlan) return;

    // Save with STRICT partner limits retained
    updatePlanConfig(editingPlan.id, {
      name: formData.name,
      monthlyPrice: Number(formData.monthlyPrice) || 0,
      yearlyPrice: Number(formData.yearlyPrice) || 0,
      description: formData.description,
    });

    toast.success(`Platform configuration updated for ${editingPlan.name}. Partner quotas preserved.`, 'Plan Updated');
    setEditingPlan(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Subscription Plans & Partner Quotas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure global SaaS tiers, demo pricing rates, and enforce invariant partner caps.
          </p>
        </div>
      </div>

      {/* Strict Policy Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/60 text-xs text-blue-300 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-white">Hardcoded Partner Limit Invariants:</span>
          {' '}Basic allows max <span className="font-bold text-white">2 partners</span>. Business allows max <span className="font-bold text-white">6 partners</span>. Enterprise is <span className="font-bold text-white">unlimited</span>. These limits are globally protected and cannot be altered via edit forms.
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {plan.badge}
                </span>
                <Badge variant={plan.id === 'enterprise' ? 'indigo' : 'primary'} size="sm">
                  {plan.isUnlimitedPartners ? 'Unlimited Partners' : `Max ${plan.partnerLimit} Partners`}
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
              <p className="text-xs text-slate-400 mb-6">{plan.description}</p>

              {/* Pricing Display */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 mb-6 text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400">Monthly Demo Rate:</span>
                  <span className="text-base font-extrabold text-white">
                    {formatAmount(plan.monthlyPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-slate-800">
                  <span className="text-slate-400">Yearly Demo Rate:</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatAmount(plan.yearlyPrice)}
                  </span>
                </div>
              </div>

              {/* Locked Partner Quota Card */}
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-900/60 text-xs text-indigo-300 flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Enforced Partner Limit:</span>
                </div>
                <span className="font-bold text-white">
                  {plan.isUnlimitedPartners ? 'Unlimited' : `${plan.partnerLimit} Partners`}
                </span>
              </div>

              {/* Features list */}
              <div className="space-y-2 text-xs text-slate-400 mb-6">
                {plan.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="secondary"
              icon={Edit2}
              className="w-full"
              onClick={() => openEditModal(plan)}
            >
              Edit Plan Pricing
            </Button>
          </div>
        ))}
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <Modal
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          title={`Edit Pricing — ${editingPlan.name}`}
          subtitle="Configure demo pricing without altering immutable partner limits."
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plan Display Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monthly Rate (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.monthlyPrice}
                  onChange={(e) => setFormData({ ...formData, monthlyPrice: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Yearly Rate (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.yearlyPrice}
                  onChange={(e) => setFormData({ ...formData, yearlyPrice: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white"
              />
            </div>

            {/* Readonly partner limit indicator */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs flex justify-between items-center text-slate-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Immutable Partner Quota:
              </span>
              <span className="font-bold text-white">
                {editingPlan.isUnlimitedPartners ? 'Unlimited' : `${editingPlan.partnerLimit} Partners`}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Button variant="secondary" onClick={() => setEditingPlan(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Plan Configuration
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
