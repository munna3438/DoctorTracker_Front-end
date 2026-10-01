'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { toQueryString } from '@/lib/api';
import { useApi, useSearchBox } from '@/lib/hooks';
import { formatDate, initials } from '@/lib/format';
import type { Doctor, DoctorFilters } from '@/lib/types';
import { DeleteButton } from '@/components/DeleteButton';
import { DoctorForm } from '@/components/DoctorForm';
import { ListToolbar } from '@/components/ListToolbar';
import { Pagination } from '@/components/Pagination';
import {
  Avatar,
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

const DEFAULTS = { search: '', specialization: '', hospital: '', from: '', to: '', sort: '-createdAt', limit: '10', page: '1' };

function DoctorsView() {
  const router = useRouter();
  const [filters, setFilters, search, setSearch] = useSearchBox(DEFAULTS);
  const [editing, setEditing] = useState<Doctor | null>(null);
  const [creating, setCreating] = useState(false);

  const query = toQueryString({
    search: filters.search,
    specialization: filters.specialization,
    hospital: filters.hospital,
    from: filters.from,
    to: filters.to,
    sort: filters.sort,
    limit: filters.limit,
    page: filters.page,
  });

  const { data, meta, error, loading, reload } = useApi<Doctor[]>(`/doctors${query}`);
  const { data: options } = useApi<DoctorFilters>('/doctors/filters');

  const activeFilters = ['specialization', 'hospital', 'from', 'to'].filter((key) => filters[key]).length;
  const refresh = () => {
    reload();
    router.refresh();
  };

  return (
    <>
      <PageHeader
        title="Doctors"
        subtitle="Create, search and filter the doctors in your network."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Add doctor
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
            <Field label="Specialization">
              <Select
                value={filters.specialization}
                onChange={(event) => setFilters({ specialization: event.target.value, page: '1' })}
              >
                <option value="">All specializations</option>
                {options?.specializations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="w-full sm:w-52">
            <Field label="Hospital">
              <Select value={filters.hospital} onChange={(event) => setFilters({ hospital: event.target.value, page: '1' })}>
                <option value="">All hospitals</option>
                {options?.hospitals.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="w-full sm:w-40">
            <Field label="Added from">
              <Input type="date" value={filters.from} onChange={(event) => setFilters({ from: event.target.value, page: '1' })} />
            </Field>
          </div>

          <div className="w-full sm:w-40">
            <Field label="Added to">
              <Input type="date" value={filters.to} onChange={(event) => setFilters({ to: event.target.value, page: '1' })} />
            </Field>
          </div>
        </ListToolbar>

        {error && <div className="p-4"><ErrorBlock message={error} onRetry={reload} /></div>}

        {loading && !data && <LoadingBlock label="Loading doctors" />}

        {data && data.length === 0 && (
          <EmptyState
            title="No doctors match these filters"
            hint="Try a different search term, or clear the filters to see everyone."
          />
        )}

        {data && data.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink-100 text-xs tracking-wide text-ink-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Doctor</th>
                    <th className="px-4 py-3 font-medium">Specialization</th>
                    <th className="px-4 py-3 font-medium">Hospital</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Added</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {data.map((doctor) => (
                    <tr key={doctor._id} className="transition-colors hover:bg-ink-50/70">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar label={initials(doctor.name)} />
                          <div className="min-w-0">
                            <Link
                              href={`/doctors/${doctor._id}`}
                              className="block truncate font-medium text-ink-900 hover:text-brand-600"
                            >
                              {doctor.name}
                            </Link>
                            <p className="truncate text-xs text-ink-500">{doctor.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-700">{doctor.specialization}</td>
                      <td className="px-4 py-3 text-ink-700">{doctor.hospital}</td>
                      <td className="px-4 py-3 text-ink-700">{doctor.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-ink-500">{formatDate(doctor.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/doctors/${doctor._id}`}
                            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
                            aria-label={`View ${doctor.name}`}
                          >
                            <Eye className="size-4" />
                          </Link>
                          <button
                            onClick={() => setEditing(doctor)}
                            className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
                            aria-label={`Edit ${doctor.name}`}
                          >
                            <Pencil className="size-4" />
                          </button>
                          <DeleteButton
                            path={`/doctors/${doctor._id}`}
                            label="Delete doctor"
                            question={`Delete ${doctor.name}? This also removes every patient under this doctor.`}
                            onDeleted={refresh}
                          >
                            <button
                              className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Delete ${doctor.name}`}
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
              {data.map((doctor) => (
                <li key={doctor._id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar label={initials(doctor.name)} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/doctors/${doctor._id}`} className="font-medium text-ink-900">
                        {doctor.name}
                      </Link>
                      <p className="text-sm text-ink-600">{doctor.specialization}</p>
                      <p className="truncate text-xs text-ink-500">{doctor.hospital}</p>
                      <p className="mt-1 text-xs text-ink-400">
                        {doctor.phone} · added {formatDate(doctor.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link
                        href={`/doctors/${doctor._id}`}
                        className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
                        aria-label={`View ${doctor.name}`}
                      >
                        <Eye className="size-4" />
                      </Link>
                      <button
                        onClick={() => setEditing(doctor)}
                        className="rounded-lg p-2 text-ink-500 hover:bg-ink-100"
                        aria-label={`Edit ${doctor.name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <DeleteButton
                        path={`/doctors/${doctor._id}`}
                        label="Delete doctor"
                        question={`Delete ${doctor.name}? This also removes every patient under this doctor.`}
                        onDeleted={refresh}
                      >
                        <button
                          className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
                          aria-label={`Delete ${doctor.name}`}
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

      {creating && <DoctorForm open onClose={() => setCreating(false)} onSaved={refresh} />}
      {editing && (
        <DoctorForm key={editing._id} open doctor={editing} onClose={() => setEditing(null)} onSaved={refresh} />
      )}
    </>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense>
      <DoctorsView />
    </Suspense>
  );
}
