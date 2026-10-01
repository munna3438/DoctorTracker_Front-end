'use client';

import { useState, type ReactNode } from 'react';
import { ApiError, apiDelete } from '@/lib/api';
import { Modal } from './Modal';
import { Button } from './ui';

/**
 * Delete button with a confirmation step, so a destructive action
 * is never one misclick away.
 */
export function DeleteButton({
  path,
  label,
  question,
  onDeleted,
  children,
}: {
  path: string;
  label: string;
  question: string;
  onDeleted: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    try {
      await apiDelete(path);
      onDeleted();
      setOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the record');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)}>{children}</span>

      <Modal open={open} title={label} onClose={() => setOpen(false)}>
        <p className="text-sm text-ink-600">{question}</p>
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Yes, delete'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
