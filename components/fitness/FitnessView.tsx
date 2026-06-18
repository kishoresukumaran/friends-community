"use client";

import { useMemo, useState } from "react";
import { FitnessMonth } from "@/lib/types";
import { monthLabel } from "@/lib/util";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function FitnessView({ months }: { months: FitnessMonth[] }) {
  // months arrive newest-first from the loader.
  const [selectedId, setSelectedId] = useState(months[0]?.id ?? "");

  const selected = useMemo(
    () => months.find((m) => m.id === selectedId) ?? months[0],
    [months, selectedId]
  );

  const monthTotal = useMemo(
    () =>
      selected
        ? Math.round(
            selected.entries.reduce((s, e) => s + e.distanceKm, 0) * 10
          ) / 10
        : 0,
    [selected]
  );

  const maxDistance = useMemo(
    () => Math.max(1, ...(selected?.entries.map((e) => e.distanceKm) ?? [1])),
    [selected]
  );

  // All-time totals across every recorded month.
  const allTime = useMemo(() => {
    const map = new Map<
      string,
      { name: string; total: number; months: number }
    >();
    for (const m of months) {
      for (const e of m.entries) {
        const key = e.memberId || e.name;
        const cur = map.get(key) ?? { name: e.name, total: 0, months: 0 };
        cur.total += e.distanceKm;
        cur.months += 1;
        cur.name = e.name;
        map.set(key, cur);
      }
    }
    return Array.from(map.values())
      .map((r) => ({ ...r, total: Math.round(r.total * 10) / 10 }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [months]);

  const allTimeTotal = useMemo(
    () => Math.round(allTime.reduce((s, r) => s + r.total, 0) * 10) / 10,
    [allTime]
  );
  const maxAllTime = useMemo(
    () => Math.max(1, ...allTime.map((r) => r.total)),
    [allTime]
  );

  if (!selected) return null;

  const winner = selected.entries[0];

  return (
    <div className="space-y-10">
      {/* Month picker */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-semibold text-white/60">Month</label>
        <select
          aria-label="Select month"
          value={selected.id}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-green/60"
        >
          {months.map((m) => (
            <option key={m.id} value={m.id} className="bg-ink">
              {monthLabel(m.year, m.month)}
            </option>
          ))}
        </select>
      </div>

      {/* Monthly leaderboard */}
      <section>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold text-white sm:text-2xl">
            {monthLabel(selected.year, selected.month)}
          </h2>
          {winner && (
            <p className="text-sm text-white/60">
              Champion: <span className="font-semibold text-gold">🏆 {winner.name}</span>
            </p>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
          <Stat value={`${monthTotal}`} label="Total km" />
          <Stat
            value={`${selected.entries.length}`}
            label={selected.entries.length === 1 ? "Participant" : "Participants"}
            tone="green"
          />
          {winner && <Stat value={`${winner.distanceKm}`} label="Top distance" />}
        </div>

        {selected.entries.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">
            No distances logged for this month yet.
          </p>
        ) : (
          <ul className="mt-5 space-y-2.5">
            {selected.entries.map((e, i) => (
              <li
                key={`${e.memberId || e.name}`}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                  i === 0
                    ? "border-gold/40 bg-gold/10"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <span className="w-7 shrink-0 text-center font-display text-lg font-extrabold text-white/50">
                  {i < 3 ? MEDALS[i] : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">{e.name}</p>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand-green"
                      style={{ width: `${(e.distanceKm / maxDistance) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 font-display text-lg font-extrabold text-white">
                  {e.distanceKm}
                  <span className="ml-1 text-xs font-medium text-white/40">km</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* All-time leaderboard */}
      <section className="border-t border-white/10 pt-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-green">
              Since day one
            </p>
            <h2 className="mt-0.5 font-display text-xl font-extrabold text-white sm:text-2xl">
              All-time distance
            </h2>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-center sm:grid-cols-3">
          <Stat value={`${allTimeTotal}`} label="Total km logged" />
          <Stat value={`${months.length}`} label="Months tracked" tone="green" />
          <Stat value={`${allTime.length}`} label="People" />
        </div>

        <ul className="mt-5 space-y-2.5">
          {allTime.map((r, i) => (
            <li
              key={r.name}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                i === 0
                  ? "border-gold/40 bg-gold/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <span className="w-7 shrink-0 text-center font-display text-lg font-extrabold text-white/50">
                {i < 3 ? MEDALS[i] : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">{r.name}</p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-teal"
                    style={{ width: `${(r.total / maxAllTime) * 100}%` }}
                  />
                </div>
              </div>
              <span className="shrink-0 text-right">
                <span className="font-display text-lg font-extrabold text-white">
                  {r.total}
                  <span className="ml-1 text-xs font-medium text-white/40">km</span>
                </span>
                <span className="block text-xs text-white/40">
                  {r.months} {r.months === 1 ? "month" : "months"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  value,
  label,
  tone = "default",
}: {
  value: string;
  label: string;
  tone?: "default" | "green";
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-3">
      <div
        className={`font-display text-xl font-extrabold ${
          tone === "green" ? "text-brand-green" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-xs font-medium text-white/55">{label}</div>
    </div>
  );
}
