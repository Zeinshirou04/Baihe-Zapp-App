import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createContributorSchema = z.object({
  episodeId: z.string(),
  personId: z.string(),
  role: z.enum(['TRANSLATOR', 'EDITOR', 'PROOFREADER']),
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
    const { episodeId, ...validated } = createContributorSchema.parse(body);

    const episode = await prisma.episode.findUnique({ where: { id: episodeId } });
    if (!episode || episode.seriesId !== series.id) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    const contributor = await prisma.episodeContributor.create({
      data: {
        episodeId,
        personId: validated.personId,
        role: validated.role,
      },
      include: { person: true },
    });

    revalidatePath(`/admin/series/${slug}`);
    revalidatePath(`/[locale]/series/${slug}`);
    revalidatePath(`/admin/episodes/${episodeId}/lines`);

    return NextResponse.json(contributor, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error('Failed to add contributor:', err);
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

    const contributors = await prisma.episodeContributor.findMany({
      where: { episode: { seriesId: series.id } },
      include: { person: true, episode: { select: { id: true, number: true } } },
      orderBy: [{ episode: { number: 'asc' } }, { role: 'asc' }],
    });

    return NextResponse.json(contributors);
  } catch (err) {
    console.error('Failed to fetch contributors:', err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}