import 'server-only';
import { notFound } from 'next/navigation';
import { getSeriesBySlug } from '@/data/series';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const series = await getSeriesBySlug(slug);

  if (!series) notFound();

  return (
    <article className="p-6 max-w-5xl mx-auto">
      <div className="grid gap-8 lg:grid-cols-3">
        <aside className="lg:col-span-1">
          {series.posterPath ? (
            <Image
              src={series.posterPath}
              alt={series.titleHanzi}
              width={300}
              height={450}
              className="w-full aspect-[2/3] object-cover rounded-xl shadow-xl"
              priority
            />
          ) : (
            <div className="aspect-[2/3] bg-linear-to-br from-primary/20 to-surface rounded-xl flex items-center justify-center">
              <span className="font-hanzi text-6xl text-primary/30">百合</span>
            </div>
          )}
        </aside>

        <section className="lg:col-span-2 space-y-6">
          <header>
            <h1 className="font-hanzi text-4xl md:text-5xl font-bold tracking-tight">
              {series.titleHanzi}
            </h1>
            <p className="font-latin text-xl text-muted mt-1">{series.titleLatin}</p>
            {series.titlePinyin && (
              <p className="font-latin text-sm text-muted mt-0.5">{series.titlePinyin}</p>
            )}
            <p className="font-latin text-sm text-muted mt-2">
              {series.year ? `Year: ${series.year} · ` : ''}Status: {series.status}
            </p>
          </header>

          {series.synopsis && (
            <div className="prose prose-invert max-w-none">
              <h2 className="font-hanzi text-2xl mb-3">Synopsis</h2>
              <p className="font-latin text-base leading-relaxed">{series.synopsis}</p>
            </div>
          )}

          {series.cast.length > 0 && (
            <div>
              <h2 className="font-hanzi text-2xl mb-4">Cast</h2>
              <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {series.cast.map((sc) => (
                  <li key={sc.id} className="flex items-center gap-3">
                    {sc.person.avatarPath ? (
                      <Image
                        src={sc.person.avatarPath}
                        alt={sc.person.nameHanzi || sc.person.nameLatin}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-hanzi text-primary/50">{sc.person.nameHanzi?.[0] || sc.person.nameLatin[0]}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-hanzi text-sm">{sc.person.nameHanzi || sc.person.nameLatin}</p>
                      {sc.person.nameLatin && sc.person.nameHanzi && (
                        <p className="font-latin text-xs text-muted">{sc.person.nameLatin}</p>
                      )}
                      <p className="font-latin text-xs text-muted">{sc.role}</p>
                      {sc.characterName && (
                        <p className="font-latin text-xs text-muted">{sc.characterName}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="font-hanzi text-2xl mb-4">Episodes</h2>
            {series.episodes.length === 0 ? (
              <p className="font-latin text-muted">No episodes added yet.</p>
            ) : (
              <ul className="space-y-3">
                {series.episodes
                  .sort((a, b) => a.number - b.number)
                  .map((ep) => (
                    <li key={ep.id}>
                      <Link
                        href={`/${locale}/series/${slug}/episode/${ep.id}`}
                        className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border hover:border-primary/50 transition-colors"
                      >
                        <div>
                          <p className="font-hanzi text-lg">
                            {ep.title ? `第 ${ep.number} 集 · ${ep.title}` : `第 ${ep.number} 集`}
                          </p>
                          {ep.durationMs && (
                            <p className="font-latin text-sm text-muted mt-0.5">
                              {Math.floor(ep.durationMs / 60000)} min
                            </p>
                          )}
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ep.isPublished
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {ep.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}