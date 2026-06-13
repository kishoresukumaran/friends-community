"use client";

import { useMemo, useState } from "react";
import Stars from "@/components/ui/Stars";
import { Movie } from "@/lib/types";

type SortKey = "rating" | "raters" | "year";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Rating" },
  { key: "raters", label: "Raters" },
  { key: "year", label: "Year" },
];

export default function Leaderboard({ movies }: { movies: Movie[] }) {
  const [sort, setSort] = useState<SortKey>("rating");

  const sorted = useMemo(() => {
    const copy = [...movies];
    copy.sort((a, b) => {
      if (sort === "rating") return b.avgStars - a.avgStars || b.votes - a.votes;
      if (sort === "raters") return b.votes - a.votes || b.avgStars - a.avgStars;
      return (b.year || 0) - (a.year || 0) || b.avgStars - a.avgStars;
    });
    return copy;
  }, [movies, sort]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-white">
          Leaderboard
        </h3>
        <div className="flex gap-1 rounded-full bg-white/5 p-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                sort === s.key
                  ? "bg-brand-green text-ink"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-3 text-sm text-white/40">No movies match.</p>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {sorted.map((movie, i) => (
            <li
              key={movie.id}
              className="flex items-center gap-3 rounded-xl px-2 py-2 odd:bg-white/[0.02]"
            >
              <span className="w-5 shrink-0 text-center font-display text-sm font-extrabold text-white/40">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {movie.title}
                  {movie.year ? (
                    <span className="font-normal text-white/40">
                      {" "}
                      ({movie.year})
                    </span>
                  ) : null}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Stars value={movie.avgStars} size="sm" />
                  <span className="text-xs text-white/45">
                    {movie.votes} {movie.votes === 1 ? "rater" : "raters"}
                  </span>
                </div>
              </div>
              <span className="shrink-0 font-display text-base font-extrabold text-gold">
                {movie.avgStars.toFixed(1)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
