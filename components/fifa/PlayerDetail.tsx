"use client";

import { useMemo, useState } from "react";
import {
  FifaMatch,
  FifaPlayerPicks,
  FifaPreTournamentEntry,
  FifaSnapshot,
} from "@/lib/types";

function norm(s: string): string {
  return (s || "").trim().toLowerCase();
}

type Result = "correct" | "wrong" | "pending";

interface PickRow {
  matchNo: number;
  label: string;
  pick: string;
  actual: string;
  result: Result;
}

function buildRows(
  picks: FifaPlayerPicks | undefined,
  matchByNo: Map<number, FifaMatch>,
  actualOf: (m: FifaMatch) => string
): PickRow[] {
  if (!picks) return [];
  return Object.entries(picks.picks)
    .map(([key, pick]) => {
      const matchNo = Number(key);
      const match = matchByNo.get(matchNo);
      const actual = match ? actualOf(match) : "";
      const result: Result = !actual
        ? "pending"
        : norm(actual) === norm(pick)
        ? "correct"
        : "wrong";
      return {
        matchNo,
        label: match ? `${match.team1} vs ${match.team2}` : `Match ${matchNo}`,
        pick,
        actual,
        result,
      };
    })
    .sort((a, b) => a.matchNo - b.matchNo);
}

const RESULT_ICON: Record<Result, string> = {
  correct: "✅",
  wrong: "❌",
  pending: "⏳",
};

export default function PlayerDetail({ snapshot }: { snapshot: FifaSnapshot }) {
  const players = useMemo(
    () =>
      [...snapshot.leaderboard].sort(
        (a, b) => b.total - a.total || a.name.localeCompare(b.name)
      ),
    [snapshot.leaderboard]
  );

  const [email, setEmail] = useState(players[0]?.email || "");

  const matchByNo = useMemo(() => {
    const map = new Map<number, FifaMatch>();
    for (const m of snapshot.matches) map.set(m.matchNo, m);
    return map;
  }, [snapshot.matches]);

  const entry = players.find((p) => p.email === email) || players[0];

  const leaguePicks = snapshot.leaguePredictions.find((p) => p.email === email);
  const knockoutPicks = snapshot.knockoutPredictions.find(
    (p) => p.email === email
  );
  const triviaPicks = snapshot.triviaPredictions.find((p) => p.email === email);
  const pre: FifaPreTournamentEntry | undefined = snapshot.preTournament.find(
    (p) => p.email === email
  );

  const matchRows = useMemo(() => {
    const byWinner = (m: FifaMatch) => m.winner;
    return [
      ...buildRows(leaguePicks, matchByNo, byWinner),
      ...buildRows(knockoutPicks, matchByNo, byWinner),
    ];
  }, [leaguePicks, knockoutPicks, matchByNo]);

  const triviaRows = useMemo(
    () => buildRows(triviaPicks, matchByNo, (m) => m.triviaAnswer),
    [triviaPicks, matchByNo]
  );

  if (!entry) {
    return <p className="text-sm text-white/40">No players to show.</p>;
  }

  const correctCount = matchRows.filter((r) => r.result === "correct").length;
  const decidedCount = matchRows.filter((r) => r.result !== "pending").length;

  return (
    <div className="space-y-6">
      <select
        aria-label="Select player"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-green/60 sm:w-auto"
      >
        {players.map((p) => (
          <option key={p.email || p.name} value={p.email} className="bg-ink">
            {p.name} — {p.total} pts
          </option>
        ))}
      </select>

      {/* Category points */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        <Stat label="League" value={entry.league} />
        <Stat label="Knockout" value={entry.knockout} />
        <Stat label="Pre-tourn." value={entry.preTournament} />
        <Stat label="Trivia" value={entry.trivia} />
        <Stat label="Total" value={entry.total} highlight />
      </div>

      {/* Pre-tournament props */}
      {pre &&
        (pre.top4 || pre.finalists || pre.champion) && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="font-display text-base font-bold text-white">
              Pre-tournament picks
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              <PropRow
                label="Top 4"
                pick={pre.top4}
                actual={pre.actualTop4}
              />
              <PropRow
                label="Finalists"
                pick={pre.finalists}
                actual={pre.actualFinalists}
              />
              <PropRow
                label="Champion"
                pick={pre.champion}
                actual={pre.actualChampion}
              />
            </dl>
            <p className="mt-3 text-xs text-white/45">
              Pre-tournament points: {pre.points}
            </p>
          </section>
        )}

      {/* Match predictions */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white">
            Match predictions
          </h3>
          {decidedCount > 0 && (
            <span className="text-xs text-white/45">
              {correctCount}/{decidedCount} correct
            </span>
          )}
        </div>
        {matchRows.length === 0 ? (
          <p className="mt-2 text-sm text-white/40">
            No predictions recorded yet.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5">
            {matchRows.map((r) => (
              <li
                key={r.matchNo}
                className="flex items-center justify-between gap-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-white/80">
                    <span className="text-white/40">#{r.matchNo}</span>{" "}
                    {r.label}
                  </p>
                  <p className="text-xs text-white/45">
                    Picked: <span className="text-white/70">{r.pick}</span>
                    {r.result !== "pending" && r.actual ? (
                      <span> · Result: {r.actual}</span>
                    ) : null}
                  </p>
                </div>
                <span className="shrink-0 text-base" title={r.result}>
                  {RESULT_ICON[r.result]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Trivia (QF onwards) */}
      {triviaRows.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <h3 className="font-display text-base font-bold text-white">
            Trivia answers
          </h3>
          <ul className="mt-3 divide-y divide-white/5">
            {triviaRows.map((r) => (
              <li
                key={r.matchNo}
                className="flex items-center justify-between gap-3 py-2"
              >
                <p className="min-w-0 truncate text-sm text-white/80">
                  <span className="text-white/40">#{r.matchNo}</span> {r.pick}
                </p>
                <span className="shrink-0 text-base" title={r.result}>
                  {RESULT_ICON[r.result]}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3 text-center">
      <div
        className={`font-display text-lg font-extrabold ${
          highlight ? "text-gold" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] font-medium text-white/50">{label}</div>
    </div>
  );
}

function PropRow({
  label,
  pick,
  actual,
}: {
  label: string;
  pick: string;
  actual: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-white/40">
        {label}
      </dt>
      <dd className="text-white/80">
        {pick || "—"}
        {actual ? (
          <span className="text-white/45"> · actual: {actual}</span>
        ) : null}
      </dd>
    </div>
  );
}
