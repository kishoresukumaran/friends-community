"use client";

import { useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import { FifaMatch } from "@/lib/types";

export default function FifaMatches({ matches }: { matches: FifaMatch[] }) {
  const [stage, setStage] = useState("");

  // Distinct stages in first-seen order.
  const stages = useMemo(() => {
    const seen: string[] = [];
    for (const m of matches) {
      if (m.stage && !seen.includes(m.stage)) seen.push(m.stage);
    }
    return seen;
  }, [matches]);

  const filtered = useMemo(() => {
    const list = stage ? matches.filter((m) => m.stage === stage) : matches;
    return [...list].sort((a, b) => a.matchNo - b.matchNo);
  }, [matches, stage]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <select
          aria-label="Filter by stage"
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-green/60"
        >
          <option value="" className="bg-ink">
            All stages
          </option>
          {stages.map((s) => (
            <option key={s} value={s} className="bg-ink">
              {s}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-white/45">
          {filtered.length} {filtered.length === 1 ? "match" : "matches"}
        </span>
      </div>

      <ul className="space-y-2.5">
        {filtered.map((m) => {
          const decided = Boolean(m.winner);
          return (
            <li
              key={m.matchNo}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <span className="font-display font-bold text-white/55">
                    #{m.matchNo}
                  </span>
                  <span>{m.stage}</span>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {m.isPowerMatch && <Badge tone="grape">Power</Badge>}
                  {m.underdogTeam && <Badge tone="gold">Underdog</Badge>}
                  {m.triviaQuestion && <Badge tone="neutral">Trivia</Badge>}
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base font-bold text-white">
                    <TeamName name={m.team1} winner={m.winner} />{" "}
                    <span className="text-white/30">vs</span>{" "}
                    <TeamName name={m.team2} winner={m.winner} />
                  </p>
                  {m.location && (
                    <p className="mt-0.5 truncate text-xs text-white/45">
                      {m.location}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {decided ? (
                    <span className="font-display text-sm font-extrabold text-brand-green">
                      {m.winner}
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-white/35">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>

              {m.triviaQuestion && (
                <p className="mt-2 border-t border-white/10 pt-2 text-xs text-white/45">
                  ❓ {m.triviaQuestion}
                  {m.triviaAnswer ? (
                    <span className="text-white/70"> → {m.triviaAnswer}</span>
                  ) : null}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TeamName({ name, winner }: { name: string; winner: string }) {
  const isWinner =
    winner && name && winner.trim().toLowerCase() === name.trim().toLowerCase();
  return (
    <span className={isWinner ? "text-brand-green" : "text-white"}>{name}</span>
  );
}
