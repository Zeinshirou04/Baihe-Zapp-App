import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/db/client';
import { SeriesForm } from '../../SeriesForm';

export const metadata = { title: 'Edit Series' };

export default async function EditSeriesPage({
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
      _count: { select: { episodes: true } },
    },
  });

  if (!series) {
    redirect('/admin/series');
  }

  return (
    <SeriesForm
      initialData={{
        titleHanzi: series.titleHanzi,
        titleLatin: series.titleLatin,
        titlePinyin: series.titlePinyin,
        slug: series.slug,
        synopsis: series.synopsis,
        posterPath: series.posterPath,
        status: series.status,
        year: series.year,
      }}
      actionUrl={`/admin/series/${slug}/edit`}
    />
  );
}