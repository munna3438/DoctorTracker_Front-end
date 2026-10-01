'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toQueryString } from '@/lib/api';
import { useApi, useSearchBox } from '@/lib/hooks';
import { formatDate, initials, titleCase } from '@/lib/format';
import { GENDERS, STATUSES, type Doctor, type Patient, type PatientFilters } from '@/lib/types';
import { DeleteButton } from '@/components/DeleteButton';
import { ListToolbar } from '@/components/ListToolbar';
import { Pagination } from '@/components/Pagination';
import { PatientForm } from '@/components/PatientForm';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorBlock,
  Field,
  Input,
  LoadingBlock,
  PageHeader,
  Select,
  Spinner,
} from '@/components/ui';

const DEFAULTS = {
  search: '',
  doctor: '',
  condition: '',
  status: '',
  gender: '',
  from: '',
  to: '',
  sort: '-createdAt',
  limit: '10',
  page: '1',
};

function PatientsView() {
  const [filters, setFilters, search, setSearch] = useSearchBox(DEFAULTS);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [creating, setCreating] = useState(false);

  const query = toQueryString({
    search: filters.search,
    doctor: filters.doctor,
    condition: filters.condition,
    status: filters.status,
    gender: filters.gender,
    from: filters.from,
    to: filters.to,
    sort: filters.sort,
    limit: filters.limit,
    page: filters.page,
  });

  const { data, meta, error, loading, reload } = useApi<Patient[]>(`/patients${query}`);

  // The doctor dropdown needs every doctor, so it is fetched with a large limit.
  const { data: doctors } = useApi<Doctor[]>('/doctors?limit=100&sort=name');
  const { data: options } = useApi<PatientFilters>('/patients/filters');

  const activeFilters = ['doctor', 'condition', 'status', 'gender', 'from', 'to'].filter((key) => filters[key]).length;

  return (
    <>
      <PageHeader
        title="Patients"
        subtitle="Search, filter and update every patient record in the system."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Add patient
          </Button>
        }
      />

      <Card>
        <ListToolbar
          search={search}
          onSearch={setSearch}
          sort={filters.sort}
          onSort={(sort) => setFilters({ sort, page: '1' })}
          limit={filters.limit}
          onLimit={(limit) => setFilters({ limit, page: '1' })}
          activeFilters={activeFilters}
          onReset={() => setFilters({ ...DEFAULTS, search: filters.search })}
        >
          <div className="w-full sm:w-52">
            <Field label="Doctor">
              <Select value={filters.doctor} onChange={(event) => setFilters({ doctor: event.target.value, page: '1' })}>
                <option value="">All doctors</option>
                {doctors?.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="w-full sm:w-44">
            <Field label="Condition">
              <Select value={filters.condition} onChange={(event) => setFilters({ condition: event.target.value, page: '1' })}>
                <option value="">All conditions</option>
                {options?.conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="w-full sm:w-36">
            <Field label="Status">
              <Select value={filters.status} onChange={(event) => setFilters({ status: event.target.value, page: '1' })}>
                <option value="">All</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="w-full sm:w-36">
            <Field label="Gender">
              <Select value={filters.gender} onChange={(event) => setFilters({ gender: event.target.value, page: '1' })}>
                <option value="">All</option>
                {GENDERS.map((gender) => (
                  <option key={gender} value={gender}>
                    {titleCase(gender)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="w-full sm:w-40">
            <Field label="Visit from">
              <Input type="date" value={filters.from} onChange={(event) => setFilters({ from: event.target.value, page: '1' })} />
            </Field>
          </div>

          <div className="w-full sm:w-40">
            <Field label="Visit to">
              <Input type="date" value={filters.to} onChange={(event) => setFilters({ to: event.target.value, page: '1' })} />
            </Field>
          </div>
        </ListToolbar>

        {error && (
          <div className="p-4">
            <ErrorBlock message={error} onRetry={reload} />
          </div>
        )}

        {loading && !data && <LoadingBlock label="Loading patients" />}

        {data && data.length === 0 && (
          <EmptyState title="No patients match these filters" hint="Try a different search term or clear the filters." />
        )}

        {data && data.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Patient</th>
                    <th className="px-4 py-3 font-medium">Doctor</th>
                    <th className="px-4 py-3 font-medium">Condition</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Visit date</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {data.map((patient) => (
                    <tr key={patient._id} className="transition-colors hover:bg-ink-50/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar label={initials(patient.name)} />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink-900">{patient.name}</p>
                            <p className="truncate text-xs text-ink-500">
                              {patient.age} yrs · {titleCase(patient.gender)} · {patient.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/doctors/${patient.doctor?._id}`}
                          className="font-medium text-ink-800 hover:text-brand-600"
                        >
                          {patient.doctor?.name ?? '—'}
                        </Link>
                        <p className="text-xs text-ink-500">{patient.doctor?.specialization}</p>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{patient.condition}</td>
                      <td className="px-4 py-3">
                        <Badge value={patient.status}>{titleCase(patient.status)}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-500">{formatDate(patient.visitDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditing(patient)}
                            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
                            aria-label={`Edit ${patient.name}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <DeleteButton
                            path={`/patients/${patient._id}`}
                            label="Delete patient"
                            question={`Delete ${patient.name}? This cannot be undone.`}
                            onDeleted={reload}
                          >
                            <button
                              className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${patient.name}`}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </DeleteButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-ink-100 lg:hidden">
              {data.map((patient) => (
                <li key={patient._id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar label={initials(patient.name)} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink-900">{patient.name}</p>
                      <p className="text-sm text-ink-600">
                        {patient.condition} · {patient.age} yrs
                      </p>
                      <p className="truncate text-xs text-ink-500">
                        {patient.doctor?.name} · {formatDate(patient.visitDate)}
                      </p>
                      <div className="mt-2">
                        <Badge value={patient.status}>{titleCase(patient.status)}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setEditing(patient)}
                        className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
                        aria-label={`Edit ${patient.name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <DeleteButton
                        path={`/patients/${patient._id}`}
                        label="Delete patient"
                        question={`Delete ${patient.name}? This cannot be undone.`}
                        onDeleted={reload}
                      >
                        <button
                          className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${patient.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </DeleteButton>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {meta && <Pagination meta={meta} onPageChange={(page) => setFilters({ page: String(page) })} />}
          </>
        )}

        {loading && data && (
          <p className="flex items-center justify-center gap-2 border-t border-ink-100 py-2 text-xs text-ink-400">
            <Spinner className="size-3" /> Updating…
          </p>
        )}
      </Card>

      {creating && (
        <PatientForm open doctors={doctors ?? []} onClose={() => setCreating(false)} onSaved={reload} />
      )}
      {editing && (
        <PatientForm
          key={editing._id}
          open
          patient={editing}
          doctors={doctors ?? []}
          onClose={() => setEditing(null)}
          onSaved={reload}
        />
      )}
    </>
  );
}

export default function PatientsPage() {
  return (
    <Suspense>
      <PatientsView />
    </Suspense>
  );
}
