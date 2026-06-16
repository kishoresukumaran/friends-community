import Link from "next/link";
import { loadContests, loadFifaSnapshot } from "@/lib/content";
import ContestsView, {
  type FifaPreview,
} from "@/components/contests/ContestsView";

export const dynamic = "force-dynamic";

export default async function ContestsPage() {
  const [{ active, archived }, fifa] = await Promise.all([
    loadContests(),
    loadFifaSnapshot(),
  ]);

  let fifaPreview: FifaPreview | undefined;
  if (fifa && fifa.leaderboard.length > 0) {
    const total = fifa.matches.length;
    const played = fifa.matches.filter((m) => m.winner && m.winner.trim()).length;
    const top = [...fifa.leaderboard]
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name))
      .slice(0, 3)
      .map((e) => ({ name: e.name, total: e.total }));
    fifaPreview = {
      playing: fifa.leaderboard.length,
      played,
      total,
      top,
    };
  }

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
          Contests <span className="text-gradient">&amp; Predictions</span> 🏆
        </h1>
        <p className="mt-2 text-white/60">
          Live standings, prediction battles, and past champions.
        </p>
      </div>

      <ContestsView
        active={active}
        archived={archived}
        fifaPreview={fifaPreview}
      />
    </main>
  );
}
