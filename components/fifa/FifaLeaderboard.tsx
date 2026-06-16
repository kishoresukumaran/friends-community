import { FifaLeaderboardEntry } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function FifaLeaderboard({
  leaderboard,
}: {
  leaderboard: FifaLeaderboardEntry[];
}) {
  const ranked = [...leaderboard].sort(
    (a, b) => b.total - a.total || a.name.localeCompare(b.name)
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <div className="hidden grid-cols-[2.5rem_1fr_repeat(4,3.5rem)_4rem] gap-2 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/40 sm:grid">
        <span>#</span>
        <span>Player</span>
        <span className="text-center">Lg</span>
        <span className="text-center">KO</span>
        <span className="text-center">Pre</span>
        <span className="text-center">Trv</span>
        <span className="text-right">Total</span>
      </div>

      <ul className="divide-y divide-white/5">
        {ranked.map((p, i) => (
          <li
            key={p.email || p.name}
            className="grid grid-cols-[2rem_1fr_4rem] items-center gap-2 px-4 py-3 sm:grid-cols-[2.5rem_1fr_repeat(4,3.5rem)_4rem]"
          >
            <span className="text-center font-display text-sm font-extrabold text-white/50">
              {i < 3 ? MEDALS[i] : i + 1}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold text-white">
                {p.name || "—"}
              </span>
              {/* Per-category breakdown inline on mobile */}
              <span className="mt-0.5 block text-xs text-white/40 sm:hidden">
                Lg {p.league} · KO {p.knockout} · Pre {p.preTournament} · Trv{" "}
                {p.trivia}
              </span>
            </span>
            <span className="hidden text-center text-sm text-white/70 sm:block">
              {p.league}
            </span>
            <span className="hidden text-center text-sm text-white/70 sm:block">
              {p.knockout}
            </span>
            <span className="hidden text-center text-sm text-white/70 sm:block">
              {p.preTournament}
            </span>
            <span className="hidden text-center text-sm text-white/70 sm:block">
              {p.trivia}
            </span>
            <span className="text-right font-display text-lg font-extrabold text-gold">
              {p.total}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
