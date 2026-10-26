import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500 border border-transparent dark:bg-blue-600 dark:hover:bg-blue-500',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm focus:ring-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500 border border-transparent dark:bg-rose-600 dark:hover:bg-rose-500',
    outline: 'bg-transparent hover:bg-slate-100 text-slate-700 border border-slate-300 focus:ring-slate-400 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-900 focus:ring-slate-400 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
    accent: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm focus:ring-indigo-500 border border-transparent',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};
