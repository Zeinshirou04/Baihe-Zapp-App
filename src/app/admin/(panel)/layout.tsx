import { getFlash } from '@/lib/flash';
import { getSessionUser } from '@/lib/auth';
import { AdminPanelClient } from './AdminPanelClient';

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const [flash, user] = await Promise.all([getFlash(), getSessionUser()]);
  return (
    <AdminPanelClient initialFlash={flash} user={user}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </div>
    </AdminPanelClient>
  );
}