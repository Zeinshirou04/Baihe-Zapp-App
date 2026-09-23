import 'server-only';
import { prisma } from '@/db/client';

export async function getAllSeries() {
  return prisma.series.findMany({
    orderBy: { createdAt: 'desc' },
    where: { status: { not: 'HIATUS' } },
  });
}

export async function getSeriesList() {
  return prisma.series.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { episodes: true } },
    },
  });
}

export async function getSeriesBySlug(slug: string) {
  return prisma.series.findUnique({
    where: { slug },
    include: {
      cast: {
        include: { person: true },
        orderBy: { sortOrder: 'asc' },
      },
      episodes: {
        orderBy: { number: 'asc' },
      },
    },
  });
}

export async function getSeriesById(id: string) {
  return prisma.series.findUnique({
    where: { id },
    include: {
      _count: { select: { episodes: true } },
    },
  });
}