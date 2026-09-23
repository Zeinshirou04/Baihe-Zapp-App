import 'server-only';
import { prisma } from '@/db/client';

export async function getSeriesPosters(seriesId: string) {
  return prisma.poster.findMany({
    where: { seriesId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSeriesThumbnail(seriesId: string) {
  return prisma.poster.findFirst({
    where: { seriesId, isThumb: true },
    orderBy: { createdAt: 'desc' },
  });
}