'use client';

import { useState, type FormEvent } from 'react';
import { ApiError, apiPost, apiPut } from '@/lib/api';
import { GENDERS, STATUSES, type Doctor, type Patient, type PatientInput } from '@/lib/types';
import { formatDate, titleCase } from '@/lib/format';
import { Modal } from './Modal';
import { Button, Field, Input, Select } from './ui';

function emptyForm(doctorId: string): PatientInput {
  return {
    doctor: doctorId,
    name: '',
    age: 30,
    gender: 'other',
    phone: '',
    email: '',
    condition: '',
    status: 'active',
    visitDate: new Date().toISOString().slice(0, 10),
    notes: '',
  };
}

function toForm(patient: Patient): PatientInput {
  return {
    doctor: patient.doctor._id,
    name: patient.name,
    age: patient.age,
    gender: patient.gender,
    phone: patient.phone,
    email: patient.email,
    condition: patient.condition,
    status: patient.status,
    visitDate: patient.visitDate.slice(0, 10),
    notes: patient.notes,
  };
}

/** Create / edit form for a patient. `lockedDoctor` is used on a doctor's page. */
export function PatientForm({
  open,
  patient,
  doctors,
  lockedDoctor = '',
  onClose,
  onSaved,
}: {
  open: boolean;
  patient?: Patient;
  doctors: Pick<Doctor, '_id' | 'name'>[];
  lockedDoctor?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PatientInput>(() =>
    patient ? toForm(patient) : emptyForm(lockedDoctor || doctors[0]?._id || '')
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof PatientInput>(field: K, value: PatientInput[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (patient) await apiPut(`/patients/${patient._id}`, form);
      else await apiPost('/patients', form);

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the patient');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title={patient ? 'Edit patient' : 'Add new patient'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Patient name">
          <Input
            required
            minLength={2}
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Amina Khan"
          />
        </Field>

        <Field label="Doctor">
          <Select
            required
            value={form.doctor}
            onChange={(event) => update('doctor', event.target.value)}
            disabled={Boolean(lockedDoctor)}
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Age">
          <Input
            required
            type="number"
            min={0}
            max={120}
            value={form.age}
            onChange={(event) => update('age', Number(event.target.value))}
          />
        </Field>

        <Field label="Gender">
          <Select value={form.gender} onChange={(event) => update('gender', event.target.value as PatientInput['gender'])}>
            {GENDERS.map((gender) => (
              <option key={gender} value={gender}>
                {titleCase(gender)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Phone">
          <Input
            required
            value={form.phone}
            onChange={(event) => update('phone', event.target.value)}
            placeholder="+91 98765 43210"
          />
        </Field>

        <Field label="Email" hint="Optional">
          <Input
            type="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            placeholder="patient@mail.com"
          />
        </Field>

        <Field label="Condition">
          <Input
            required
            minLength={2}
            value={form.condition}
            onChange={(event) => update('condition', event.target.value)}
            placeholder="Hypertension"
          />
        </Field>

        <Field label="Status">
          <Select
            value={form.status}
            onChange={(event) => update('status', event.target.value as PatientInput['status'])}
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {titleCase(status)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Visit date" hint={`Today is ${formatDate(new Date().toISOString())}`}>
          <Input
            required
            type="date"
            value={form.visitDate.slice(0, 10)}
            onChange={(event) => update('visitDate', event.target.value)}
          />
        </Field>

        <Field label="Notes" hint="Optional">
          <Input
            value={form.notes}
            maxLength={500}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="Follow up in 2 weeks"
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
            {saving ? 'Saving…' : patient ? 'Save changes' : 'Add patient'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
