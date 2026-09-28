import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; personId: string }> }
) {
  try {
    await requireAdmin();
    const { slug, personId } = await params;

    const series = await prisma.series.findUnique({ where: { slug } });
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const cast = await prisma.seriesCast.findUnique({
      where: { seriesId_personId: { seriesId: series.id, personId } },
    });
    if (!cast) {
      return NextResponse.json({ error: 'Cast member not found' }, { status: 404 });
    }

    await prisma.seriesCast.delete({ where: { id: cast.id } });

    revalidatePath(`/admin/series/${slug}`);
    revalidatePath(`/[locale]/series/${slug}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete cast:', err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}