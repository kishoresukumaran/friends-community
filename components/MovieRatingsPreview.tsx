import SectionHeading from "@/components/SectionHeading";
import Card from "@/components/ui/Card";
import Stars from "@/components/ui/Stars";
import { Movie } from "@/lib/types";

export default function MovieRatingsPreview({ movies }: { movies: Movie[] }) {
  return (
    <section id="movie-ratings" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="The group verdict"
        title="Movie Ratings"
        action={
          <span className="hidden text-sm font-semibold text-white/40 sm:block">
            Avg stars ★
          </span>
        }
      />

      {movies.length === 0 ? (
        <Card className="text-center text-white/60">
          No movies rated yet. Check back soon 🍿
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex gap-4">
        {/* Poster thumbnail (falls back to emoji tile if no image) */}
        <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-grape to-sunset">
          {movie.posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={movie.posterUrl}
              alt={`${movie.title} poster`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-3xl">
              {movie.emoji || "🎬"}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold leading-tight text-white">
            {movie.title}
          </h3>
          {movie.language && (
            <p className="mt-0.5 text-sm text-white/50">{movie.language}</p>
          )}
          {movie.genre.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {movie.genre.map((g) => (
                <span
                  key={g}
                  className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/70"
                >
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Stars value={movie.avgStars} />
        <span className="font-display text-lg font-extrabold text-gold">
          {movie.avgStars.toFixed(1)}
        </span>
      </div>

      {movie.ratings.length > 0 ? (
        <details className="group border-t border-white/10 pt-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-white/55">
            <span>🍿 {movie.votes} ratings</span>
            <span className="text-brand-green transition group-open:rotate-180">
              ▾
            </span>
          </summary>
          <ul className="mt-3 space-y-2">
            {movie.ratings.map((r, i) => (
              <li
                key={`${r.name}-${i}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="truncate text-sm text-white/75">{r.name}</span>
                <Stars value={r.stars} size="sm" />
              </li>
            ))}
          </ul>
        </details>
      ) : (
        <div className="border-t border-white/10 pt-3 text-sm text-white/40">
          No ratings yet
        </div>
      )}
    </Card>
  );
}
