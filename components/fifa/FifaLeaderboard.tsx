"use client";

import { useMemo, useState } from "react";
import { FifaLeaderboardEntry } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

type View = "list" | "chart";

function formatSyncedAt(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function FifaLeaderboard({
  leaderboard,
  syncedAt,
}: {
  leaderboard: FifaLeaderboardEntry[];
  syncedAt?: string;
}) {
  const [view, setView] = useState<View>("list");

  const ranked = useMemo(
    () =>
      [...leaderboard].sort(
        (a, b) => b.total - a.total || a.name.localeCompare(b.name)
      ),
    [leaderboard]
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5 rounded-full bg-white/5 p-1.5 sm:w-fit">
        <ViewTab active={view === "list"} onClick={() => setView("list")}>
          📋 Full table
        </ViewTab>
        <ViewTab active={view === "chart"} onClick={() => setView("chart")}>
          📊 Share card
        </ViewTab>
      </div>

      {view === "list" ? (
        <ListView ranked={ranked} />
      ) : (
        <ChartView ranked={ranked} syncedAt={syncedAt} />
      )}
    </div>
  );
}

function ViewTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-none ${
        active ? "bg-brand-green text-ink" : "text-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

// ── Detailed table (unchanged) ──────────────────────────────────────────────

function ListView({ ranked }: { ranked: FifaLeaderboardEntry[] }) {
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

// ── Compact share card (screenshot-friendly bar chart) ──────────────────────

function ChartView({
  ranked,
  syncedAt,
}: {
  ranked: FifaLeaderboardEntry[];
  syncedAt?: string;
}) {
  const max = Math.max(...ranked.map((p) => p.total), 1);
  const synced = formatSyncedAt(syncedAt);

  // Rank with shared standings (ties get the same rank number).
  let lastTotal: number | null = null;
  let lastRank = 0;

  return (
    <div>
      <p className="mb-3 text-xs text-white/45">
        A compact, screenshot-ready view — grab it and drop it in the group chat.
      </p>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] shadow-card">
        {/* Branded header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-brand-teal/20 to-brand-green/20 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-teal to-brand-green text-xl shadow-pop">
              ⚽
            </span>
            <div>
              <p className="font-display text-base font-extrabold leading-tight text-white">
                FIFA World Cup 2026
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
                Prediction standings
              </p>
            </div>
          </div>
          <span className="rounded-full bg-brand-green/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-green ring-1 ring-brand-green/30">
            Live
          </span>
        </div>

        {/* Bars */}
        <ul className="divide-y divide-white/5">
          {ranked.map((p, i) => {
            if (p.total !== lastTotal) {
              lastRank = i + 1;
              lastTotal = p.total;
            }
            const rank = lastRank;
            const medal = rank <= 3 ? MEDALS[rank - 1] : null;
            const pct = Math.max(4, Math.round((p.total / max) * 100));
            const isTop = rank === 1;
            return (
              <li
                key={p.email || p.name}
                className="flex items-center gap-2.5 px-3 py-1.5 sm:px-4"
              >
                <span className="w-6 shrink-0 text-center font-display text-sm font-extrabold text-white/45">
                  {medal ?? rank}
                </span>
                <span className="w-20 shrink-0 truncate text-sm font-semibold text-white sm:w-28">
                  {p.name || "—"}
                </span>
                <span className="flex h-5 flex-1 items-center">
                  <span
                    className={`h-2.5 rounded-full ${
                      isTop
                        ? "bg-gold"
                        : "bg-gradient-to-r from-brand-teal to-brand-green"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span
                  className={`w-7 shrink-0 text-right font-display text-base font-extrabold ${
                    isTop ? "text-gold" : "text-white"
                  }`}
                >
                  {p.total}
                </span>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-2.5 text-[11px] text-white/40 sm:px-5">
          <span className="font-semibold text-white/55">
            Friends<span className="text-brand-green">Community</span> 🤝
          </span>
          {synced && <span>Updated {synced}</span>}
        </div>
      </div>
    </div>
  );
}
