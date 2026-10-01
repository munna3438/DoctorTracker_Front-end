'use client';

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatNumber, titleCase } from '@/lib/format';

/* One palette for every chart so the dashboard reads as a single system. */
export const PALETTE = ['#3366ff', '#0ea5e9', '#7c3aed', '#f59e0b', '#16a34a', '#f43f5e', '#14b8a6'];

const axisProps = {
  stroke: '#8592a8',
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  contentStyle: {
    borderRadius: 12,
    border: '1px solid #eceff5',
    boxShadow: '0 10px 30px rgba(31, 36, 48, 0.08)',
    fontSize: 13,
  },
} as const;

/** Doctors vs patients added per month over the last 12 months. */
export function GrowthChart({ data }: { data: { label: string; doctors: number; patients: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3366ff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#3366ff" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#eceff5" vertical={false} />
        <XAxis dataKey="label" {...axisProps} />
        <YAxis {...axisProps} allowDecimals={false} />
        <Tooltip {...tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        <Area
          type="monotone"
          dataKey="patients"
          name="Patients added"
          stroke="#3366ff"
          strokeWidth={2}
          fill="url(#patientsFill)"
        />
        <Line
          type="monotone"
          dataKey="doctors"
          name="Doctors added"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

/** Top doctors by number of patients. */
export function PatientsPerDoctorChart({
  data,
}: {
  data: { name: string; patients: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 38)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 8 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#eceff5" horizontal={false} />
        <XAxis type="number" {...axisProps} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={140} {...axisProps} />
        <Tooltip {...tooltipStyle} cursor={{ fill: '#f6f8fb' }} />
        <Bar dataKey="patients" name="Patients" fill="#3366ff" radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Donut chart with the totals listed beside it. */
export function DonutChart({
  data,
  colors = PALETTE,
  nameLabel = 'Name',
}: {
  data: { name: string; value: number }[];
  colors?: string[];
  nameLabel?: string;
}) {
  const total = data.reduce((sum, row) => sum + row.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div className="w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={2}
              stroke="none"
            >
              {data.map((row, index) => (
                <Cell key={row.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full space-y-2 sm:w-1/2">
        {data.map((row, index) => (
          <li key={row.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ background: colors[index % colors.length] }}
              aria-hidden
            />
            <span className="truncate text-ink-600">{titleCase(row.name)}</span>
            <span className="ml-auto font-medium text-ink-900">{formatNumber(row.value)}</span>
            <span className="w-12 text-right text-xs text-ink-400">
              {total ? Math.round((row.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
        <li className="flex items-center gap-2 border-t border-ink-100 pt-2 text-sm font-medium">
          <span className="text-ink-600">{nameLabel}</span>
          <span className="ml-auto">{formatNumber(total)}</span>
        </li>
      </ul>
    </div>
  );
}

/** Most common patient conditions. */
export function ConditionsChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid strokeDasharray="4 4" stroke="#eceff5" vertical={false} />
        <XAxis dataKey="name" {...axisProps} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis {...axisProps} allowDecimals={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: '#f6f8fb' }} />
        <Bar dataKey="value" name="Patients" radius={[6, 6, 0, 0]} barSize={34}>
          {data.map((row, index) => (
            <Cell key={row.name} fill={PALETTE[index % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
