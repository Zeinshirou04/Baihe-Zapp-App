import Image from 'next/image';

interface SeriesCardProps {
  series: {
    id: string;
    titleHanzi: string;
    titleLatin: string;
    status: string;
    posterPath: string | null;
  };
}

export default function SeriesCard({ series }: SeriesCardProps) {
  return (
    <li className="group relative bg-surface rounded-xl overflow-hidden border border-border transition-shadow hover:shadow-xl aspect-2/3">
      {series.posterPath ? (
        <Image
          src={series.posterPath}
          alt={series.titleHanzi}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-surface flex items-center justify-center">
          <span className="font-hanzi text-4xl text-primary/50">百合</span>
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-bg/90 via-bg/50 to-transparent p-4 flex flex-col justify-end">
        <h3 className="font-hanzi text-xl mb-1">{series.titleHanzi}</h3>
        <p className="font-latin text-sm text-muted mb-2">{series.titleLatin}</p>
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
          {series.status}
        </span>
      </div>
    </li>
  );
}