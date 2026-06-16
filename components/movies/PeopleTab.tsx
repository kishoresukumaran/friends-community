"use client";

import { useMemo, useState } from "react";
import { Movie } from "@/lib/types";
import { groupSummary } from "@/lib/analytics";
import {
  allRaterNames,
  contrarianPicks,
  eraPreference,
  languagePreference,
  personGenreAffinity,
  personalityLabel,
  tasteTwins,
} from "@/lib/movie-people-analytics";

export default function PeopleTab({ movies }: { movies: Movie[] }) {
  const names = useMemo(() => allRaterNames(movies), [movies]);
  const [selected, setSelected] = useState<string>(() => {
    // Default to the most active rater.
    if (movies.length === 0) return "";
    const counts = new Map<string, number>();
    for (const m of movies)
      for (const r of m.ratings)
        counts.set(r.name, (counts.get(r.name) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  });

  const groupAvg = useMemo(
    () => groupSummary(movies).groupAverage,
    [movies]
  );
  const twins = useMemo(() => tasteTwins(movies, 3), [movies]);
  const top2twins = twins.slice(0, 2);

  const personality = useMemo(
    () => personalityLabel(movies, selected, groupAvg),
    [movies, selected, groupAvg]
  );
  const genres = useMemo(
    () => personGenreAffinity(movies, selected),
    [movies, selected]
  );
  const languages = useMemo(
    () => languagePreference(movies, selected),
    [movies, selected]
  );
  const era = useMemo(
    () => eraPreference(movies, selected),
    [movies, selected]
  );
  const contrarian = useMemo(
    () => contrarianPicks(movies, selected, 5),
    [movies, selected]
  );

  if (names.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-white/40">
        No ratings yet — come back once the group has watched some films.
      </p>
    );
  }

  const maxGenreRating = Math.max(...genres.rows.map((r) => r.avgRating), 5);
  const maxLangRating = Math.max(...languages.map((r) => r.avgRating), 5);
  const maxEraRating = Math.max(...era.map((r) => r.avgRating), 5);

  return (
    <div className="space-y-8">
      {/* Taste twins — global, not per-person */}
      {top2twins.length > 0 && (
        <section>
          <SubHeading eyebrow="Taste twins" title="Most similar taste" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {top2twins.map((pair) => (
              <div
                key={`${pair.nameA}-${pair.nameB}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <span className="text-base">🤝</span>
                  <span>{pair.nameA}</span>
                  <span className="text-white/40">&</span>
                  <span>{pair.nameB}</span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand-teal"
                      style={{
                        width: `${Math.max(0, pair.correlation * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-display text-sm font-extrabold text-brand-teal">
                    {Math.round(pair.correlation * 100)}%
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-white/45">
                  {pair.sharedCount} shared movies rated
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Person selector */}
      <section>
        <SubHeading eyebrow="Per person" title="Individual breakdown" />
        <select
          aria-label="Select person"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-green/60 sm:w-auto"
        >
          {names.map((n) => (
            <option key={n} value={n} className="bg-ink">
              {n}
            </option>
          ))}
        </select>
      </section>

      {/* Personality */}
      <section>
        <SubHeading eyebrow="Rating style" title="Personality" />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-display text-sm font-extrabold text-white">
            {personality.label}
          </span>
          <span className="text-sm text-white/60">
            {personality.description}
          </span>
        </div>
        <p className="mt-2 text-xs text-white/45">
          Avg rating:{" "}
          <span className="font-semibold text-white/70">
            {personality.avgRating} ★
          </span>{" "}
          vs group avg{" "}
          <span className="font-semibold text-white/70">{groupAvg} ★</span> ·{" "}
          {personality.moviesRated} movies rated
        </p>
      </section>

      {/* Genre affinity */}
      {genres.rows.length > 0 && (
        <section>
          <SubHeading
            eyebrow="Genre affinity"
            title="How they rate by genre"
          />
          {genres.topGenre && (
            <p className="mt-1 text-xs text-white/50">
              Loves <span className="font-semibold text-white/80">{genres.topGenre}</span>
              {genres.bottomGenre && genres.bottomGenre !== genres.topGenre && (
                <>
                  {" "}· hardest on{" "}
                  <span className="font-semibold text-white/80">
                    {genres.bottomGenre}
                  </span>
                </>
              )}
            </p>
          )}
          <ul className="mt-4 space-y-2.5">
            {genres.rows.map((r) => (
              <li key={r.genre} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-sm text-white/80 sm:w-32">
                  {r.genre}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-green"
                    style={{
                      width: `${(r.avgRating / maxGenreRating) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-display text-sm font-extrabold text-white">
                  {r.avgRating}
                </span>
                <span className="w-8 shrink-0 text-right text-xs text-white/40">
                  ×{r.count}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Language preference */}
      {languages.length > 0 && (
        <section>
          <SubHeading
            eyebrow="Language"
            title="Ratings by language"
          />
          <ul className="mt-4 space-y-2.5">
            {languages.map((r) => (
              <li key={r.language} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-sm text-white/80 sm:w-32">
                  {r.language}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-grape"
                    style={{
                      width: `${(r.avgRating / maxLangRating) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-display text-sm font-extrabold text-white">
                  {r.avgRating}
                </span>
                <span className="w-8 shrink-0 text-right text-xs text-white/40">
                  ×{r.count}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Era preference */}
      {era.length > 1 && (
        <section>
          <SubHeading eyebrow="Release year" title="Era preference" />
          <ul className="mt-4 space-y-2.5">
            {era.map((r) => (
              <li key={r.year} className="flex items-center gap-3">
                <span className="w-12 shrink-0 text-sm text-white/80">
                  {r.year}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-brand-teal"
                    style={{
                      width: `${(r.avgRating / maxEraRating) * 100}%`,
                    }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right font-display text-sm font-extrabold text-white">
                  {r.avgRating}
                </span>
                <span className="w-8 shrink-0 text-right text-xs text-white/40">
                  ×{r.count}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Contrarian picks */}
      {contrarian.length > 0 && (
        <section>
          <SubHeading
            eyebrow="vs the crowd"
            title="Most divergent takes"
          />
          <p className="mt-1 text-xs text-white/50">
            Where their rating drifted furthest from the group average.
          </p>
          <ul className="mt-4 space-y-2">
            {contrarian.map((c) => (
              <li
                key={c.title}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-4 py-3 text-sm"
              >
                <span className="min-w-0 truncate text-white/85">
                  {c.title}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="text-white/50">{c.avgStars} group</span>
                  <span className="text-white/30">→</span>
                  <span className="font-display font-extrabold text-white">
                    {c.stars}
                  </span>
                  <span
                    className={`w-10 text-right font-semibold ${
                      c.diff > 0 ? "text-brand-green" : "text-sunset"
                    }`}
                  >
                    {c.diff > 0 ? "+" : ""}
                    {c.diff}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function SubHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-green">
        {eyebrow}
      </p>
      <h3 className="mt-0.5 font-display text-xl font-extrabold text-white sm:text-2xl">
        {title}
      </h3>
    </div>
  );
}
