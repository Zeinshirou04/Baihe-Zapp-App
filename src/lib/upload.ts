import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function uploadFile(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split('.').pop() || 'bin';
  const filename = `${uuidv4()}.${ext}`;
  const filepath = join(process.env.UPLOADS_DIR || 'uploads', folder, filename);

  await writeFile(filepath, buffer);
  return join(folder, filename);
}

export async function deleteFile(path: string): Promise<void> {
  const { unlink } = await import('fs/promises');
  const { join } = await import('path');
  const filepath = join(process.env.UPLOADS_DIR || 'uploads', path);
  try {
    await unlink(filepath);
  } catch {
    // ignore if file doesn't exist
  }
}