import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';
import { logRequest, logError, logInfo } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  logRequest(req);
  
  try {
    await requireAdmin();
    const { slug } = await params;

    const series = await prisma.series.findUnique({ where: { slug } });
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const uploadsDir = process.env.UPLOADS_DIR;
    if (!uploadsDir) return NextResponse.json({ error: 'UPLOADS_DIR not set' }, { status: 500 });

    const { randomUUID } = await import('crypto');
    const { writeFile } = await import('fs/promises');
    const { join } = await import('path');

    const filename = `${randomUUID()}.${ext}`;
    const filepath = join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    const poster = await prisma.poster.create({
      data: {
        seriesId: series.id,
        path: filename,
        isThumb: false,
      },
    });

    revalidatePath(`/admin/series/${slug}`);
    revalidatePath(`/[locale]/series/${slug}`);

    logInfo('Poster uploaded', { seriesId: series.id, posterId: poster.id });
    return NextResponse.json(poster);
  } catch (err) {
    logError(req, err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  logRequest(req);
  
  try {
    await requireAdmin();
    const { slug } = await params;

    const series = await prisma.series.findUnique({ where: { slug } });
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const posters = await prisma.poster.findMany({
      where: { seriesId: series.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posters);
  } catch (err) {
    logError(req, err);
    return NextResponse.json({ error: 'Failed to fetch posters' }, { status: 500 });
  }
}