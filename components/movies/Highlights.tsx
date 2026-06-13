import { Movie } from "@/lib/types";

export interface HighlightItem {
  key: string;
  title: string;
  emoji: string;
  movie: Movie | null;
  metric: string;
}

export default function Highlights({ items }: { items: HighlightItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.key}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-grape to-sunset">
            {item.movie?.posterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.movie.posterUrl}
                alt={`${item.movie.title} poster`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-2xl">
                {item.movie?.emoji || item.emoji}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-green">
              {item.emoji} {item.title}
            </p>
            {item.movie ? (
              <>
                <p className="mt-0.5 truncate font-display text-base font-bold text-white">
                  {item.movie.title}
                </p>
                <p className="text-sm text-white/55">{item.metric}</p>
              </>
            ) : (
              <p className="mt-1 text-sm text-white/40">No movies match</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
