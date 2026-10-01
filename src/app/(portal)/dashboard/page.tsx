'use client';

import Link from 'next/link';
import { ArrowUpRight, Stethoscope, UserPlus, Users, UserRoundCheck } from 'lucide-react';
import { useApi } from '@/lib/hooks';
import { formatDate, formatNumber, titleCase } from '@/lib/format';
import type { DashboardData } from '@/lib/types';
import { ConditionsChart, DonutChart, GrowthChart, PatientsPerDoctorChart } from '@/components/charts';
import { Badge, Card, ErrorBlock, LoadingBlock, PageHeader, Spinner } from '@/components/ui';

const STAT_CARDS = [
  { key: 'doctors', label: 'Total doctors', icon: Stethoscope, tone: 'bg-brand-50 text-brand-600' },
  { key: 'patients', label: 'Total patients', icon: Users, tone: 'bg-emerald-50 text-emerald-600' },
  {
    key: 'newPatientsThisMonth',
    label: 'Patients this month',
    icon: UserPlus,
    tone: 'bg-amber-50 text-amber-600',
  },
  {
    key: 'avgPatientsPerDoctor',
    label: 'Avg patients / doctor',
    icon: UserRoundCheck,
    tone: 'bg-violet-50 text-violet-600',
  },
] as const;

export default function DashboardPage() {
  const { data, error, loading, reload } = useApi<DashboardData>('/stats/dashboard');

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of doctors, patients and how the clinic is growing."
        actions={
          <Link
            href="/patients"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-700"
          >
            View all patients
            <ArrowUpRight className="size-4" />
          </Link>
        }
      />

      {loading && <LoadingBlock label="Crunching the numbers" />}
      {error && <ErrorBlock message={error} onRetry={reload} />}

      {data && (
        <div className="space-y-6">
          {/* Headline numbers */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAT_CARDS.map((card) => (
              <Card key={card.key} className="flex items-center gap-4 p-5">
                <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${card.tone}`}>
                  <card.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium tracking-wide text-ink-500 uppercase">
                    {card.label}
                  </p>
                  <p className="text-2xl font-semibold tracking-tight text-ink-900">
                    {card.key === 'avgPatientsPerDoctor'
                      ? data.totals.avgPatientsPerDoctor
                      : formatNumber(data.totals[card.key])}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {/* Registrations over the last 12 months */}
            <Card className="p-5 xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-ink-900">Registrations over time</h3>
                  <p className="text-sm text-ink-500">Doctors and patients added each month</p>
                </div>
                <span className="hidden text-xs text-ink-400 sm:block">Last 12 months</span>
              </div>
              <GrowthChart data={data.monthly} />
            </Card>

            {/* Patients per doctor */}
            <Card className="p-5">
              <div className="mb-4">
                <h3 className="font-semibold text-ink-900">Patients per doctor</h3>
                <p className="text-sm text-ink-500">Busiest doctors right now</p>
              </div>
              {data.patientsPerDoctor.length ? (
                <PatientsPerDoctorChart data={data.patientsPerDoctor} />
              ) : (
                <p className="py-16 text-center text-sm text-ink-400">No patient data yet</p>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <Card className="p-5">
              <h3 className="mb-4 font-semibold text-ink-900">Patients by status</h3>
              {data.byStatus.length ? (
                <DonutChart data={data.byStatus} nameLabel="Patients" />
              ) : (
                <p className="py-16 text-center text-sm text-ink-400">No patient data yet</p>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="mb-4 font-semibold text-ink-900">Gender distribution</h3>
              {data.byGender.length ? (
                <DonutChart data={data.byGender} colors={['#0ea5e9', '#f43f5e', '#8592a8']} nameLabel="Patients" />
              ) : (
                <p className="py-16 text-center text-sm text-ink-400">No patient data yet</p>
              )}
            </Card>

            <Card className="p-5 lg:col-span-2 xl:col-span-1">
              <h3 className="mb-4 font-semibold text-ink-900">Top conditions</h3>
              {data.topConditions.length ? (
                <ConditionsChart data={data.topConditions} />
              ) : (
                <p className="py-16 text-center text-sm text-ink-400">No patient data yet</p>
              )}
            </Card>
          </div>

          {/* Latest activity */}
          <Card>
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <div>
                <h3 className="font-semibold text-ink-900">Recently added patients</h3>
                <p className="text-sm text-ink-500">The five newest records</p>
              </div>
              <Link href="/patients" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                See all
              </Link>
            </div>

            {data.recentPatients.length ? (
              <ul className="divide-y divide-ink-100">
                {data.recentPatients.map((patient) => (
                  <li key={patient._id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{patient.name}</p>
                      <p className="truncate text-xs text-ink-500">
                        {patient.condition} · {patient.doctor?.name ?? 'Unassigned'} · {formatDate(patient.createdAt)}
                      </p>
                    </div>
                    <Badge value={patient.status}>{titleCase(patient.status)}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-12 text-center text-sm text-ink-400">No patients have been added yet.</p>
            )}
          </Card>

          {loading && (
            <p className="flex items-center justify-center gap-2 text-xs text-ink-400">
              <Spinner className="size-3" /> Updating…
            </p>
          )}
        </div>
      )}
    </>
  );
}
