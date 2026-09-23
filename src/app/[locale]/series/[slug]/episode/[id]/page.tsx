import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEpisodeById } from '@/data/episodes';
import { EpisodeReader } from '@/components/EpisodeReader';

interface Props {
  params: Promise<{ locale: string; slug: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const episode = await getEpisodeById(id);
  if (!episode) return { title: 'Not Found' };
  return {
    title: `${episode.title || `Episode ${episode.number}`} · ${episode.series.titleHanzi}`,
    description: episode.series.titleHanzi,
  };
}

export default async function EpisodePage({ params }: Props) {
  const { locale, slug: _slug, id } = await params;
  const episode = await getEpisodeById(id);
  if (!episode || episode.series.slug !== _slug) notFound();

  return <EpisodeReader locale={locale} episode={episode} seriesSlug={_slug} />;
}