import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SeriesForm } from '../SeriesForm';

export const metadata = { title: 'Add Series' };

export default async function NewSeriesPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  return <SeriesForm initialData={{}} actionUrl="/admin/series/new" />;
}