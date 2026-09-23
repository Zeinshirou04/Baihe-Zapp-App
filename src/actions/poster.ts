'use server';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { prisma } from '@/db/client';
import { uploadFile, deleteFile } from '@/lib/upload';

export async function uploadPoster(seriesId: string, formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const path = await uploadFile(file, 'posters');
  const poster = await prisma.poster.create({
    data: { seriesId, path },
  });

  revalidatePath(`/admin/series/${seriesId}`);
  return poster;
}

export async function setThumbnail(posterId: string, seriesId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.poster.updateMany({
    where: { seriesId },
    data: { isThumb: false },
  });

  await prisma.poster.update({
    where: { id: posterId },
    data: { isThumb: true },
  });

  revalidatePath(`/admin/series/${seriesId}`);
}

export async function deletePoster(posterId: string, seriesId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const poster = await prisma.poster.findUnique({ where: { id: posterId } });
  if (poster) {
    await deleteFile(poster.path);
    await prisma.poster.delete({ where: { id: posterId } });
  }

  revalidatePath(`/admin/series/${seriesId}`);
}

export async function bulkDeletePosters(posterIds: string[], seriesId: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const posters = await prisma.poster.findMany({
    where: { id: { in: posterIds } },
  });

  for (const poster of posters) {
    await deleteFile(poster.path);
  }

  await prisma.poster.deleteMany({
    where: { id: { in: posterIds } },
  });

  revalidatePath(`/admin/series/${seriesId}`);
}