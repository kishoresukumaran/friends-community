import { RaterInsights as Insights } from "@/lib/analytics";

export default function RaterInsights({ insights }: { insights: Insights }) {
  const cards = [
    {
      key: "generous",
      emoji: "🥰",
      title: "Most Generous",
      stat: insights.mostGenerous,
      detail: (avg: number) => `${avg.toFixed(1)} ★ avg given`,
    },
    {
      key: "toughest",
      emoji: "🧐",
      title: "Toughest Critic",
      stat: insights.toughestCritic,
      detail: (avg: number) => `${avg.toFixed(1)} ★ avg given`,
    },
    {
      key: "active",
      emoji: "🔥",
      title: "Most Active",
      stat: insights.mostActive,
      detail: (_avg: number, count: number) => `${count} movies rated`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      {cards.map((c) => (
        <div
          key={c.key}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-grape">
            {c.emoji} {c.title}
          </p>
          {c.stat ? (
            <>
              <p className="mt-1 font-display text-lg font-extrabold text-white">
                {c.stat.name}
              </p>
              <p className="text-sm text-white/55">
                {c.detail(c.stat.average, c.stat.count)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-sm text-white/40">Not enough data yet</p>
          )}
        </div>
      ))}
    </div>
  );
}
