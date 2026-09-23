import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  const uploadsDir = process.env.UPLOADS_DIR;
  if (!uploadsDir) return NextResponse.json({ error: 'UPLOADS_DIR not set' }, { status: 500 });

  const filename = `${randomUUID()}.${ext}`;
  const filepath = join(uploadsDir, filename);
  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  return NextResponse.json({ path: filename });
}