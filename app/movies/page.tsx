import Link from "next/link";
import { loadMovies } from "@/lib/content";
import MoviesExplorer from "@/components/movies/MoviesExplorer";

export const dynamic = "force-dynamic";

export default async function MoviesPage() {
  const movies = await loadMovies();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-semibold text-white/50 transition hover:text-white/80"
        >
          ← Back to home
        </Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Movie <span className="text-gradient">Verdicts</span> 🍿
        </h1>
        <p className="mt-2 text-white/60">
          Group verdicts, standout films, and who has the spiciest takes.
        </p>
      </div>

      <MoviesExplorer movies={movies} />
    </main>
  );
}
