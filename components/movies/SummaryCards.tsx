import { GroupSummary } from "@/lib/analytics";

export default function SummaryCards({ summary }: { summary: GroupSummary }) {
  const items = [
    { emoji: "🎬", value: summary.totalMovies, label: "Movies" },
    { emoji: "🍿", value: summary.totalRatings, label: "Ratings cast" },
    {
      emoji: "⭐",
      value: summary.groupAverage.toFixed(1),
      label: "Group average",
    },
    { emoji: "🏅", value: summary.fiveStarClub, label: "5-star club" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center"
        >
          <div className="text-2xl">{item.emoji}</div>
          <div className="mt-1 font-display text-2xl font-extrabold text-white">
            {item.value}
          </div>
          <div className="text-xs font-medium text-white/55">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
