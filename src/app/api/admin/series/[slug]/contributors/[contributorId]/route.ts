import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; contributorId: string }> }
) {
  try {
    await requireAdmin();
    const { slug, contributorId } = await params;

    const series = await prisma.series.findUnique({ where: { slug } });
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const contributor = await prisma.episodeContributor.findUnique({
      where: { id: contributorId },
      include: { episode: true },
    });
    if (!contributor || contributor.episode.seriesId !== series.id) {
      return NextResponse.json({ error: 'Contributor not found' }, { status: 404 });
    }

    await prisma.episodeContributor.delete({ where: { id: contributorId } });

    revalidatePath(`/admin/series/${slug}`);
    revalidatePath(`/[locale]/series/${slug}`);
    revalidatePath(`/admin/episodes/${contributor.episodeId}/lines`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete contributor:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}