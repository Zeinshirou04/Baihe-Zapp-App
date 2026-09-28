import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/db/client';
import { EpisodeEditorClient } from './EpisodeEditorClient';

export const metadata = { title: 'Episode Editor' };

export default async function EpisodeEditorPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const { slug, id } = await params;

  const episode = await prisma.episode.findUnique({
    where: { id },
    include: {
      series: { select: { slug: true, titleHanzi: true, id: true } },
      lines: { orderBy: { idx: 'asc' } },
      contributors: { include: { person: true } },
    },
  });

  if (!episode || episode.series.slug !== slug) {
    redirect(`/admin/series/${slug}`);
  }

  return <EpisodeEditorClient episode={episode} />;
}