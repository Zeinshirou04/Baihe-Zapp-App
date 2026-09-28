import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { deleteFile } from '@/lib/upload';
import { revalidatePath } from 'next/cache';
import { logRequest, logError } from '@/lib/logger';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  logRequest(req);
  
  try {
    await requireAdmin();
    const { id } = await params;

    const poster = await prisma.poster.findUnique({ where: { id } });
    if (!poster) {
      return NextResponse.json({ error: 'Poster not found' }, { status: 404 });
    }

    await deleteFile(poster.path);
    await prisma.poster.delete({ where: { id } });

    revalidatePath(`/admin/series/${poster.seriesId}`, 'page');

    return NextResponse.json({ success: true });
  } catch (err) {
    logError(req, err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}