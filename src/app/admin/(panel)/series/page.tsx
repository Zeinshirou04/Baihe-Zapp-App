import { prisma } from '@/db/client';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import Link from 'next/link';
import { BookOpen, Plus, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { DeleteButton } from './DeleteButton';
import Image from 'next/image';

export const metadata = { title: 'Manage Series' };

export default async function SeriesListPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');

  const series = await prisma.series.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { episodes: true } },
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      <header className="flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif-sc text-3xl text-ink">百合</h1>
          <p className="text-ink/50 mt-1">Manage Series</p>
        </div>
        <Link
          href="/admin/series/new"
          className="inline-flex items-center gap-2 rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Series
        </Link>
      </header>

      {series.length === 0 ? (
        <div className="bg-white/60 border border-ink/10 rounded-md p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-ink/20 mb-4" />
          <h2 className="font-serif text-xl text-ink mb-2">No series yet</h2>
          <p className="text-ink/50 mb-6">Add your first series to get started.</p>
          <Link
            href="/admin/series/new"
            className="inline-flex items-center gap-2 rounded-md bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Series
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {series.map((s) => (
            <article
              key={s.id}
              className="bg-white/60 border border-ink/10 rounded-md overflow-hidden hover:border-brass/30 transition-colors"
            >
              <Link href={`/admin/series/${s.slug}`} className="block">
                <div className="aspect-[2/3] relative bg-ink-raised overflow-hidden">
                  {s.posterPath ? (
                    <Image
                      src={`/media/${s.posterPath}`}
                      alt={s.titleHanzi}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                      sizes="100vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-ink/20" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-[10px] font-body font-medium text-porcelain bg-ink/80 backdrop-blur-sm px-2 py-0.5 rounded capitalize">
                    {s.status.toLowerCase()}
                  </span>
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-body font-medium text-ink line-clamp-2">{s.titleHanzi}</h3>
                  <p className="font-serif text-sm text-ink/50 italic">{s.titleLatin}</p>
                  <p className="font-body text-xs text-ink/40">
                    {s._count.episodes} episode{s._count.episodes !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
              <div className="border-t border-ink/10 p-3 flex items-center gap-6">
                <Link
                  href={`/admin/series/${s.id}/edit`}
                  className="text-center text-sm font-medium text-brass hover:text-brass/80"
                >
                  <Pencil className="h-4 w-4 mx-auto mb-1" />
                  Edit
                </Link>
                <DeleteButton seriesId={s.id} seriesTitle={s.titleHanzi} />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}