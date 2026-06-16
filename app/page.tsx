import Hero from "@/components/Hero";
import ActiveContestsPreview, {
  type FifaLiveStats,
} from "@/components/ActiveContestsPreview";
import MovieRatingsPreview from "@/components/MovieRatingsPreview";
import {
  loadContests,
  loadFifaSnapshot,
  loadMembers,
  loadMovies,
} from "@/lib/content";

// Always read fresh data from the DB on each request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ active, archived }, movies, members, fifa] = await Promise.all([
    loadContests(),
    loadMovies(),
    loadMembers(),
    loadFifaSnapshot(),
  ]);

  const stats = {
    friends: members.length,
    contests: active.length + archived.length,
    movies: movies.length,
  };

  // Derive the FIFA card's headline numbers from the live synced snapshot
  // instead of the static values stored on the contest record.
  let fifaStats: FifaLiveStats | undefined;
  if (fifa && fifa.leaderboard.length > 0) {
    const total = fifa.matches.length;
    const played = fifa.matches.filter((m) => m.winner && m.winner.trim()).length;
    const leader = [...fifa.leaderboard].sort((a, b) => b.total - a.total)[0];
    fifaStats = {
      playing: fifa.leaderboard.length,
      played,
      total,
      leader: leader && leader.total > 0 ? { name: leader.name, total: leader.total } : null,
    };
  }

  return (
    <main>
      <Hero stats={stats} />
      <ActiveContestsPreview
        active={active}
        archived={archived}
        fifaStats={fifaStats}
      />
      <MovieRatingsPreview movies={movies} />

      <footer className="border-t border-white/10 px-4 py-10 text-center text-sm text-white/40 sm:px-6">
        <p className="font-display font-bold text-white/70">
          Friends<span className="text-brand-green">Community</span> 🤝
        </p>
        <p className="mt-2">
          Built for fun, bragging rights, and questionable predictions.
        </p>
        <a
          href="/admin"
          className="mt-3 inline-block text-xs font-medium text-white/30 underline-offset-4 transition hover:text-white/60 hover:underline"
        >
          Admin
        </a>
      </footer>
    </main>
  );
}
