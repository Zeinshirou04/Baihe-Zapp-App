import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filepath = path.join('/');

  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const uploadsDir = process.env.UPLOADS_DIR;
  if (!uploadsDir) {
    return new NextResponse('UPLOADS_DIR not configured', { status: 500 });
  }

  try {
    const fullPath = join(uploadsDir, filepath);
    const fileBuffer = await readFile(fullPath);
    
    const ext = filepath.split('.').pop()?.toLowerCase();
    const contentType = 
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      ext === 'png' ? 'image/png' :
      ext === 'webp' ? 'image/webp' :
      ext === 'gif' ? 'image/gif' : 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}