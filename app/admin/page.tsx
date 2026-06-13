import { getMembers } from "@/lib/db/members";
import { getMovies } from "@/lib/db/movies";
import { baseMovieOptions, getMovieOptions } from "@/lib/db/options";
import { DB_CONFIGURED } from "@/lib/mongodb";
import { Member, Movie, MovieOptions } from "@/lib/types";
import MembersManager from "@/components/admin/MembersManager";
import MoviesManager from "@/components/admin/MoviesManager";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let members: Member[] = [];
  let movies: Movie[] = [];
  let movieOptions: MovieOptions = baseMovieOptions();
  let dbError = false;

  if (DB_CONFIGURED) {
    try {
      [members, movies, movieOptions] = await Promise.all([
        getMembers(),
        getMovies(),
        getMovieOptions(),
      ]);
    } catch {
      dbError = true;
    }
  }

  if (!DB_CONFIGURED || dbError) {
    return (
      <div className="rounded-3xl border border-sunset/30 bg-sunset/10 p-6 text-sm text-white/80">
        <p className="font-semibold text-white">Database not connected</p>
        <p className="mt-2">
          Set <code className="text-brand-green">MONGODB_URI</code> in your
          <code className="text-brand-green"> .env.local</code> (and Vercel
          project settings), then restart the dev server. Run{" "}
          <code className="text-brand-green">npm run seed</code> to load the
          starter data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <MembersManager initialMembers={members} />
      <MoviesManager
        initialMovies={movies}
        members={members}
        movieOptions={movieOptions}
      />
    </div>
  );
}
