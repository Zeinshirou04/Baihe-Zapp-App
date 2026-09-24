"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Users, Video, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { SeriesActorsTab } from './SeriesActorsTab';
import { SeriesEpisodesTab } from './SeriesEpisodesTab';
import { SeriesPostersTab } from './SeriesPostersTab';
import { SeriesContributorsTab } from './SeriesContributorsTab';

interface SeriesData {
  id: string;
  slug: string;
  titleHanzi: string;
  titleLatin: string;
  titlePinyin: string | null;
  synopsis: string | null;
  posterPath: string | null;
  status: 'ONGOING' | 'COMPLETED' | 'HIATUS';
  year: number | null;
  cast: Array<{
    id: string;
    role: string;
    characterName: string | null;
    sortOrder: number;
    person: {
      id: string;
      nameHanzi: string | null;
      nameLatin: string;
      slug: string | null;
      avatarPath: string | null;
    };
  }>;
  episodes: Array<{
    id: string;
    number: number;
    title: string | null;
    slug: string | null;
    durationMs: number | null;
    isPublished: boolean;
  }>;
  posters: Array<{
    id: string;
    path: string;
    isThumb: boolean;
    createdAt: Date;
  }>;
  _count: {
    episodes: number;
  };
}

interface SeriesDetailClientProps {
  series: SeriesData;
}

export function SeriesDetailClient({ series }: SeriesDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'actors' | 'episodes' | 'posters' | 'contributors'>('actors');

  const tabs = [
    { id: 'actors', label: 'Actors', icon: Users },
    { id: 'episodes', label: 'Episodes', icon: Video },
    { id: 'posters', label: 'Posters', icon: ImageIcon },
    { id: 'contributors', label: 'Contributors', icon: MoreHorizontal },
  ] as const;

  const thumbnail = series.posters.find(p => p.isThumb);
  const displayPoster = thumbnail || series.posters[0] || null;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          {displayPoster && (
            <Link href={`/admin/series/${series.slug}/posters`} className="flex-shrink-0">
              <div className="w-24 h-36 aspect-[2/3] bg-ink-raised rounded overflow-hidden">
                <Image src={`/media/${displayPoster.path}`} alt={series.titleHanzi} fill className="object-cover" />
              </div>
            </Link>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="font-serif-sc text-2xl text-ink">{series.titleHanzi}</h1>
              <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${
                series.status === 'ONGOING' ? 'bg-emerald/10 text-emerald' :
                series.status === 'COMPLETED' ? 'bg-brass/10 text-brass' :
                'bg-ink/10 text-ink/60'
              }`}>
                {series.status.toLowerCase()}
              </span>
            </div>
            <p className="font-serif text-lg text-ink/60 italic mt-1">{series.titleLatin}</p>
            {series.titlePinyin && (
              <p className="font-body text-sm text-ink/50 mt-0.5">{series.titlePinyin}</p>
            )}
            {series.year && (
              <p className="font-body text-sm text-ink/40 mt-1">Year: {series.year}</p>
            )}
            <div className="flex items-center gap-3 mt-4">
              <Link
                href={`/admin/series/${series.slug}/edit`}
                className="inline-flex items-center gap-2 rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink/90 transition-colors"
              >
                <Pencil className="h-4 w-4" />
                Edit Series
              </Link>
            </div>
          </div>
        </div>
      </header>

      {series.synopsis && (
        <div className="prose prose-ink max-w-none">
          <p className="text-ink/70">{series.synopsis}</p>
        </div>
      )}

      <div className="border-t border-ink/10">
        <nav className="flex gap-1 p-1 bg-ink/5 rounded-md" aria-label="Series sections">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white text-brass shadow-sm'
                  : 'text-ink/60 hover:bg-white hover:text-brass'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-6">
          {activeTab === 'actors' && <SeriesActorsTab seriesId={series.id} cast={series.cast} />}
          {activeTab === 'episodes' && <SeriesEpisodesTab seriesId={series.id} episodes={series.episodes} />}
          {activeTab === 'posters' && <SeriesPostersTab seriesSlug={series.slug} posters={series.posters} />}
          {activeTab === 'contributors' && <SeriesContributorsTab seriesId={series.id} />}
        </div>
      </div>
    </div>
  );
}