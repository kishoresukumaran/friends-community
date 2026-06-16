import Badge from "@/components/ui/Badge";

export interface HeroStats {
  friends: number;
  contests: number;
  movies: number;
}

export default function Hero({ stats }: { stats: HeroStats }) {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-aurora"
    >
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="flex flex-col items-center text-center">
          <Badge tone="grape">🌍 Friends across the globe</Badge>

          <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Welcome to{" "}
            <span className="text-gradient animate-shimmer">Friends Community</span>
          </h1>

          <p className="mt-4 max-w-xl text-balance text-base text-white/70 sm:text-lg">
            One crew, scattered everywhere, united by good banter. Make your
            predictions, rate the movies, and settle who really has the best
            takes. 🏆
          </p>

          {/* Fun floating stat chips set the social tone without external images */}
          <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-3 sm:gap-4">
            <Stat emoji="👥" value={String(stats.friends)} label="Friends" />
            <Stat emoji="🎯" value={String(stats.contests)} label="Contests" />
            <Stat
              emoji="🎬"
              value={String(stats.movies)}
              label={stats.movies === 1 ? "Movie rated" : "Movies rated"}
            />
          </div>
        </div>
      </div>

      {/* Smoothly dissolve the aurora into the page background to avoid a hard edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink"
      />
    </section>
  );
}

function Stat({
  emoji,
  value,
  label,
}: {
  emoji: string;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-2 py-4 text-center backdrop-blur-sm">
      <div className="text-2xl animate-floaty">{emoji}</div>
      <div className="mt-1 font-display text-xl font-extrabold text-white">
        {value}
      </div>
      <div className="text-xs font-medium text-white/60">{label}</div>
    </div>
  );
}
