import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateEpisodeSchema = z.object({
  number: z.number().int().positive().optional(),
  title: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  durationMs: z.number().int().nonnegative().optional().nullable(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const body = await req.json();
    const validated = updateEpisodeSchema.parse(body);

    const episode = await prisma.episode.update({
      where: { id },
      data: validated,
    });

    revalidatePath(`/admin/series/${episode.seriesId}`);
    revalidatePath(`/[locale]/series/${episode.seriesId}`);
    revalidatePath(`/admin/episodes/${id}/lines`);

    return NextResponse.json(episode);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error('Failed to update episode:', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const episode = await prisma.episode.findUnique({ where: { id } });
    if (!episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    await prisma.episode.delete({ where: { id } });

    revalidatePath(`/admin/series/${episode.seriesId}`);
    revalidatePath(`/[locale]/series/${episode.seriesId}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete episode:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}