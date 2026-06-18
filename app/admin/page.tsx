import { getMembers } from "@/lib/db/members";
import { getMovies } from "@/lib/db/movies";
import { baseMovieOptions, getMovieOptions } from "@/lib/db/options";
import { getFitnessMonths } from "@/lib/db/fitness";
import { DB_CONFIGURED } from "@/lib/mongodb";
import { FitnessMonth, Member, Movie, MovieOptions } from "@/lib/types";
import AdminTabs from "@/components/admin/AdminTabs";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let members: Member[] = [];
  let movies: Movie[] = [];
  let movieOptions: MovieOptions = baseMovieOptions();
  let fitnessMonths: FitnessMonth[] = [];
  let dbError = false;

  if (DB_CONFIGURED) {
    try {
      [members, movies, movieOptions, fitnessMonths] = await Promise.all([
        getMembers(),
        getMovies(),
        getMovieOptions(),
        getFitnessMonths(),
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
    <AdminTabs
      members={members}
      movies={movies}
      movieOptions={movieOptions}
      fitnessMonths={fitnessMonths}
    />
  );
}
