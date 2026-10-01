'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui';
import type { ListMeta } from '@/lib/types';

/** Page buttons with ellipsis so the control stays a fixed size on mobile. */
function pageNumbers(current: number, total: number) {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  return sorted.flatMap((page, index) =>
    index > 0 && page - sorted[index - 1] > 1 ? ['...' as const, page] : [page]
  );
}

export function Pagination({
  meta,
  onPageChange,
}: {
  meta: ListMeta;
  onPageChange: (page: number) => void;
}) {
  if (meta.total === 0) return null;

  const first = (meta.page - 1) * meta.limit + 1;
  const last = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 px-4 py-3 text-sm text-ink-600">
      <p>
        Showing <span className="font-medium text-ink-800">{first}</span>–
        <span className="font-medium text-ink-800">{last}</span> of{' '}
        <span className="font-medium text-ink-800">{meta.total}</span>
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
          Prev
        </Button>

        {pageNumbers(meta.page, meta.totalPages).map((page, index) =>
          page === '...' ? (
            <span key={`gap-${index}`} className="px-1.5 text-ink-400">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={page === meta.page ? 'page' : undefined}
              className={`size-8 rounded-lg text-sm font-medium transition-colors ${
                page === meta.page
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'
              }`}
            >
              {page}
            </button>
          )
        )}

        <Button
          variant="ghost"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
