import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createEpisodeSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  durationMs: z.number().int().nonnegative().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin();
    const { slug } = await params;

    const series = await prisma.series.findUnique({ where: { slug } });
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const body = await req.json();
    const validated = createEpisodeSchema.parse(body);

    const episode = await prisma.episode.create({
      data: {
        seriesId: series.id,
        number: validated.number,
        title: validated.title,
        slug: validated.slug,
        durationMs: validated.durationMs,
      },
    });

    revalidatePath(`/admin/series/${slug}`);
    revalidatePath(`/[locale]/series/${slug}`);

    return NextResponse.json(episode, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error('Failed to create episode:', err);
    return NextResponse.json({ error: 'Create failed' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await requireAdmin();
    const { slug } = await params;

    const series = await prisma.series.findUnique({ where: { slug } });
    if (!series) {
      return NextResponse.json({ error: 'Series not found' }, { status: 404 });
    }

    const episodes = await prisma.episode.findMany({
      where: { seriesId: series.id },
      orderBy: { number: 'asc' },
      include: { _count: { select: { lines: true } } },
    });

    return NextResponse.json(episodes);
  } catch (err) {
    console.error('Failed to fetch episodes:', err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}