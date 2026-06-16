import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";

export interface QuickLinkStats {
  contestsTotal: number;
  contestsLive: number;
  moviesRated: number;
}

export default function QuickLinks({ stats }: { stats: QuickLinkStats }) {
  const liveLabel =
    stats.contestsLive > 0
      ? `${stats.contestsLive} live now`
      : `${stats.contestsTotal} in total`;

  return (
    <section
      id="quick-links"
      className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20"
    >
      <SectionHeading eyebrow="Jump in" title="Quick Links" />

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
        <QuickLinkCard
          href="/contests"
          emoji="🏆"
          title="Contests"
          blurb="Predictions, live standings, and past champions."
          stat={liveLabel}
        />
        <QuickLinkCard
          href="/movies"
          emoji="🍿"
          title="Movie Verdicts"
          blurb="Group ratings, standout films, and the spiciest takes."
          stat={`${stats.moviesRated} ${
            stats.moviesRated === 1 ? "movie" : "movies"
          } rated`}
        />
        <QuickLinkCard
          href="/fitness"
          emoji="💪"
          title="Fitness Challenges"
          blurb="Monthly challenges, distances, and who actually showed up."
          stat="Coming soon"
          className="sm:col-span-2"
        />
      </div>
    </section>
  );
}

function QuickLinkCard({
  href,
  emoji,
  title,
  blurb,
  stat,
  className = "",
}: {
  href: string;
  emoji: string;
  title: string;
  blurb: string;
  stat: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-card backdrop-blur-sm transition hover:border-white/25 hover:bg-white/[0.07] sm:p-6 ${className}`}
    >
      <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-teal to-brand-green text-3xl shadow-pop">
        {emoji}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-xl font-extrabold text-white sm:text-2xl">
          {title}
        </h3>
        <p className="mt-0.5 text-sm text-white/60">{blurb}</p>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-brand-green">
          {stat}
        </p>
      </div>
      <span className="shrink-0 text-2xl text-white/30 transition group-hover:translate-x-1 group-hover:text-white/60">
        →
      </span>
    </Link>
  );
}
