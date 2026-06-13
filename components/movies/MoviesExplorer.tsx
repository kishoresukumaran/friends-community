"use client";

import { useMemo, useState } from "react";
import { Movie } from "@/lib/types";
import {
  distinctValues,
  distinctYears,
  genreBreakdown,
  groupSummary,
  hiddenGem,
  languageBreakdown,
  mostDivisive,
  mostWatched,
  raterInsights,
  ratingSpread,
  topRated,
} from "@/lib/analytics";
import SummaryCards from "@/components/movies/SummaryCards";
import Highlights, { HighlightItem } from "@/components/movies/Highlights";
import RaterInsights from "@/components/movies/RaterInsights";
import Breakdown from "@/components/movies/Breakdown";
import Leaderboard from "@/components/movies/Leaderboard";
import FilterBar, { Filters } from "@/components/movies/FilterBar";
import MovieCard from "@/components/movies/MovieCard";

const EMPTY_FILTERS: Filters = { year: "", genre: "", language: "" };

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-green">
        {eyebrow}
      </p>
      <h2 className="mt-0.5 font-display text-xl font-extrabold text-white sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

export default function MoviesExplorer({ movies }: { movies: Movie[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  // Global (all-time) analytics — people and category insights.
  const summary = useMemo(() => groupSummary(movies), [movies]);
  const insights = useMemo(() => raterInsights(movies), [movies]);
  const genres = useMemo(() => genreBreakdown(movies), [movies]);
  const languages = useMemo(() => languageBreakdown(movies), [movies]);

  // Filter options.
  const years = useMemo(() => distinctYears(movies), [movies]);
  const genreOptions = useMemo(
    () => distinctValues(movies, (m) => m.genre),
    [movies]
  );
  const languageOptions = useMemo(
    () => distinctValues(movies, (m) => (m.language ? [m.language] : [])),
    [movies]
  );

  // Filtered set drives highlights + leaderboard + grid.
  const filtered = useMemo(() => {
    return movies.filter((m) => {
      if (filters.year && String(m.year) !== filters.year) return false;
      if (filters.genre && !m.genre.includes(filters.genre)) return false;
      if (filters.language && m.language !== filters.language) return false;
      return true;
    });
  }, [movies, filters]);

  const highlights = useMemo<HighlightItem[]>(() => {
    const top = topRated(filtered);
    const watched = mostWatched(filtered);
    const gem = hiddenGem(filtered);
    const divisive = mostDivisive(filtered);
    return [
      {
        key: "top",
        title: "Top Rated",
        emoji: "🏆",
        movie: top,
        metric: top ? `${top.avgStars.toFixed(1)} ★ · ${top.votes} raters` : "",
      },
      {
        key: "watched",
        title: "Most Watched",
        emoji: "👀",
        movie: watched,
        metric: watched ? `${watched.votes} raters` : "",
      },
      {
        key: "gem",
        title: "Hidden Gem",
        emoji: "💎",
        movie: gem,
        metric: gem ? `${gem.avgStars.toFixed(1)} ★ · only ${gem.votes} raters` : "",
      },
      {
        key: "divisive",
        title: "Most Divisive",
        emoji: "⚔️",
        movie: divisive,
        metric: divisive
          ? `±${ratingSpread(divisive).toFixed(1)} spread · ${divisive.votes} raters`
          : "",
      },
    ];
  }, [filtered]);

  return (
    <div className="space-y-12">
      {/* Group at a glance (all-time) */}
      <section>
        <SectionTitle eyebrow="All-time" title="Group at a glance" />
        <SummaryCards summary={summary} />
      </section>

      {/* Filterable highlights */}
      <section>
        <SectionTitle eyebrow="Standouts" title="Highlights" />
        <div className="mb-4">
          <FilterBar
            years={years}
            genres={genreOptions}
            languages={languageOptions}
            filters={filters}
            onChange={setFilters}
            onClear={() => setFilters(EMPTY_FILTERS)}
            resultCount={filtered.length}
          />
        </div>
        <Highlights items={highlights} />
      </section>

      {/* Rater insights (all-time) */}
      <section>
        <SectionTitle eyebrow="The people" title="Rater insights" />
        <RaterInsights insights={insights} />
      </section>

      {/* Genre + language breakdown (all-time) */}
      <section>
        <SectionTitle eyebrow="By category" title="Breakdown" />
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <Breakdown title="Genres" rows={genres} />
          <Breakdown title="Languages" rows={languages} />
        </div>
      </section>

      {/* Leaderboard (filtered) */}
      <section>
        <SectionTitle eyebrow="Ranked" title="Leaderboard" />
        <Leaderboard movies={filtered} />
      </section>

      {/* Full grid (filtered) */}
      <section>
        <SectionTitle eyebrow="Browse" title="All movies" />
        {filtered.length === 0 ? (
          <p className="text-sm text-white/40">No movies match these filters.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
            {filtered.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
