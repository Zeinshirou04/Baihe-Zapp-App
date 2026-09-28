import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';
import { logRequest, logError } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  logRequest(req);
  
  try {
    await requireAdmin();
    const { id } = await params;
    const { seriesSlug } = await req.json();

    if (!seriesSlug) {
      return NextResponse.json({ error: 'seriesSlug required' }, { status: 400 });
    }

    const series = await prisma.series.findUnique({ where: { slug: seriesSlug } });
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const poster = await prisma.poster.findUnique({ where: { id } });
    if (!poster || poster.seriesId !== series.id) {
      return NextResponse.json({ error: 'Poster not found for this series' }, { status: 404 });
    }

    await prisma.poster.updateMany({
      where: { seriesId: series.id },
      data: { isThumb: false },
    });

    await prisma.poster.update({
      where: { id },
      data: { isThumb: true },
    });

    revalidatePath(`/admin/series/${seriesSlug}`, 'page');
    revalidatePath(`/[locale]/series/${seriesSlug}`, 'page');

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(req, err);
    return NextResponse.json({ error: 'Failed to set thumbnail' }, { status: 500 });
  }
}