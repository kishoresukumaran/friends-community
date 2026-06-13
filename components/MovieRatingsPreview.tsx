import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Card from "@/components/ui/Card";
import MovieCard from "@/components/movies/MovieCard";
import { Movie } from "@/lib/types";

export default function MovieRatingsPreview({ movies }: { movies: Movie[] }) {
  // Teaser: show the few highest-rated movies; the full set + analytics live
  // on the dedicated /movies page.
  const featured = [...movies]
    .sort((a, b) => b.avgStars - a.avgStars || b.votes - a.votes)
    .slice(0, 3);

  return (
    <section id="movie-ratings" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="The group verdict"
        title="Movie Ratings"
        action={
          <Link
            href="/movies"
            className="hidden rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 sm:block"
          >
            See all + stats →
          </Link>
        }
      />

      {featured.length === 0 ? (
        <Card className="text-center text-white/60">
          No movies rated yet. Check back soon 🍿
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {featured.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              href="/movies"
              className="inline-block rounded-full bg-brand-green px-6 py-3 font-semibold text-ink shadow-pop transition hover:brightness-110"
            >
              Explore all movies + analytics 📊
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
