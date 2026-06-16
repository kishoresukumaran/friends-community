import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Contest } from "@/lib/types";

// Contests that have a live standings page in the app.
const CONTEST_LINKS: Record<string, string> = {
  "fifa-2026": "/fifa-2026",
};

// Live numbers derived from the synced FIFA snapshot, used to override the
// static values stored on the contest record.
export type FifaLiveStats = {
  playing: number;
  played: number;
  total: number;
  leader: { name: string; total: number } | null;
};

export default function ActiveContestsPreview({
  active,
  archived,
  fifaStats,
}: {
  active: Contest[];
  archived: Contest[];
  fifaStats?: FifaLiveStats;
}) {
  return (
    <section id="active-contests" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <SectionHeading
        eyebrow="Happening now"
        title="Active Contests"
        action={
          <span className="hidden text-sm font-semibold text-white/40 sm:block">
            More soon →
          </span>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        {active.map((contest) => {
          const standingsHref = CONTEST_LINKS[contest.id];
          const isFifa = contest.id === "fifa-2026" && fifaStats;
          const leaderTeaser = isFifa
            ? fifaStats!.leader
              ? `${fifaStats!.leader.name} leads with ${fifaStats!.leader.total} pts`
              : null
            : contest.leaderTeaser;
          return (
          <Card key={contest.id} className="sm:col-span-2">
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
                value={`${isFifa ? fifaStats!.playing : contest.participants}`}
                label="Playing"
              />
              {isFifa ? (
                <MiniStat
                  value={`${fifaStats!.played}/${fifaStats!.total}`}
                  label="Matches played"
                />
              ) : (
                <MiniStat value={`${contest.daysLeft ?? "—"}`} label="Days left" />
              )}
              <MiniStat value="Open" label="Predictions" tone="green" />
            </div>

            {leaderTeaser && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm text-white/80">
                <span className="text-lg">🥇</span>
                <span className="font-semibold">{leaderTeaser}</span>
              </div>
            )}

            {standingsHref ? (
              <Link
                href={standingsHref}
                className="mt-5 block w-full rounded-full bg-brand-green px-5 py-3 text-center font-semibold text-ink shadow-pop transition hover:brightness-110"
              >
                View live standings →
              </Link>
            ) : (
              <button
                type="button"
                className="mt-5 w-full rounded-full bg-brand-green px-5 py-3 font-semibold text-ink shadow-pop transition hover:brightness-110"
              >
                Make your predictions →
              </button>
            )}
          </Card>
          );
        })}

        {/* Teaser link to the archive section */}
        {archived.map((past) => (
          <Card key={past.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/5 text-2xl">
                {past.emoji}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
                  From the archive
                </p>
                <p className="font-semibold text-white">{past.title}</p>
                <p className="text-sm text-white/60">Champion: {past.winner}</p>
              </div>
            </div>
            <Badge tone="gold">Wrapped</Badge>
          </Card>
        ))}

        {/* Placeholder for the future full Archive section */}
        <div
          id="archive"
          className="grid place-items-center rounded-3xl border border-dashed border-white/10 p-6 text-center text-sm text-white/50"
        >
          <span>
            📦 Full <span className="font-semibold text-white/70">Archive</span> of past
            contests is coming soon.
          </span>
        </div>
      </div>
    </section>
  );
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
