"use client";

import { useMemo, useState } from "react";
import { FifaSnapshot } from "@/lib/types";
import {
  accuracyTable,
  categoryChampions,
  championSurvival,
  contrarianWins,
  formTable,
  headToHead,
  matchPickStats,
  mostDivisiveMatch,
  norm,
  titleRace,
  wisdomOfCrowd,
} from "@/lib/fifa-analytics";

export default function FifaInsights({ snapshot }: { snapshot: FifaSnapshot }) {
  const race = useMemo(() => titleRace(snapshot.leaderboard), [snapshot]);
  const accuracy = useMemo(() => accuracyTable(snapshot), [snapshot]);
  const form = useMemo(() => formTable(snapshot, 5), [snapshot]);
  const champions = useMemo(
    () => categoryChampions(snapshot.leaderboard),
    [snapshot]
  );
  const contrarians = useMemo(() => contrarianWins(snapshot), [snapshot]);
  const divisive = useMemo(() => mostDivisiveMatch(snapshot), [snapshot]);
  const wisdom = useMemo(() => wisdomOfCrowd(snapshot), [snapshot]);
  const crowdCorrect = useMemo(
    () =>
      matchPickStats(snapshot)
        .filter((s) => s.decided && s.majorityCorrect)
        .sort((a, b) => b.matchNo - a.matchNo),
    [snapshot]
  );
  const survival = useMemo(() => championSurvival(snapshot), [snapshot]);

  return (
    <div className="space-y-5">
      <TitleRaceCard race={race} />
      <CategoryChampionsCard champions={champions} />
      <FormCard form={form} />
      <AccuracyCard accuracy={accuracy} />
      <CrowdCard
        contrarians={contrarians}
        divisive={divisive}
        wisdom={wisdom}
        crowdCorrect={crowdCorrect}
      />
      <ChampionSurvivalCard survival={survival} />
      <HeadToHeadCard snapshot={snapshot} />
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="mb-3">
        <h3 className="font-display text-base font-bold text-white sm:text-lg">
          {title}
        </h3>
        {subtitle && <p className="mt-0.5 text-xs text-white/45">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-white/40">{text}</p>;
}

// --- Title race ----------------------------------------------------------

function TitleRaceCard({
  race,
}: {
  race: ReturnType<typeof titleRace>;
}) {
  if (race.length === 0) return null;
  const max = race[0].total || 1;
  return (
    <Section title="🏁 Title race" subtitle="Who's chasing whom for the crown">
      <ul className="space-y-2.5">
        {race.map((r) => (
          <li key={`${r.rank}-${r.name}`} className="flex items-center gap-3">
            <span className="w-6 shrink-0 text-center font-display text-sm font-extrabold text-white/45">
              {r.rank}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate font-semibold text-white">
                  {r.name}
                </span>
                <span className="shrink-0 text-xs text-white/45">
                  {r.toOvertake === null ? (
                    <span className="font-semibold text-gold">Leader</span>
                  ) : r.behindLeader === 0 ? (
                    "Tied for 1st"
                  ) : (
                    `${r.behindLeader} behind · +${r.toOvertake} to climb`
                  )}
                </span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-brand-green"
                  style={{ width: `${Math.max(4, (r.total / max) * 100)}%` }}
                />
              </div>
            </div>
            <span className="w-10 shrink-0 text-right font-display text-base font-extrabold text-gold">
              {r.total}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// --- Category champions --------------------------------------------------

function CategoryChampionsCard({
  champions,
}: {
  champions: ReturnType<typeof categoryChampions>;
}) {
  return (
    <Section
      title="🎖️ Category champions"
      subtitle="Top scorer in each part of the game"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {champions.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center"
          >
            <div className="text-2xl">{c.emoji}</div>
            <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-white/45">
              {c.label}
            </div>
            <div className="mt-1 truncate font-semibold text-white">
              {c.names.length === 0 ? "—" : c.names.join(", ")}
            </div>
            <div className="text-xs text-white/45">
              {c.names.length === 0 ? "no points yet" : `${c.value} pts`}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// --- Form ----------------------------------------------------------------

const FORM_DOT: Record<string, string> = {
  correct: "bg-brand-green",
  wrong: "bg-sunset",
  none: "bg-white/15",
};

function FormCard({ form }: { form: ReturnType<typeof formTable> }) {
  if (form.recentMatchNos.length === 0) {
    return (
      <Section title="🔥 Form guide" subtitle="Last 5 decided matches">
        <Empty text="No matches decided yet — form will light up once results roll in." />
      </Section>
    );
  }
  const top = form.rows.slice(0, 10);
  return (
    <Section
      title="🔥 Form guide"
      subtitle={`Last ${form.recentMatchNos.length} decided matches`}
    >
      {form.hottest && form.hottest.played > 0 && (
        <p className="mb-3 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/80">
          <span className="text-base">🔥</span>{" "}
          <span className="font-semibold text-white">{form.hottest.name}</span>{" "}
          is hottest — {form.hottest.correct}/{form.hottest.played} in the recent
          run.
        </p>
      )}
      <ul className="space-y-2">
        {top.map((r) => (
          <li
            key={r.name}
            className="flex items-center justify-between gap-3"
          >
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/85">
              {r.name}
            </span>
            <div className="flex shrink-0 items-center gap-1.5">
              {r.cells.map((c) => (
                <span
                  key={c.matchNo}
                  title={`Match #${c.matchNo}: ${c.result}`}
                  className={`h-3 w-3 rounded-full ${FORM_DOT[c.result]}`}
                />
              ))}
              <span className="ml-1 w-9 text-right text-xs text-white/45">
                {r.correct}/{r.played}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// --- Accuracy ------------------------------------------------------------

function AccuracyCard({
  accuracy,
}: {
  accuracy: ReturnType<typeof accuracyTable>;
}) {
  if (accuracy.length === 0) {
    return (
      <Section title="🎯 Accuracy ranking" subtitle="Hit-rate, not just points">
        <Empty text="No decided predictions yet." />
      </Section>
    );
  }
  return (
    <Section
      title="🎯 Accuracy ranking"
      subtitle="Share of decided picks each player got right"
    >
      <ul className="space-y-2">
        {accuracy.slice(0, 12).map((r, i) => (
          <li key={r.name} className="flex items-center gap-3">
            <span className="w-5 shrink-0 text-center text-xs font-bold text-white/40">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-white/85">
              {r.name}
            </span>
            <div className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-white/10 sm:block">
              <div
                className="h-full rounded-full bg-brand-teal"
                style={{ width: `${Math.round(r.pct * 100)}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right font-display text-sm font-extrabold text-white">
              {Math.round(r.pct * 100)}%
            </span>
            <span className="w-12 shrink-0 text-right text-xs text-white/40">
              {r.correct}/{r.decided}
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// --- Crowd ---------------------------------------------------------------

function CrowdCard({
  contrarians,
  divisive,
  wisdom,
  crowdCorrect,
}: {
  contrarians: ReturnType<typeof contrarianWins>;
  divisive: ReturnType<typeof mostDivisiveMatch>;
  wisdom: ReturnType<typeof wisdomOfCrowd>;
  crowdCorrect: ReturnType<typeof matchPickStats>;
}) {
  const [open, setOpen] = useState(false);
  const expandable = crowdCorrect.length > 0;
  return (
    <Section
      title="🧩 Crowd vs contrarian"
      subtitle="Where the group agreed, split, and got it wrong"
    >
      {/* Wisdom meter — click to expand the matches the crowd nailed */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03]">
        <button
          type="button"
          onClick={() => expandable && setOpen((v) => !v)}
          aria-expanded={open}
          disabled={!expandable}
          className={`w-full p-3 text-left ${
            expandable ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-white/80">
              Wisdom of the crowd
            </span>
            <span className="flex items-center gap-1.5">
              <span className="font-display text-sm font-extrabold text-white">
                {wisdom.total === 0 ? "—" : `${Math.round(wisdom.pct * 100)}%`}
              </span>
              {expandable && (
                <span
                  className={`text-xs text-white/40 transition-transform duration-300 ${
                    open ? "rotate-180" : ""
                  }`}
                >
                  ▾
                </span>
              )}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-grape"
              style={{ width: `${Math.round(wisdom.pct * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-white/45">
            {wisdom.total === 0
              ? "No decided matches yet."
              : `The majority pick was right in ${wisdom.correct} of ${wisdom.total} decided matches.${
                  expandable ? (open ? "" : " Tap to see them.") : ""
                }`}
          </p>
        </button>
        {open && expandable && (
          <ul className="border-t border-white/10 px-3 py-2">
            {crowdCorrect.map((s) => (
              <li
                key={s.matchNo}
                className="flex items-center justify-between gap-2 py-1.5 text-sm"
              >
                <span className="min-w-0 truncate text-white/80">
                  <span className="text-white/40">#{s.matchNo}</span>{" "}
                  <span className="text-brand-green">{s.winner}</span>
                  <span className="text-white/40">
                    {" "}
                    over {norm(s.winner) === norm(s.team1) ? s.team2 : s.team1}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-white/45">
                  {s.majorityCount}/{s.total} ({Math.round(s.majorityPct * 100)}
                  %)
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Most divisive */}
      {divisive && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
            Most divisive match
          </div>
          <div className="mt-1 font-display font-bold text-white">
            #{divisive.matchNo} {divisive.team1} vs {divisive.team2}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
            <span className="font-semibold text-white/80">
              {divisive.team1} {divisive.team1Count}
            </span>
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-brand-teal"
                style={{
                  width: `${(divisive.team1Count / divisive.total) * 100}%`,
                }}
              />
              <div
                className="h-full bg-sunset"
                style={{
                  width: `${(divisive.team2Count / divisive.total) * 100}%`,
                }}
              />
            </div>
            <span className="font-semibold text-white/80">
              {divisive.team2Count} {divisive.team2}
            </span>
          </div>
          {divisive.decided && divisive.winner && (
            <p className="mt-1.5 text-xs text-white/45">
              Winner: <span className="text-brand-green">{divisive.winner}</span>
            </p>
          )}
        </div>
      )}

      {/* Contrarian wins */}
      <div className="mt-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
          🧠 Galaxy-brain calls
        </div>
        {contrarians.length === 0 ? (
          <Empty text="No upsets against the crowd yet." />
        ) : (
          <ul className="space-y-2">
            {contrarians.slice(0, 5).map((c) => (
              <ContrarianRow key={c.matchNo} c={c} />
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}

function ContrarianRow({
  c,
}: {
  c: ReturnType<typeof contrarianWins>[number];
}) {
  const [open, setOpen] = useState(false);
  const canExpand = c.backers.length > 0;
  return (
    <li className="overflow-hidden rounded-xl bg-white/5 text-sm">
      <button
        type="button"
        onClick={() => canExpand && setOpen((v) => !v)}
        aria-expanded={open}
        disabled={!canExpand}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="truncate text-white/80">
          <span className="text-white/40">#{c.matchNo}</span> {c.label} →{" "}
          <span className="text-brand-green">{c.winner}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-white/45">
          {c.backerCount}/{c.total} called it
          {canExpand && (
            <span
              className={`transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          )}
        </span>
      </button>
      {open && canExpand && (
        <p className="border-t border-white/10 px-3 py-2 text-xs text-white/70">
          {c.backers.join(", ")}
        </p>
      )}
    </li>
  );
}

// --- Champion survival ---------------------------------------------------

function ChampionSurvivalCard({
  survival,
}: {
  survival: ReturnType<typeof championSurvival>;
}) {
  if (survival.rows.length === 0) {
    return (
      <Section title="🏆 Who picked the champion?" subtitle="Pre-tournament title bets">
        <Empty text="No champion picks recorded." />
      </Section>
    );
  }
  const max = survival.rows[0].count || 1;
  return (
    <Section
      title="🏆 Who picked the champion?"
      subtitle={
        survival.knockoutStarted
          ? "Crossed-out teams are knocked out"
          : "Title bets — eliminations show once knockouts begin"
      }
    >
      <ul className="space-y-1.5">
        {survival.rows.map((r) => (
          <ChampionRow key={r.team} r={r} max={max} />
        ))}
      </ul>
    </Section>
  );
}

function ChampionRow({
  r,
  max,
}: {
  r: ReturnType<typeof championSurvival>["rows"][number];
  max: number;
}) {
  const [open, setOpen] = useState(false);
  const canExpand = r.backers.length > 0;
  return (
    <li className="overflow-hidden rounded-xl">
      <button
        type="button"
        onClick={() => canExpand && setOpen((v) => !v)}
        aria-expanded={open}
        disabled={!canExpand}
        className="flex w-full items-center gap-3 py-1 text-left"
      >
        <span
          className={`w-24 shrink-0 truncate font-semibold sm:w-32 ${
            r.eliminated ? "text-white/35 line-through" : "text-white"
          }`}
        >
          {r.team}
        </span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${
              r.eliminated ? "bg-white/20" : "bg-gold"
            }`}
            style={{ width: `${Math.max(6, (r.count / max) * 100)}%` }}
          />
        </div>
        <span className="w-8 shrink-0 text-right text-sm text-white/60">
          {r.count}
        </span>
        {r.eliminated && (
          <span className="shrink-0 text-xs font-semibold text-sunset">OUT</span>
        )}
        {canExpand && (
          <span
            className={`shrink-0 text-xs text-white/40 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        )}
      </button>
      {open && canExpand && (
        <p className="px-1 pb-2 pl-1 text-xs text-white/60">
          {r.backers.join(", ")}
        </p>
      )}
    </li>
  );
}

// --- Head to head --------------------------------------------------------

function HeadToHeadCard({ snapshot }: { snapshot: FifaSnapshot }) {
  const players = useMemo(
    () =>
      [...snapshot.leaderboard].sort(
        (a, b) => b.total - a.total || a.name.localeCompare(b.name)
      ),
    [snapshot.leaderboard]
  );

  const [emailA, setEmailA] = useState(players[0]?.email || "");
  const [emailB, setEmailB] = useState(players[1]?.email || players[0]?.email || "");

  const h2h = useMemo(
    () => headToHead(snapshot, emailA, emailB),
    [snapshot, emailA, emailB]
  );

  if (players.length < 2) {
    return (
      <Section title="⚔️ Head to head">
        <Empty text="Need at least two players to compare." />
      </Section>
    );
  }

  const divergences = h2h.rows.filter((r) => r.pickA && r.pickB && !r.agree);

  return (
    <Section title="⚔️ Head to head" subtitle="Compare any two players">
      <div className="grid grid-cols-2 gap-2">
        <select
          aria-label="Player A"
          value={emailA}
          onChange={(e) => setEmailA(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-green/60"
        >
          {players.map((p) => (
            <option key={p.email || p.name} value={p.email} className="bg-ink">
              {p.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Player B"
          value={emailB}
          onChange={(e) => setEmailB(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-green/60"
        >
          {players.map((p) => (
            <option key={p.email || p.name} value={p.email} className="bg-ink">
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {emailA === emailB ? (
        <p className="mt-3 text-sm text-white/40">Pick two different players.</p>
      ) : (
        <>
          {/* Score summary */}
          <div className="mt-3 grid grid-cols-3 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
            <div>
              <div className="font-display text-xl font-extrabold text-white">
                {h2h.a?.total ?? 0}
              </div>
              <div className="truncate text-xs text-white/50">{h2h.a?.name}</div>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
              vs
            </div>
            <div>
              <div className="font-display text-xl font-extrabold text-white">
                {h2h.b?.total ?? 0}
              </div>
              <div className="truncate text-xs text-white/50">{h2h.b?.name}</div>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-white/55">
            <span>
              On shared decided picks:{" "}
              <span className="font-semibold text-white/80">
                {h2h.aCorrect}–{h2h.bCorrect}
              </span>
            </span>
            <span>
              Agreed{" "}
              <span className="font-semibold text-white/80">
                {h2h.agreements}
              </span>{" "}
              times
            </span>
            <span>
              Diverged{" "}
              <span className="font-semibold text-white/80">
                {divergences.length}
              </span>{" "}
              times
            </span>
          </div>

          {/* Divergences */}
          <div className="mt-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
              Where they disagree
            </div>
            {divergences.length === 0 ? (
              <Empty text="These two picked identically so far." />
            ) : (
              <ul className="divide-y divide-white/5">
                {divergences.slice(0, 20).map((r) => (
                  <li
                    key={r.matchNo}
                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2 text-sm"
                  >
                    <span
                      className={`truncate text-right ${
                        r.decided
                          ? r.aCorrect
                            ? "font-semibold text-brand-green"
                            : "text-white/45"
                          : "text-white/75"
                      }`}
                    >
                      {r.pickA || "—"}
                    </span>
                    <span className="px-1 text-center text-[11px] text-white/35">
                      #{r.matchNo}
                    </span>
                    <span
                      className={`truncate ${
                        r.decided
                          ? r.bCorrect
                            ? "font-semibold text-brand-green"
                            : "text-white/45"
                          : "text-white/75"
                      }`}
                    >
                      {r.pickB || "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Section>
  );
}
