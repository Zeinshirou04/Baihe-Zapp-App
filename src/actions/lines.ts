"use server";
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/db/client';
import { revalidatePath } from 'next/cache';
import pinyinPro from 'pinyin-pro';

const lineSchema = z.object({
  startMs: z.number().int().nonnegative(),
  endMs: z.number().int().nonnegative().optional().nullable(),
  hanzi: z.string().min(1),
  translationEn: z.string().min(1),
  speakerId: z.string().optional().nullable(),
});

const bulkLinesSchema = z.array(lineSchema);

function generatePinyin(hanzi: string): { pinyin: string; pinyinTokens: string } {
  const tokens: Array<{ h: string; p: string }> = [];
  let plain = '';
  
  for (const char of hanzi) {
    if (/[\u4e00-\u9fff]/.test(char)) {
      const py = pinyinPro.pinyin(char, { toneType: 'symbol', separator: '' });
      tokens.push({ h: char, p: py });
      plain += py + ' ';
    } else {
      tokens.push({ h: char, p: '' });
      plain += char;
    }
  }
  
  return {
    pinyin: plain.trim(),
    pinyinTokens: JSON.stringify(tokens),
  };
}

export async function replaceEpisodeLines(episodeId: string, lines: Array<{
  startMs: number;
  endMs: number | null;
  hanzi: string;
  translationEn: string;
  speakerId: string | null;
}>) {
  await requireAdmin();

  const validated = bulkLinesSchema.parse(lines);

  await prisma.$transaction(async (tx) => {
    await tx.line.deleteMany({ where: { episodeId } });

    const data = validated.map((line, idx) => {
      const { pinyin, pinyinTokens } = generatePinyin(line.hanzi);
      return {
        episodeId,
        idx,
        startMs: line.startMs,
        endMs: line.endMs,
        hanzi: line.hanzi,
        pinyin,
        pinyinTokens,
        translationEn: line.translationEn,
        speakerId: line.speakerId,
      };
    });

    await tx.line.createMany({ data });
  });

  revalidatePath(`/admin/episodes/${episodeId}/lines`);
  revalidatePath(`/[locale]/series/[slug]/episode/${episodeId}`);
}

export async function getEpisodeLines(episodeId: string) {
  await requireAdmin();

  return prisma.line.findMany({
    where: { episodeId },
    orderBy: { idx: 'asc' },
    include: { speaker: true },
  });
}