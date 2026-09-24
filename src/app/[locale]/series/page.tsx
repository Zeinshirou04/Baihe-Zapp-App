import 'server-only';
import { getAllSeries } from '@/data/series';
import SeriesCard from '@/components/SeriesCard';

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await params;
  const series = await getAllSeries();

  return (
    <section className="p-6 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="font-hanzi text-4xl md:text-5xl font-bold tracking-tight">
          百合 Series
        </h1>
        <p className="font-latin text-muted mt-2">
          Fan translations of GL Chinese audio dramas from Fanjiao
        </p>
      </header>

      {series.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-hanzi text-2xl text-muted mb-2">暂无系列</p>
          <p className="font-latin text-muted">
            No series added yet. Check back soon or add one from the admin panel.
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} />
          ))}
        </ul>
      )}
    </section>
  );
}