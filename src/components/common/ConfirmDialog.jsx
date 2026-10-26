import React from 'react';
import { AlertTriangle, Trash2, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
}) => {
  const isDanger = variant === 'danger';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center p-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
          isDanger ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
        }`}>
          {isDanger ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
        </div>

        <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-2">
          {title}
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose} className="w-full">
            {cancelText}
          </Button>
          <Button
            variant={isDanger ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
