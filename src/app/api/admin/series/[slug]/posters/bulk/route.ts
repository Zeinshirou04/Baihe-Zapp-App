import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { deleteFile } from '@/lib/upload';
import { revalidatePath } from 'next/cache';
import { logRequest, logError } from '@/lib/logger';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  logRequest(req);
  
  try {
    await requireAdmin();
    const { slug } = await params;
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'ids array required' }, { status: 400 });
    }

    const series = await prisma.series.findUnique({ where: { slug } });
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const posters = await prisma.poster.findMany({
      where: { id: { in: ids }, seriesId: series.id },
    });

    for (const poster of posters) {
      await deleteFile(poster.path);
    }

    await prisma.poster.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath(`/admin/series/${slug}`, 'page');
    revalidatePath(`/[locale]/series/${slug}`, 'page');

    return NextResponse.json({ success: true, deleted: posters.length });
  } catch (err) {
    logError(req, err);
    return NextResponse.json({ error: 'Bulk delete failed' }, { status: 500 });
  }
}