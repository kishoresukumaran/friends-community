"use client";

import { useState } from "react";
import { FifaSnapshot } from "@/lib/types";
import FifaLeaderboard from "@/components/fifa/FifaLeaderboard";
import FifaMatches from "@/components/fifa/FifaMatches";
import PlayerDetail from "@/components/fifa/PlayerDetail";
import FifaInsights from "@/components/fifa/FifaInsights";

type Tab = "leaderboard" | "insights" | "matches" | "players";

const TABS: { key: Tab; label: string }[] = [
  { key: "leaderboard", label: "🏆 Leaderboard" },
  { key: "insights", label: "📊 Insights" },
  { key: "matches", label: "📅 Matches" },
  { key: "players", label: "👤 Players" },
];

export default function FifaDashboard({
  snapshot,
}: {
  snapshot: FifaSnapshot;
}) {
  const [tab, setTab] = useState<Tab>("leaderboard");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1.5 rounded-full bg-white/5 p-1.5 sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition sm:flex-none ${
              tab === t.key
                ? "bg-brand-green text-ink"
                : "text-white/60 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "leaderboard" && (
        <FifaLeaderboard leaderboard={snapshot.leaderboard} />
      )}
      {tab === "insights" && <FifaInsights snapshot={snapshot} />}
      {tab === "matches" && <FifaMatches matches={snapshot.matches} />}
      {tab === "players" && <PlayerDetail snapshot={snapshot} />}
    </div>
  );
}
