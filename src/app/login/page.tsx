'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, Eye, EyeOff } from 'lucide-react';
import { ApiError, apiPost } from '@/lib/api';
import { Button, Field, Input } from '@/components/ui';

const DEMO = { email: 'admin@doctortracker.dev', password: 'Admin@123' };

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState(DEMO);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiPost('/auth/login', form);
      router.replace('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong, please try again');
      setSubmitting(false);
    }
  }

  function fillDemo() {
    setForm(DEMO);
    setError(null);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel - hidden on mobile so the form gets the full width. */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink-900 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-brand-600/30 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden
        />

        <div className="relative flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand-600">
            <Activity className="size-5" />
          </span>
          <span className="text-lg font-semibold">Doctor Tracker</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl leading-tight font-semibold tracking-tight">
            Every doctor, every patient, one clear picture.
          </h1>
          <p className="mt-4 text-white/60">
            A secure admin portal to manage doctors and their patients, with search, filters and live clinic
            analytics.
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 text-sm">
            {[
              ['Doctors', 'Managed'],
              ['Patients', 'Tracked'],
              ['Analytics', 'Live'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-white/50">{label}</dt>
                <dd className="mt-1 text-lg font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative text-xs text-white/40">Restricted to authorised administrators only.</p>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-600 text-white">
              <Activity className="size-5" />
            </span>
            <span className="text-lg font-semibold text-ink-900">Doctor Tracker</span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-ink-900">Sign in</h2>
          <p className="mt-1.5 text-sm text-ink-500">Enter your admin credentials to open the portal.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <Field label="Email">
              <Input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="you@hospital.org"
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="••••••••"
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 grid w-11 place-items-center text-ink-400 hover:text-ink-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-ink-200 bg-white p-4 text-sm">
            <p className="font-medium text-ink-800">Demo account</p>
            <p className="mt-1 text-ink-500">
              {DEMO.email} / {DEMO.password}
            </p>
            <Button variant="subtle" size="sm" className="mt-3" onClick={fillDemo} type="button">
              Fill demo credentials
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
