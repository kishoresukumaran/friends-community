import SectionHeading from "@/components/SectionHeading";
import Card from "@/components/ui/Card";
import Stars from "@/components/ui/Stars";
import { movieRatings } from "@/lib/data";

export default function MovieRatingsPreview() {
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        {movieRatings.map((movie) => (
          <Card key={movie.id} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-grape to-sunset text-2xl">
                {movie.emoji}
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-display text-lg font-bold text-white">
                  {movie.title}
                </h3>
                <p className="text-sm text-white/50">{movie.year}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Stars value={movie.avgStars} />
              <span className="font-display text-lg font-extrabold text-gold">
                {movie.avgStars.toFixed(1)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-sm text-white/55">
              <span>🍿 {movie.votes} votes</span>
              <span className="font-semibold text-brand-green">Verdict in</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
