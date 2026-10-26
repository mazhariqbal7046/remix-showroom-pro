import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  Trash2,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDateTime } from '../../utils/formatters';

export const NotificationsPage = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useApp();

  const { toast } = useToast();
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'warning'

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread') return !n.read;
      if (filter === 'warning') return n.type === 'warning';
      return true;
    });
  }, [notifications, filter]);

  const handleMarkAll = () => {
    markAllNotificationsRead();
    toast.success('All notifications marked as read.', 'Updated');
  };

  const handleClear = () => {
    clearNotifications();
    toast.info('Notifications history cleared.', 'Cleared');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Activity & System Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time alerts for low stock levels, subscription renewals, and partner quota notices.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={Check} onClick={handleMarkAll}>
            Mark All Read
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={handleClear}>
            Clear History
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'warning'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Warnings Only
        </button>
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications to display"
          description="You're completely caught up! New events and stock alerts will appear here."
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const IconComp = {
              warning: AlertTriangle,
              success: CheckCircle2,
              info: Info,
            }[notif.type] || Info;

            const iconColors = {
              warning: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
              success: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
              info: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60',
            }[notif.type] || 'text-slate-500 bg-slate-50';

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  !notif.read
                    ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900/60 shadow-xs ring-1 ring-blue-500/10'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColors}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {formatDateTime(notif.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {notif.link && (
                    <Link
                      to={notif.link}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <span>Take Action</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {!notif.read && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
