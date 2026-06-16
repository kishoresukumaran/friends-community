"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Contest } from "@/lib/types";

export interface FifaPreview {
  playing: number;
  played: number;
  total: number;
  top: { name: string; total: number }[];
}

const CONTEST_LINKS: Record<string, string> = {
  "fifa-2026": "/contests/fifa-2026",
};

const MEDALS = ["🥇", "🥈", "🥉"];

type Tab = "contests" | "hof";

export default function ContestsView({
  active,
  archived,
  fifaPreview,
}: {
  active: Contest[];
  archived: Contest[];
  fifaPreview?: FifaPreview;
}) {
  const [tab, setTab] = useState<Tab>("contests");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 rounded-2xl bg-white/5 p-1">
        <TabButton
          active={tab === "contests"}
          onClick={() => setTab("contests")}
        >
          Contests
        </TabButton>
        <TabButton active={tab === "hof"} onClick={() => setTab("hof")}>
          Hall of Fame 🏆
        </TabButton>
      </div>

      {tab === "contests" ? (
        <ContestsTab
          active={active}
          archived={archived}
          fifaPreview={fifaPreview}
        />
      ) : (
        <HallOfFame archived={archived} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active
          ? "bg-white text-ink shadow-pop"
          : "text-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function ContestsTab({
  active,
  archived,
  fifaPreview,
}: {
  active: Contest[];
  archived: Contest[];
  fifaPreview?: FifaPreview;
}) {
  const [archiveOpen, setArchiveOpen] = useState(false);

  return (
    <div className="space-y-8">
      {/* Active — always visible */}
      <section>
        <SectionHeading title="Active contests" count={active.length} />
        {active.length === 0 ? (
          <Empty text="No active contests right now. Check back soon ⚽" />
        ) : (
          <div className="mt-4 space-y-4">
            {active.map((contest) => (
              <ActiveContestCard
                key={contest.id}
                contest={contest}
                fifaPreview={
                  contest.id === "fifa-2026" ? fifaPreview : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Archived — collapsible via plain heading toggle, no outer card */}
      <section>
        <div className="border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={() => setArchiveOpen((v) => !v)}
            aria-expanded={archiveOpen}
            className="flex w-full items-center gap-3 text-left"
          >
            <SectionHeading
              title="Archived contests"
              count={archived.length}
            />
            <span
              className={`ml-auto shrink-0 text-white/40 transition-transform duration-300 ${
                archiveOpen ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </button>

          <div
            className={`overflow-hidden transition-[max-height] duration-300 ${
              archiveOpen ? "max-h-[2000px]" : "max-h-0"
            }`}
          >
            {archived.length === 0 ? (
              <p className="mt-4 text-sm text-white/50">
                No archived contests yet.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {archived.map((past) => (
                  <ArchivedContestCard key={past.id} contest={past} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({
  title,
  count,
}: {
  title: string;
  count: number;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="font-display text-lg font-extrabold text-white sm:text-xl">
        {title}
      </span>
      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/60">
        {count}
      </span>
    </span>
  );
}

function ActiveContestCard({
  contest,
  fifaPreview,
}: {
  contest: Contest;
  fifaPreview?: FifaPreview;
}) {
  const href = CONTEST_LINKS[contest.id];
  const leader = fifaPreview?.top[0];

  const inner = (
    <Card
      className={
        href
          ? "transition group-hover:border-white/25 group-hover:bg-white/[0.07]"
          : ""
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-teal to-brand-green text-3xl shadow-pop">
            {contest.emoji}
          </span>
          <div>
            <h3 className="font-display text-xl font-extrabold text-white sm:text-2xl">
              {contest.title}
            </h3>
            <p className="mt-0.5 text-sm text-white/60">{contest.tagline}</p>
          </div>
        </div>
        <Badge tone="live" pulse>
          Live
        </Badge>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <MiniStat
          value={`${fifaPreview ? fifaPreview.playing : contest.participants}`}
          label="Playing"
        />
        {fifaPreview ? (
          <MiniStat
            value={`${fifaPreview.played}/${fifaPreview.total}`}
            label="Matches played"
          />
        ) : (
          <MiniStat value={`${contest.daysLeft ?? "—"}`} label="Days left" />
        )}
        {fifaPreview ? (
          <MiniStat
            value={`${fifaPreview.total - fifaPreview.played}`}
            label="Matches left"
            tone="green"
          />
        ) : (
          <MiniStat value="Open" label="Predictions" tone="green" />
        )}
      </div>

      {fifaPreview && fifaPreview.top.length > 0 ? (
        <div className="mt-5 rounded-2xl bg-white/5 px-4 py-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/40">
            Top standings
          </p>
          <ul className="space-y-1.5">
            {fifaPreview.top.map((p, i) => (
              <li
                key={p.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 text-white/85">
                  <span>{MEDALS[i]}</span>
                  <span className="font-medium">{p.name}</span>
                </span>
                <span className="font-display font-extrabold text-gold">
                  {p.total}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        contest.leaderTeaser && (
          <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/80">
            <span className="text-lg">🥇</span>
            <span className="font-semibold">{contest.leaderTeaser}</span>
          </div>
        )
      )}

      {href && (
        <p className="mt-5 flex items-center justify-center gap-1 rounded-full bg-brand-green px-5 py-3 text-center font-semibold text-ink shadow-pop transition group-hover:brightness-110">
          {leader ? "View leaderboard, matches & insights" : "View live standings"} →
        </p>
      )}
    </Card>
  );

  if (!href) return inner;

  return (
    <Link href={href} className="group block">
      {inner}
    </Link>
  );
}

function ArchivedContestCard({ contest }: { contest: Contest }) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/5 text-2xl">
          {contest.emoji}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
            Wrapped
          </p>
          <p className="truncate font-semibold text-white">{contest.title}</p>
          {contest.podium && contest.podium.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-white/60">
              {contest.podium.slice(0, 3).map((name, i) => (
                <span key={name}>
                  <span>{MEDALS[i]}</span> {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-white/60">Champion: {contest.winner}</p>
          )}
        </div>
      </div>
      <Badge tone="gold">Wrapped</Badge>
    </Card>
  );
}

function cleanName(raw?: string): string {
  if (!raw) return "";
  // Strip trophy/medal emojis and surrounding whitespace.
  return raw
    .replace(/🏆/g, "")
    .replace(/🥇/g, "")
    .replace(/🥈/g, "")
    .replace(/🥉/g, "")
    .trim();
}

function championOf(contest: Contest): string {
  return cleanName(contest.podium?.[0] ?? contest.winner);
}

function HallOfFame({ archived }: { archived: Contest[] }) {
  // Aggregate titles (1st-place finishes) per person.
  const titlesByPerson = new Map<string, Contest[]>();
  for (const c of archived) {
    const champ = championOf(c);
    if (!champ) continue;
    const list = titlesByPerson.get(champ) ?? [];
    list.push(c);
    titlesByPerson.set(champ, list);
  }

  const roll = Array.from(titlesByPerson.entries())
    .map(([name, contests]) => ({ name, contests }))
    .sort((a, b) => b.contests.length - a.contests.length || a.name.localeCompare(b.name));

  const totalContests = archived.length;
  const totalChampions = roll.length;
  const mostTitles = roll[0]?.contests.length ?? 0;

  if (totalContests === 0) {
    return <Empty text="No champions yet. The legacy starts soon 🏆" />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Legacy
        </p>
        <h2 className="mt-1 font-display text-2xl font-extrabold text-white sm:text-3xl">
          Hall of Fame
        </h2>
        <p className="mt-1 text-sm text-white/60">
          Every champion the crew has ever crowned.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <MiniStat value={`${totalContests}`} label="Contests" />
        <MiniStat value={`${totalChampions}`} label="Champions" tone="green" />
        <MiniStat value={`${mostTitles}`} label="Most titles" />
      </div>

      {/* Roll of champions — people ranked by titles */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
          Roll of champions
        </p>
        <div className="space-y-2">
          {roll.map((person, i) => (
            <div
              key={person.name}
              className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                i === 0
                  ? "border-gold/40 bg-gold/10"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <span className="font-display text-lg font-extrabold text-white/40 w-6 shrink-0 text-center">
                {i === 0 ? "👑" : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white">
                  {person.name}
                </p>
                <p className="truncate text-xs text-white/50">
                  {person.contests.map((c) => c.title).join(" · ")}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-gold">
                {person.contests.length} {person.contests.length === 1 ? "title" : "titles"}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Trophy cabinet — one card per contest */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/40">
          Trophy cabinet
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {archived.map((contest) => (
            <TrophyCard key={contest.id} contest={contest} />
          ))}
        </div>
      </section>
    </div>
  );
}

function TrophyCard({ contest }: { contest: Contest }) {
  const champion = championOf(contest);
  const runners = contest.podium?.slice(1, 3) ?? [];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.12] to-white/[0.02] p-5">
      <span className="pointer-events-none absolute -right-3 -top-3 text-7xl opacity-10">
        🏆
      </span>
      <div className="flex items-center gap-2">
        <span className="text-lg">{contest.emoji}</span>
        <p className="truncate text-sm font-semibold text-white/70">
          {contest.title}
        </p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-2xl">🥇</span>
        <span className="font-display text-xl font-extrabold text-white">
          {champion}
        </span>
      </div>
      {runners.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-white/55">
          {runners.map((name, i) => (
            <span key={name}>
              <span>{MEDALS[i + 1]}</span> {cleanName(name)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-2 text-sm text-white/50">{text}</p>;
}

function MiniStat({
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
        className={`font-display text-lg font-extrabold ${
          tone === "green" ? "text-brand-green" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-xs font-medium text-white/55">{label}</div>
    </div>
  );
}
