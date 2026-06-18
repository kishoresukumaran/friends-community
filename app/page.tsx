import Hero from "@/components/Hero";
import QuickLinks from "@/components/QuickLinks";
import {
  loadContests,
  loadFitnessMonths,
  loadMembers,
  loadMovies,
} from "@/lib/content";

// Always read fresh data from the DB on each request.
export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ active, archived }, movies, members, fitnessMonths] =
    await Promise.all([
      loadContests(),
      loadMovies(),
      loadMembers(),
      loadFitnessMonths(),
    ]);

  const stats = {
    friends: members.length,
    contests: active.length + archived.length,
    movies: movies.length,
  };

  const latestFitness = fitnessMonths.find((m) => m.entries.length > 0);
  const fitnessLabel = latestFitness?.entries[0]
    ? `🥇 ${latestFitness.entries[0].name} leads`
    : "Coming soon";

  const quickLinkStats = {
    contestsTotal: active.length + archived.length,
    contestsLive: active.length,
    moviesRated: movies.length,
    fitnessLabel,
  };

  return (
    <main>
      <Hero stats={stats} />
      <QuickLinks stats={quickLinkStats} />

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
