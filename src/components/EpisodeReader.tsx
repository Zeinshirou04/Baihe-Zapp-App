'use client';

import { useState } from 'react';
import { BookOpen, Type } from 'lucide-react';

interface Line {
  id: string;
  idx: number;
  startMs: number;
  endMs: number | null;
  hanzi: string;
  pinyin: string;
  pinyinTokens: string;
  translationEn: string;
}

interface EpisodeReaderProps {
  locale: string;
  episode: {
    id: string;
    number: number;
    title: string | null;
    series: { slug: string; titleHanzi: string };
    lines: Line[];
  };
  seriesSlug: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function parsePinyinTokens(tokensJson: string): { h: string; p: string }[] {
  try {
    return JSON.parse(tokensJson);
  } catch {
    return [];
  }
}

export function EpisodeReader({ locale, episode, seriesSlug }: EpisodeReaderProps) {
  const [showPinyin, setShowPinyin] = useState(true);

  return (
    <div className="min-h-screen bg-ink text-porcelain">
      {/* Sticky header with episode info and pinyin toggle */}
      <header className="sticky top-0 z-20 bg-ink/95 backdrop-blur-sm border-b border-porcelain/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href={`/${locale}/series/${seriesSlug}`}
              className="text-porcelain/60 hover:text-brass transition-colors"
            >
              <BookOpen className="h-5 w-5" />
            </a>
            <div>
              <p className="font-serif text-lg font-semibold text-porcelain">
                {episode.series.titleHanzi}
              </p>
              <p className="font-body text-sm text-porcelain/50">
                Episode {episode.number}{episode.title && ` · ${episode.title}`}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPinyin(!showPinyin)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-body transition-colors ${
              showPinyin
                ? 'bg-brass/15 text-brass border border-brass/30'
                : 'bg-ink-raised text-porcelain/60 border border-porcelain/15 hover:text-porcelain hover:border-porcelain/30'
            }`}
            aria-pressed={showPinyin}
            aria-label={showPinyin ? 'Hide pinyin' : 'Show pinyin'}
          >
            <Type className="h-4 w-4" />
            <span>{showPinyin ? 'Pinyin On' : 'Pinyin Off'}</span>
          </button>
        </div>
      </header>

      {/* Reader content */}
      <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        {episode.lines.length === 0 && (
          <div className="text-center py-16 text-porcelain/60">
            <p className="font-body text-base">
              This episode hasn&apos;t been translated yet.
            </p>
            <a
              href={`/${locale}/series/${seriesSlug}`}
              className="mt-4 inline-block text-sm font-body text-brass hover:underline"
            >
              Back to episode list
            </a>
          </div>
        )}

        {episode.lines.map((line) => {
          const tokens = parsePinyinTokens(line.pinyinTokens);

          return (
            <article
              key={line.id}
              className="space-y-3"
              id={`line-${line.idx}`}
            >
              {/* Timestamp */}
              <time
                dateTime={`PT${Math.floor(line.startMs / 1000)}S`}
                className="inline-block font-body text-xs text-porcelain/40"
              >
                {formatTime(line.startMs)}
              </time>

              {/* Hanzi line with ruby pinyin */}
              <p className="font-serif-sc text-xl leading-loose text-porcelain">
                {tokens.length > 0 ? (
                  tokens.map((token, i) => (
                    <ruby key={i} className="inline-block mr-0.5 align-baseline">
                      {token.h}
                      {showPinyin && token.p && (
                        <rt className="font-body text-[10px] text-porcelain/50 leading-none">
                          {token.p}
                        </rt>
                      )}
                    </ruby>
                  ))
                ) : (
                  line.hanzi
                )}
              </p>

              {/* English translation */}
              <p className="font-body text-base text-porcelain/70 leading-relaxed">
                {line.translationEn}
              </p>
            </article>
          );
        })}
      </main>

      {/* Bottom navigation */}
      <footer className="border-t border-porcelain/10 bg-ink/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <a
            href={`/${locale}/series/${seriesSlug}`}
            className="inline-flex items-center gap-2 font-body text-sm text-porcelain/60 hover:text-brass transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Back to episode list
          </a>
        </div>
      </footer>
    </div>
  );
}