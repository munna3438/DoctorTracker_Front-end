'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, LayoutDashboard, LogOut, Menu, Stethoscope, Users, X } from 'lucide-react';
import { apiDelete } from '@/lib/api';
import { initials } from '@/lib/format';
import { useAuth } from './AuthGuard';
import { Avatar, Button } from './ui';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/patients', label: 'Patients', icon: Users },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Sidebar + top bar. Collapses into a slide-in drawer on small screens. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await apiDelete('/auth/logout');
    } catch {
      // Even if the call fails the cookie is cleared by redirecting anyway.
    }
    router.replace('/login');
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-1" onClick={() => setMenuOpen(false)}>
        <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white">
          <Activity className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-white">Doctor Tracker</span>
          <span className="block text-xs text-white/50">Admin portal</span>
        </span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-brand-600 text-white' : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="size-4.5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-xl bg-white/5 p-3">
        <p className="text-xs text-white/50">Signed in as</p>
        <p className="truncate text-sm font-medium text-white">{user?.name}</p>
        <p className="truncate text-xs text-white/50">{user?.email}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-ink-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 bg-ink-900 lg:block">
        <div className="sticky top-0 h-screen">{sidebar}</div>
      </aside>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-ink-900/50"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-ink-900 shadow-xl">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-ink-200 bg-white/85 px-4 py-3 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>

          <h2 className="text-sm font-semibold text-ink-800">
            {NAV_ITEMS.find((item) => isActive(pathname, item.href))?.label ?? 'Doctor Tracker'}
          </h2>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-xs text-ink-500 sm:inline">{user?.role}</span>
            <Avatar label={initials(user?.name ?? 'A')} />
            <Button variant="ghost" size="sm" onClick={handleSignOut} disabled={signingOut}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
