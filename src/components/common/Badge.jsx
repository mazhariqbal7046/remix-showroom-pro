import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md', className = '' }) => {
  const variantStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    primary: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
  }[variant] || 'bg-slate-100 text-slate-700 border-slate-200';

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variantStyles} ${sizeStyles} ${className}`}>
      {children}
    </span>
  );
};

export const getStatusBadgeVariant = (status) => {
  const map = {
    'Active': 'success',
    'In Stock': 'success',
    'Paid': 'success',
    'Operational': 'success',
    'Low Stock': 'warning',
    'Partially Paid': 'warning',
    'Expiring Soon': 'warning',
    'Pending': 'warning',
    'Trial': 'indigo',
    'Out of Stock': 'danger',
    'Expired': 'danger',
    'Cancelled': 'danger',
    'Failed': 'danger',
    'Suspended': 'danger',
  };
  return map[status] || 'neutral';
};
