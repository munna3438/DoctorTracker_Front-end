import { AppShell } from '@/components/AppShell';
import { AuthGuard } from '@/components/AuthGuard';

/** Layout for every signed in screen: session check + navigation. */
export default function PortalLayout({ children }: LayoutProps<'/'>) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
