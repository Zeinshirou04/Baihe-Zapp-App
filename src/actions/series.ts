"use server";
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';

const seriesSchema = z.object({
  titleHanzi: z.string().min(1),
  titleLatin: z.string().min(1),
  titlePinyin: z.string().optional().nullable(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  synopsis: z.string().optional().nullable(),
  posterPath: z.string().optional().nullable(),
  status: z.enum(['ONGOING', 'COMPLETED', 'HIATUS']).default('ONGOING'),
  year: z.number().int().positive().optional().nullable(),
});

export async function createSeries(data: z.infer<typeof seriesSchema>) {
  await requireAdmin();
  const validated = seriesSchema.parse(data);
  const series = await prisma.series.create({ data: validated });
  revalidatePath('/admin/series');
  return series;
}

export async function updateSeries(id: string, data: Partial<z.infer<typeof seriesSchema>>) {
  await requireAdmin();
  const validated = seriesSchema.partial().parse(data);
  const series = await prisma.series.update({ where: { id }, data: validated });
  revalidatePath('/admin/series');
  revalidatePath(`/admin/series/${id}/edit`);
  return series;
}

export async function deleteSeries(id: string) {
  await requireAdmin();
  await prisma.series.delete({ where: { id } });
  revalidatePath('/admin/series');
}