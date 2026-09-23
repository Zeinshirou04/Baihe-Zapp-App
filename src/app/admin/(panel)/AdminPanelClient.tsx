"use client";
import { LayoutShell } from '@/app/admin/_components/LayoutShell';

export function AdminPanelClient({
  children,
  initialFlash,
  user,
}: {
  children: React.ReactNode;
  initialFlash?: { type: 'success' | 'error'; message: string } | null;
  user: { name?: string | null; email: string } | null;
}) {
  return (
    <LayoutShell user={user} initialFlash={initialFlash}>
      {children}
    </LayoutShell>
  );
}