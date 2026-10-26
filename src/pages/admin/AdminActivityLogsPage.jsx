import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { exportToCSV } from '../../utils/formatters';

export const AdminActivityLogsPage = () => {
  const { adminLogs } = useApp();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const filtered = useMemo(() => {
    return adminLogs.filter((log) => {
      const match =
        log.actor.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.target.toLowerCase().includes(search.toLowerCase());

      if (!match) return false;
      if (severityFilter !== 'all' && log.severity !== severityFilter) return false;

      return true;
    });
  }, [adminLogs, search, severityFilter]);

  const handleExport = () => {
    exportToCSV(
      'superadmin-activity-audit-log',
      filtered,
      [
        { key: 'id', label: 'Log ID' },
        { key: 'timestamp', label: 'Timestamp' },
        { key: 'actor', label: 'Actor' },
        { key: 'action', label: 'Action' },
        { key: 'target', label: 'Target / Entity' },
        { key: 'severity', label: 'Severity' },
      ]
    );
    toast.info('Exported activity audit log to CSV.', 'Audit Exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Platform Activity Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log trail of platform administrative actions, logins, and tenant modifications.
          </p>
        </div>

        <Button variant="secondary" size="md" onClick={handleExport}>
          Export Audit Trail
        </Button>
      </div>

      <SearchFilterBar
        searchQuery={search}
        onSearchChange={setSearch}
        placeholder="Filter by actor, action description, or target..."
        filterOptions={[
          { label: 'All Severities', value: 'all' },
          { label: 'Info', value: 'info' },
          { label: 'Warnings', value: 'warning' },
          { label: 'Critical', value: 'critical' },
        ]}
        selectedFilter={severityFilter}
        onFilterChange={setSeverityFilter}
        onExport={handleExport}
        exportLabel="Export CSV"
      />

      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Timestamp</th>
                <th className="py-3.5 px-6 font-semibold">Actor / User</th>
                <th className="py-3.5 px-6 font-semibold">Event Action</th>
                <th className="py-3.5 px-6 font-semibold">Target Entity</th>
                <th className="py-3.5 px-6 font-semibold">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-4 px-6 text-slate-400 font-mono">
                    {log.timestamp}
                  </td>
                  <td className="py-4 px-6 font-bold text-white">
                    {log.actor}
                  </td>
                  <td className="py-4 px-6 text-slate-200 font-medium">
                    {log.action}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {log.target}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      log.severity === 'warning'
                        ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                        : 'bg-blue-950/70 text-blue-300 border border-blue-800'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
