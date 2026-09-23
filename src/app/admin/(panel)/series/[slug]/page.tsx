import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/db/client';
import { SeriesDetailClient } from '../SeriesDetailClient';

export const metadata = { title: 'Series Detail' };

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const { slug } = await params;
  const series = await prisma.series.findUnique({
    where: { slug },
    include: {
      cast: { include: { person: true }, orderBy: { sortOrder: 'asc' } },
      episodes: { orderBy: { number: 'asc' } },
      posters: { orderBy: { createdAt: 'desc' } },
      _count: { select: { episodes: true } },
    },
  });

  if (!series) {
    redirect('/admin/series');
  }

  return <SeriesDetailClient series={series} />;
}