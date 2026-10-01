'use client';

import { useState, type FormEvent } from 'react';
import { ApiError, apiPost, apiPut } from '@/lib/api';
import type { DoctorInput } from '@/lib/types';
import { Modal } from './Modal';
import { Button, Field, Input } from './ui';

const EMPTY: DoctorInput = { name: '', specialization: '', hospital: '', phone: '', email: '' };

/**
 * Create / edit form for a doctor.
 * The parent mounts this only while the dialog is open and sets `key` to the
 * doctor id, so a fresh form starts every time without extra state juggling.
 */
export function DoctorForm({
  open,
  doctor,
  onClose,
  onSaved,
}: {
  open: boolean;
  doctor?: DoctorInput & { _id: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<DoctorInput>(() =>
    doctor
      ? {
          name: doctor.name,
          specialization: doctor.specialization,
          hospital: doctor.hospital,
          phone: doctor.phone,
          email: doctor.email,
        }
      : EMPTY
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update(field: keyof DoctorInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (doctor) await apiPut(`/doctors/${doctor._id}`, form);
      else await apiPost('/doctors', form);

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the doctor');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={doctor ? 'Edit doctor' : 'Add new doctor'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Full name">
          <Input
            required
            minLength={2}
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Dr. Aisha Rahman"
          />
        </Field>

        <Field label="Specialization">
          <Input
            required
            minLength={2}
            value={form.specialization}
            onChange={(event) => update('specialization', event.target.value)}
            placeholder="Cardiology"
          />
        </Field>

        <Field label="Hospital">
          <Input
            required
            minLength={2}
            value={form.hospital}
            onChange={(event) => update('hospital', event.target.value)}
            placeholder="City General Hospital"
          />
        </Field>

        <Field label="Phone">
          <Input
            required
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="+91 98765 43210"
          />
        </Field>

        <Field label="Email">
          <Input
            required
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="doctor@hospital.org"
          />
        </Field>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : doctor ? 'Save changes' : 'Add doctor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
