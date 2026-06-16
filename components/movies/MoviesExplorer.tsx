"use client";

import { ReactNode, useMemo, useState } from "react";
import { Movie } from "@/lib/types";
import PeopleTab from "@/components/movies/PeopleTab";
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

function applyFilters(movies: Movie[], filters: Filters): Movie[] {
  return movies.filter((m) => {
    if (filters.year && String(m.year) !== filters.year) return false;
    if (filters.genre && !m.genre.includes(filters.genre)) return false;
    if (filters.language && m.language !== filters.language) return false;
    return true;
  });
}

function buildHighlights(movies: Movie[]): HighlightItem[] {
  const top = topRated(movies);
  const watched = mostWatched(movies);
  const gem = hiddenGem(movies);
  const divisive = mostDivisive(movies);
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
}

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

interface FilterOptions {
  years: number[];
  genres: string[];
  languages: string[];
}

// A section with its own independent year/genre/language filter. The filtered
// list is handed to `children` so each section can compute its own analytics.
function FilteredSection({
  eyebrow,
  title,
  movies,
  options,
  children,
}: {
  eyebrow: string;
  title: string;
  movies: Movie[];
  options: FilterOptions;
  children: (filtered: Movie[]) => ReactNode;
}) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const filtered = useMemo(
    () => applyFilters(movies, filters),
    [movies, filters]
  );

  return (
    <section>
      <SectionTitle eyebrow={eyebrow} title={title} />
      <div className="mb-4">
        <FilterBar
          years={options.years}
          genres={options.genres}
          languages={options.languages}
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
          resultCount={filtered.length}
        />
      </div>
      {children(filtered)}
    </section>
  );
}

type Tab = "analytics" | "people";

const TABS: { key: Tab; label: string }[] = [
  { key: "analytics", label: "📊 Analytics" },
  { key: "people", label: "👥 People" },
];

export default function MoviesExplorer({ movies }: { movies: Movie[] }) {
  const [tab, setTab] = useState<Tab>("analytics");

  // Page-level overview stays all-time.
  const summary = useMemo(() => groupSummary(movies), [movies]);

  // Filter option lists are shared across every section.
  const options = useMemo<FilterOptions>(
    () => ({
      years: distinctYears(movies),
      genres: distinctValues(movies, (m) => m.genre),
      languages: distinctValues(movies, (m) => (m.language ? [m.language] : [])),
    }),
    [movies]
  );

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-8 flex flex-wrap gap-1.5 rounded-full bg-white/5 p-1.5 sm:w-fit">
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

      {tab === "people" && <PeopleTab movies={movies} />}

      {tab === "analytics" && <div className="space-y-12">
      {/* Group at a glance (all-time) */}
      <section>
        <SectionTitle eyebrow="All-time" title="Group at a glance" />
        <SummaryCards summary={summary} />
      </section>

      {/* Standouts */}
      <FilteredSection
        eyebrow="Standouts"
        title="Highlights"
        movies={movies}
        options={options}
      >
        {(filtered) => <Highlights items={buildHighlights(filtered)} />}
      </FilteredSection>

      {/* The people */}
      <FilteredSection
        eyebrow="The people"
        title="Rater insights"
        movies={movies}
        options={options}
      >
        {(filtered) => <RaterInsights insights={raterInsights(filtered)} />}
      </FilteredSection>

      {/* By category */}
      <FilteredSection
        eyebrow="By category"
        title="Breakdown"
        movies={movies}
        options={options}
      >
        {(filtered) => (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <Breakdown title="Genres" rows={genreBreakdown(filtered)} />
            <Breakdown title="Languages" rows={languageBreakdown(filtered)} />
          </div>
        )}
      </FilteredSection>

      {/* Ranked */}
      <FilteredSection
        eyebrow="Ranked"
        title="Leaderboard"
        movies={movies}
        options={options}
      >
        {(filtered) => <Leaderboard movies={filtered} />}
      </FilteredSection>

      {/* Browse */}
      <FilteredSection
        eyebrow="Browse"
        title="All movies"
        movies={movies}
        options={options}
      >
        {(filtered) =>
          filtered.length === 0 ? (
            <p className="text-sm text-white/40">
              No movies match these filters.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {filtered.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )
        }
      </FilteredSection>
      </div>}
    </div>
  );
}
