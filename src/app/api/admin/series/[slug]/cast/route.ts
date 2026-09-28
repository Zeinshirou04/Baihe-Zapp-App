import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createCastSchema = z.object({
  personId: z.string(),
  role: z.string().min(1),
  characterName: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
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
    const validated = createCastSchema.parse(body);

    const cast = await prisma.seriesCast.create({
      data: {
        seriesId: series.id,
        personId: validated.personId,
        role: validated.role,
        characterName: validated.characterName,
        sortOrder: validated.sortOrder,
      },
      include: { person: true },
    });

    revalidatePath(`/admin/series/${slug}`);
    revalidatePath(`/[locale]/series/${slug}`);

    return NextResponse.json(cast, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.flatten() }, { status: 400 });
    }
    console.error('Failed to add cast:', err);
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

    const cast = await prisma.seriesCast.findMany({
      where: { seriesId: series.id },
      orderBy: { sortOrder: 'asc' },
      include: { person: true },
    });

    return NextResponse.json(cast);
  } catch (err) {
    console.error('Failed to fetch cast:', err);
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }
}