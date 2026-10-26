import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newToast = { id, title, message, type };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    warning: (message, title = 'Notice') => addToast({ type: 'warning', title, message }),
    info: (message, title = 'Information') => addToast({ type: 'info', title, message }),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const typeStyles = {
            success: 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/80 dark:border-emerald-700 dark:text-emerald-100',
            error: 'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/80 dark:border-rose-700 dark:text-rose-100',
            warning: 'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/80 dark:border-amber-700 dark:text-amber-100',
            info: 'bg-blue-50 border-blue-300 text-blue-900 dark:bg-blue-950/80 dark:border-blue-700 dark:text-blue-100',
          }[t.type];

          const IconComponent = {
            success: CheckCircle2,
            error: AlertCircle,
            warning: AlertTriangle,
            info: Info,
          }[t.type];

          const iconColor = {
            success: 'text-emerald-600 dark:text-emerald-400',
            error: 'text-rose-600 dark:text-rose-400',
            warning: 'text-amber-600 dark:text-amber-400',
            info: 'text-blue-600 dark:text-blue-400',
          }[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300 animate-in slide-in-from-right-8 ${typeStyles}`}
              role="alert"
            >
              <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                {t.title && <h4 className="text-sm font-semibold">{t.title}</h4>}
                <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
