import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  ShieldCheck,
  PieChart,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';

export const PartnersPage = () => {
  const {
    partners,
    partnerLimitInfo,
    addPartner,
    updatePartner,
    removePartner,
  } = useApp();

  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [viewPartner, setViewPartner] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'Commercial Partner',
    equityShare: '10%',
    ownershipPercentage: '10',
    profitSharingPercentage: '10',
    joiningDate: new Date().toISOString().slice(0, 10),
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredPartners = useMemo(() => {
    return partners.filter((p) => {
      return (
        p.fullName.toLowerCase().includes(search.toLowerCase()) ||
        p.role.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase()) ||
        p.phone.includes(search)
      );
    });
  }, [partners, search]);

  const openAddPartner = () => {
    setEditingPartner(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      role: 'Commercial & Sales Director',
      equityShare: '10%',
      ownershipPercentage: '10',
      profitSharingPercentage: '10',
      joiningDate: new Date().toISOString().slice(0, 10),
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditPartner = (p) => {
    setEditingPartner(p);
    setFormData({
      fullName: p.fullName,
      email: p.email,
      phone: p.phone,
      role: p.role,
      equityShare: p.equityShare || '10%',
      ownershipPercentage: String(p.ownershipPercentage ?? String(p.equityShare || '10').replace('%', '')),
      profitSharingPercentage: String(p.profitSharingPercentage ?? String(p.equityShare || '10').replace('%', '')),
      joiningDate: p.joiningDate,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Valid email required';
    }
    if (!formData.phone.trim()) errs.phone = 'Phone number is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingPartner) {
      updatePartner(editingPartner.id, formData);
      toast.success(`Partner ${formData.fullName} updated.`, 'Partner Updated');
      setModalOpen(false);
    } else {
      try {
        addPartner(formData);
        toast.success(`Partner ${formData.fullName} enrolled into showroom leadership.`, 'Partner Added');
        setModalOpen(false);
      } catch (err) {
        toast.error(err.message, 'Quota Exceeded');
      }
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      removePartner(deleteTarget.id);
      toast.info(`Partner ${deleteTarget.fullName} removed from active roster.`, 'Partner Removed');
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Showroom Partners & Leadership
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage co-owners, equity distribution, and executive governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="primary" icon={Plus} onClick={openAddPartner}>
            Add Partner
          </Button>
        </div>
      </div>

      {/* PARTNER LIMITS NOTIFICATION / STAT CARD */}
      <div className="p-5 rounded-2xl border shadow-xs transition-all bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Partner Access: Included in Showroom Pro
                </h3>
                <Badge variant="indigo" size="sm">Unlimited included</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {partnerLimitInfo.displayLimitText}. Unlimited showroom partner accounts are included in the Rs. 10,000 monthly plan.
              </p>
            </div>
          </div>

          <div className="w-full md:w-64 space-y-1.5 self-end md:self-auto">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span>Partner Accounts</span>
              <span>Unlimited</span>
            </div>
          </div>
        </div>
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                  {partner.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
                <Badge variant="success" size="sm">
                  {partner.status}
                </Badge>
              </div>

              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {partner.fullName}
              </h4>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-3">
                {partner.role}
              </p>

              <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{partner.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[170px]">{partner.email}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Equity Share:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Ownership {String(partner.ownershipPercentage ?? partner.equityShare).replace('%', '')}% · Profit {String(partner.profitSharingPercentage ?? partner.equityShare).replace('%', '')}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Joined: {formatDate(partner.joiningDate)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditPartner(partner)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Edit Partner"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(partner)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800"
                  title="Remove Partner"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Partner Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPartner ? 'Edit Partner Profile' : 'Add Showroom Partner'}
        subtitle="Unlimited partner accounts are included in your monthly plan."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Haris Abbasi"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            {formErrors.fullName && <p className="text-[11px] text-rose-500 mt-1">{formErrors.fullName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Official Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="partner@myshowroom.com"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            {formErrors.email && <p className="text-[11px] text-rose-500 mt-1">{formErrors.email}</p>}
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
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
            {formErrors.phone && <p className="text-[11px] text-rose-500 mt-1">{formErrors.phone}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Executive Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="Commercial & Sales Director">Commercial & Sales</option>
                <option value="Procurement & Imports Head">Procurement & Imports</option>
                <option value="Finance & Compliance Partner">Finance & Compliance</option>
                <option value="Operations & Service Partner">Operations & Service</option>
                <option value="Managing Partner">Managing Partner</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Ownership %<input type="number" min="0" max="100" value={formData.ownershipPercentage} onChange={(e) => setFormData({ ...formData, ownershipPercentage: e.target.value, equityShare: `${e.target.value}%` })} className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" /></label>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Profit sharing %<input type="number" min="0" max="100" value={formData.profitSharingPercentage} onChange={(e) => setFormData({ ...formData, profitSharingPercentage: e.target.value })} className="mt-1 w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" /></label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Equity Share (%)
              </label>
              <input
                type="text"
                value={formData.equityShare}
                onChange={(e) => setFormData({ ...formData, equityShare: e.target.value })}
                placeholder="20%"
                className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[11px] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Partner details are stored in this showroom database. Partner login invitations are not configured yet.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingPartner ? 'Update Partner' : 'Add Partner'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Partner?"
        message={`Are you sure you want to remove ${deleteTarget?.fullName} from this showroom?`}
        confirmText="Remove Partner"
        variant="danger"
      />
    </div>
  );
};
