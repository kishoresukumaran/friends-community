"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FitnessMonth, Member } from "@/lib/types";
import { monthLabel } from "@/lib/util";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const fieldClass =
  "rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-green/60";

export default function FitnessManager({
  members,
  months,
}: {
  members: Member[];
  months: FitnessMonth[];
}) {
  const router = useRouter();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [distances, setDistances] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const yearOptions = useMemo(() => {
    const set = new Set<number>();
    const current = now.getFullYear();
    for (let y = current - 3; y <= current + 1; y++) set.add(y);
    for (const m of months) set.add(m.year);
    set.add(year);
    return Array.from(set).sort((a, b) => b - a);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months, year]);

  // Prefill the inputs whenever the selected month (or source data) changes.
  useEffect(() => {
    const existing = months.find((m) => m.year === year && m.month === month);
    const next: Record<string, string> = {};
    for (const mem of members) {
      const entry = existing?.entries.find(
        (e) => e.memberId === mem.id || e.name === mem.name
      );
      next[mem.id] = entry ? String(entry.distanceKm) : "";
    }
    setDistances(next);
    setSaved(false);
    setError("");
  }, [year, month, members, months]);

  function setDistance(id: string, value: string) {
    setDistances((prev) => ({ ...prev, [id]: value }));
    setSaved(false);
  }

  const filledCount = useMemo(
    () =>
      Object.values(distances).filter((v) => Number(v) > 0).length,
    [distances]
  );

  async function save() {
    setBusy(true);
    setError("");
    setSaved(false);
    const entries = members
      .map((m) => ({
        memberId: m.id,
        name: m.name,
        distanceKm: Number(distances[m.id]),
      }))
      .filter((e) => Number.isFinite(e.distanceKm) && e.distanceKm > 0);
    try {
      const res = await fetch("/api/fitness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, month, entries }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save this month.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(m: FitnessMonth) {
    if (!confirm(`Delete ${monthLabel(m.year, m.month)}?`)) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/fitness/${m.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Could not delete this month.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <h2 className="font-display text-xl font-extrabold text-white">
        Fitness Challenges
      </h2>
      <p className="mt-1 text-sm text-white/50">
        Pick a month, then enter how far each person ran or walked (in km).
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          aria-label="Month"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className={`flex-1 ${fieldClass}`}
        >
          {MONTHS.map((name, i) => (
            <option key={name} value={i + 1} className="bg-ink">
              {name}
            </option>
          ))}
        </select>
        <select
          aria-label="Year"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className={`w-32 ${fieldClass}`}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y} className="bg-ink">
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-white/80">
          Distances{" "}
          <span className="font-medium text-white/40">
            ({filledCount} entered)
          </span>
        </p>
        {members.length === 0 ? (
          <p className="mt-2 text-sm text-white/40">
            Add members above first, then enter their distances here.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-white/5">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <span className="text-sm text-white/80">{m.name}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    inputMode="decimal"
                    value={distances[m.id] ?? ""}
                    onChange={(e) => setDistance(m.id, e.target.value)}
                    placeholder="0"
                    className="w-24 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-right text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-green/60"
                  />
                  <span className="w-6 text-sm text-white/40">km</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-sunset">{error}</p>}
      {saved && (
        <p className="mt-3 text-sm text-brand-green">
          Saved {monthLabel(year, month)}.
        </p>
      )}

      <div className="mt-4">
        <button
          type="button"
          onClick={save}
          disabled={busy || members.length === 0}
          className="rounded-full bg-brand-green px-5 py-2.5 font-semibold text-ink transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Saving…" : `Save ${monthLabel(year, month)}`}
        </button>
      </div>

      {months.length > 0 && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-sm font-semibold text-white/80">Recorded months</p>
          <ul className="mt-3 space-y-2">
            {months.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {monthLabel(m.year, m.month)}
                  </p>
                  <p className="text-xs text-white/50">
                    {m.entries.length}{" "}
                    {m.entries.length === 1 ? "person" : "people"}
                    {m.entries[0]
                      ? ` · 🥇 ${m.entries[0].name} (${m.entries[0].distanceKm} km)`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setYear(m.year);
                      setMonth(m.month);
                    }}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    disabled={busy}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/80 transition hover:border-sunset/40 hover:bg-sunset/10 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
