import 'server-only';
import { prisma } from '@/db/client';

export async function getEpisodeById(id: string) {
  return prisma.episode.findUnique({
    where: { id },
    include: {
      lines: { orderBy: { idx: 'asc' } },
      series: { select: { slug: true, titleHanzi: true } },
    },
  });
}

export async function getEpisodesBySeries(seriesId: string) {
  return prisma.episode.findMany({
    where: { seriesId },
    orderBy: { number: 'asc' },
    include: {
      _count: { select: { lines: true } },
    },
  });
}

export async function getEpisodesGlobal() {
  return prisma.episode.findMany({
    orderBy: [{ series: { createdAt: 'desc' } }, { number: 'asc' }],
    include: {
      series: { select: { id: true, titleHanzi: true, slug: true } },
      _count: { select: { lines: true } },
    },
  });
}

export async function getSeriesBySlug(slug: string) {
  return prisma.series.findUnique({
    where: { slug },
    include: {
      cast: { include: { person: true }, orderBy: { sortOrder: 'asc' } },
      episodes: { orderBy: { number: 'asc' } },
    },
  });
}