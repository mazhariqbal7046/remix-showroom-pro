import React from 'react';
import { Search, Download, Plus, Filter } from 'lucide-react';
import { Button } from './Button';

export const SearchFilterBar = ({
  searchQuery = '',
  onSearchChange,
  placeholder = 'Search records...',
  filterOptions = [],
  selectedFilter = 'all',
  onFilterChange,
  filterLabel = 'Filter',
  onExport,
  exportLabel = 'Export CSV',
  onAdd,
  addLabel = 'New Record',
  extraActions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9.5 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filter Dropdown */}
        {filterOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedFilter}
                onChange={(e) => onFilterChange && onFilterChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer font-medium"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Filter className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {extraActions}
        {onExport && (
          <Button
            variant="secondary"
            size="md"
            icon={Download}
            onClick={onExport}
          >
            {exportLabel}
          </Button>
        )}
        {onAdd && (
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={onAdd}
          >
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
