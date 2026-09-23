"use server";
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';

const episodeSchema = z.object({
  seriesId: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  durationMs: z.number().int().nonnegative().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export async function createEpisode(data: z.infer<typeof episodeSchema>) {
  await requireAdmin();
  const validated = episodeSchema.parse(data);
  const episode = await prisma.episode.create({ data: validated });
  revalidatePath('/admin/episodes');
  revalidatePath(`/admin/episodes/${validated.seriesId}`);
  return episode;
}

export async function updateEpisode(id: string, data: Partial<z.infer<typeof episodeSchema>>) {
  await requireAdmin();
  const validated = episodeSchema.partial().parse(data);
  const episode = await prisma.episode.update({ where: { id }, data: validated });
  revalidatePath('/admin/episodes');
  if (episode.seriesId) revalidatePath(`/admin/episodes/${episode.seriesId}`);
  return episode;
}

export async function deleteEpisode(id: string) {
  await requireAdmin();
  const episode = await prisma.episode.delete({ where: { id } });
  revalidatePath('/admin/episodes');
  revalidatePath(`/admin/episodes/${episode.seriesId}`);
}