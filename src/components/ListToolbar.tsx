'use client';

import { RotateCcw, Search } from 'lucide-react';
import { Button, Input, Select } from './ui';

export const PAGE_SIZES = ['10', '25', '50'];

export const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: 'name', label: 'Name A–Z' },
  { value: '-name', label: 'Name Z–A' },
];

/**
 * Search box + filter row shared by the Doctors and Patients screens.
 * Every control writes to the URL, so the current view is always shareable.
 */
export function ListToolbar({
  search,
  onSearch,
  sort,
  onSort,
  limit,
  onLimit,
  activeFilters,
  onReset,
  children,
}: {
  search: string;
  onSearch: (value: string) => void;
  sort: string;
  onSort: (value: string) => void;
  limit: string;
  onLimit: (value: string) => void;
  activeFilters: number;
  onReset: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-b border-ink-100 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" />
          <Input
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search by name, email, hospital, phone…"
            className="pl-9"
            aria-label="Search"
            type="search"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeFilters > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw className="size-3.5" />
              Clear ({activeFilters})
            </Button>
          )}
          <Select value={sort} onChange={(event) => onSort(event.target.value)} aria-label="Sort" className="w-auto">
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Select
            value={limit}
            onChange={(event) => onLimit(event.target.value)}
            aria-label="Rows per page"
            className="w-auto"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </Select>
        </div>
      </div>

      {children && <div className="flex flex-wrap items-end gap-3">{children}</div>}
    </div>
  );
}
