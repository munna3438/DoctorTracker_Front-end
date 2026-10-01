'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Pencil, Phone, Stethoscope, Trash2, UserPlus, Users } from 'lucide-react';
import { toQueryString } from '@/lib/api';
import { useApi, useSearchBox } from '@/lib/hooks';
import { formatDate, initials, titleCase } from '@/lib/format';
import type { Doctor, Patient } from '@/lib/types';
import { DeleteButton } from '@/components/DeleteButton';
import { DoctorForm } from '@/components/DoctorForm';
import { Pagination } from '@/components/Pagination';
import { PatientForm } from '@/components/PatientForm';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  Input,
  LoadingBlock,
  PageHeader,
  Select,
  Spinner,
} from '@/components/ui';

const DEFAULTS = { search: '', status: '', sort: '-visitDate', limit: '10', page: '1' };

/** Doctor profile plus the patients under this doctor. */
function DoctorDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [filters, setFilters, search, setSearch] = useSearchBox(DEFAULTS);
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [addingPatient, setAddingPatient] = useState(false);

  const { data: doctor, error: doctorError, loading: doctorLoading, reload: reloadDoctor } = useApi<Doctor>(
    `/doctors/${id}`
  );

  const patientQuery = toQueryString({
    search: filters.search,
    status: filters.status,
    sort: filters.sort,
    limit: filters.limit,
    page: filters.page,
  });

  const {
    data: patients,
    meta,
    error: patientsError,
    loading: patientsLoading,
    reload: reloadPatients,
  } = useApi<Patient[]>(`/doctors/${id}/patients${patientQuery}`);

  if (doctorError) return <ErrorBlock message={doctorError} onRetry={reloadDoctor} />;
  if (doctorLoading || !doctor) return <LoadingBlock label="Loading doctor" />;

  const reloadAll = () => {
    reloadPatients();
    reloadDoctor();
  };

  return (
    <>
      <Link
        href="/doctors"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800"
      >
        <ArrowLeft className="size-4" />
        Back to doctors
      </Link>

      <PageHeader
        title={doctor.name}
        subtitle={`${doctor.specialization} · ${doctor.hospital}`}
        actions={
          <>
            <Button variant="ghost" onClick={() => setEditingDoctor(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <DeleteButton
              path={`/doctors/${doctor._id}`}
              label="Delete doctor"
              question={`Delete ${doctor.name}? This also removes every patient under this doctor.`}
              onDeleted={() => router.replace('/doctors')}
            >
              <Button variant="danger">
                <Trash2 className="size-4" />
                Delete
              </Button>
            </DeleteButton>
          </>
        }
      />

      {/* Profile summary */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-4 p-5">
          <span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <Stethoscope className="size-5" />
          </span>
          <div>
            <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">Specialization</p>
            <p className="font-semibold text-ink-900">{doctor.specialization}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Building2 className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">Hospital</p>
            <p className="truncate font-semibold text-ink-900">{doctor.hospital}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <span className="grid size-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <Users className="size-5" />
          </span>
          <div>
            <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">Patients</p>
            <p className="font-semibold text-ink-900">{meta?.total ?? 0}</p>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">Contact</p>
          <a href={`tel:${doctor.phone}`} className="mt-1 flex items-center gap-1.5 text-sm text-ink-800 hover:text-brand-600">
            <Phone className="size-3.5" /> {doctor.phone}
          </a>
          <a
            href={`mailto:${doctor.email}`}
            className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-ink-800 hover:text-brand-600"
          >
            <Mail className="size-3.5" /> {doctor.email}
          </a>
        </Card>
      </div>

      {/* Patients of this doctor */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 p-4">
          <div>
            <h3 className="font-semibold text-ink-900">Patients</h3>
            <p className="text-sm text-ink-500">
              Added on {formatDate(doctor.createdAt)} · {meta?.total ?? 0} record(s)
            </p>
          </div>
          <Button onClick={() => setAddingPatient(true)}>
            <UserPlus className="size-4" />
            Add patient
          </Button>
        </div>

        <div className="flex flex-col gap-3 border-b border-ink-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search this doctor's patients by name, condition or phone…"
              aria-label="Search patients"
            />
          </div>
          <Select
            value={filters.status}
            onChange={(event) => setFilters({ status: event.target.value, page: '1' })}
            aria-label="Filter by status"
            className="sm:w-48"
          >
            <option value="">All statuses</option>
            {['active', 'recovered', 'critical'].map((status) => (
              <option key={status} value={status}>
                {titleCase(status)}
              </option>
            ))}
          </Select>        </div>

        {patientsError && (
          <div className="p-4">
            <ErrorBlock message={patientsError} onRetry={reloadPatients} />
          </div>
        )}

        {patientsLoading && !patients && <LoadingBlock label="Loading patients" />}

        {patients && patients.length === 0 && (
          <EmptyState title="No patients yet" hint="Add the first patient under this doctor." />
        )}

        {patients && patients.length > 0 && (
          <>
            <ul className="divide-y divide-ink-100">
              {patients.map((patient) => (
                <li key={patient._id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                  <Avatar label={initials(patient.name)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink-900">{patient.name}</p>
                    <p className="truncate text-xs text-ink-500">
                      {patient.condition} · {patient.age} yrs · visited {formatDate(patient.visitDate)}
                    </p>
                  </div>
                  <Badge value={patient.status}>{titleCase(patient.status)}</Badge>
                  <DeleteButton
                    path={`/patients/${patient._id}`}
                    label="Delete patient"
                    question={`Remove ${patient.name} from this doctor's patient list?`}
                    onDeleted={reloadAll}
                  >
                    <button
                      className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${patient.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </DeleteButton>
                </li>
              ))}
            </ul>

            {meta && <Pagination meta={meta} onPageChange={(page) => setFilters({ page: String(page) })} />}
          </>
        )}

        {patientsLoading && patients && (
          <p className="flex items-center justify-center gap-2 border-t border-ink-100 py-2 text-xs text-ink-400">
            <Spinner className="size-3" /> Updating…
          </p>
        )}
      </Card>

      {editingDoctor && (
        <DoctorForm key={doctor._id} open doctor={doctor} onClose={() => setEditingDoctor(false)} onSaved={reloadAll} />
      )}
      {addingPatient && (
        <PatientForm
          open
          lockedDoctor={doctor._id}
          doctors={[{ _id: doctor._id, name: doctor.name }]}
          onClose={() => setAddingPatient(false)}
          onSaved={reloadAll}
        />
      )}
    </>
  );
}

export default function DoctorDetail({ id }: { id: string }) {
  return (
    <Suspense>
      <DoctorDetailView id={id} />
    </Suspense>
  );
}
