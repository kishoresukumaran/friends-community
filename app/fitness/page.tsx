import Link from "next/link";

export const metadata = {
  title: "Fitness Challenges — Friends Community",
};

export default function FitnessPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-semibold text-white/50 transition hover:text-white/80"
        >
          ← Back to home
        </Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Fitness <span className="text-gradient">Challenges</span> 💪
        </h1>
        <p className="mt-2 text-white/60">
          Monthly challenges, leaderboards, and bragging rights — soon.
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-card sm:p-14">
        <span className="pointer-events-none absolute -right-6 -top-6 text-[8rem] opacity-10 sm:text-[12rem]">
          🏃
        </span>

        <div className="relative">
          <span className="inline-grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-teal to-brand-green text-5xl shadow-pop">
            🏋️
          </span>

          <p className="mt-6 inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-green">
            Coming soon
          </p>

          <h2 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">
            Lacing up the running shoes... 👟
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-balance text-white/65">
            This is where our monthly fitness challenges will live — who ran the
            most, who walked the furthest, and who mysteriously &quot;forgot&quot; to
            log their steps. Leaderboards, distances, and shameless flexing,
            all in one place.
          </p>

          <div className="mx-auto mt-8 grid max-w-lg gap-3 text-left sm:grid-cols-3">
            <ComingFeature emoji="🏆" label="Monthly winners" />
            <ComingFeature emoji="🏃" label="Distance ran & walked" />
            <ComingFeature emoji="📊" label="Leaderboards & streaks" />
          </div>

          <p className="mt-8 text-sm text-white/40">
            Until then, the only rep that counts is tapping{" "}
            <Link
              href="/"
              className="font-semibold text-white/70 underline-offset-2 hover:underline"
            >
              back to home
            </Link>
            . 😅
          </p>
        </div>
      </div>
    </main>
  );
}

function ComingFeature({ emoji, label }: { emoji: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-2xl">{emoji}</span>
      <span className="text-sm font-semibold text-white/80">{label}</span>
    </div>
  );
}
