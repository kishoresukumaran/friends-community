"use client";

import { useState } from "react";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Contest } from "@/lib/types";

// Brief live standings for the FIFA card, derived on the server.
export interface FifaPreview {
  playing: number;
  played: number;
  total: number;
  top: { name: string; total: number }[];
}

// Contests that have a dedicated detail page in the app.
const CONTEST_LINKS: Record<string, string> = {
  "fifa-2026": "/contests/fifa-2026",
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default function ContestsView({
  active,
  archived,
  fifaPreview,
}: {
  active: Contest[];
  archived: Contest[];
  fifaPreview?: FifaPreview;
}) {
  return (
    <div className="space-y-5">
      <Collapsible
        title="Active contests"
        count={active.length}
        defaultOpen
      >
        {active.length === 0 ? (
          <Empty text="No active contests right now. Check back soon ⚽" />
        ) : (
          <div className="space-y-4">
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
      </Collapsible>

      <Collapsible title="Archived contests" count={archived.length}>
        {archived.length === 0 ? (
          <Empty text="No archived contests yet." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {archived.map((past) => (
              <ArchivedContestCard key={past.id} contest={past} />
            ))}
          </div>
        )}
      </Collapsible>
    </div>
  );
}

function Collapsible({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
      >
        <span className="flex items-center gap-2.5">
          <span className="font-display text-lg font-extrabold text-white sm:text-xl">
            {title}
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/60">
            {count}
          </span>
        </span>
        <span
          className={`text-white/40 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-300 ${
          open ? "max-h-[3000px]" : "max-h-0"
        }`}
      >
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">{children}</div>
      </div>
    </section>
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
        href ? "transition group-hover:border-white/25 group-hover:bg-white/[0.07]" : ""
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
        <MiniStat value="Open" label="Predictions" tone="green" />
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
          {leader
            ? `View leaderboard, matches & insights`
            : `View live standings`}{" "}
          →
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
