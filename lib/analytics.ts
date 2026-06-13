import { Movie } from "./types";

// Minimum number of raters for a movie to qualify for "top rated"; below this
// it is instead eligible to be a "hidden gem".
export const MIN_RATERS = 3;
// A movie joins the 5-star club at this average or higher.
export const FIVE_STAR_THRESHOLD = 4.5;

export interface GroupSummary {
  totalMovies: number;
  totalRatings: number;
  groupAverage: number;
  fiveStarClub: number;
}

export interface RaterStat {
  name: string;
  average: number;
  count: number;
}

export interface RaterInsights {
  toughestCritic: RaterStat | null;
  mostGenerous: RaterStat | null;
  mostActive: RaterStat | null;
}

export interface BreakdownRow {
  label: string;
  count: number;
  average: number;
}

function rated(movies: Movie[]): Movie[] {
  return movies.filter((m) => m.votes > 0);
}

export function groupSummary(movies: Movie[]): GroupSummary {
  const withRatings = rated(movies);
  const allStars = withRatings.flatMap((m) => m.ratings.map((r) => r.stars));
  const totalRatings = allStars.length;
  const groupAverage =
    totalRatings === 0
      ? 0
      : Math.round((allStars.reduce((s, v) => s + v, 0) / totalRatings) * 10) /
        10;
  return {
    totalMovies: movies.length,
    totalRatings,
    groupAverage,
    fiveStarClub: withRatings.filter((m) => m.avgStars >= FIVE_STAR_THRESHOLD)
      .length,
  };
}

export function topRated(movies: Movie[]): Movie | null {
  const eligible = movies.filter((m) => m.votes >= MIN_RATERS);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, m) =>
    m.avgStars > best.avgStars ? m : best
  );
}

export function mostWatched(movies: Movie[]): Movie | null {
  const eligible = rated(movies);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, m) => (m.votes > best.votes ? m : best));
}

export function hiddenGem(movies: Movie[]): Movie | null {
  const eligible = movies.filter((m) => m.votes > 0 && m.votes < MIN_RATERS);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, m) =>
    m.avgStars > best.avgStars ? m : best
  );
}

// Population standard deviation of a movie's individual star ratings.
export function ratingSpread(movie: Movie): number {
  const stars = movie.ratings.map((r) => r.stars);
  if (stars.length < 2) return 0;
  const mean = stars.reduce((s, v) => s + v, 0) / stars.length;
  const variance =
    stars.reduce((s, v) => s + (v - mean) ** 2, 0) / stars.length;
  return Math.sqrt(variance);
}

export function mostDivisive(movies: Movie[]): Movie | null {
  const eligible = movies.filter((m) => m.votes >= 2);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, m) =>
    ratingSpread(m) > ratingSpread(best) ? m : best
  );
}

export function raterInsights(movies: Movie[]): RaterInsights {
  const byName = new Map<string, { total: number; count: number }>();
  for (const movie of movies) {
    for (const r of movie.ratings) {
      const cur = byName.get(r.name) || { total: 0, count: 0 };
      cur.total += r.stars;
      cur.count += 1;
      byName.set(r.name, cur);
    }
  }

  const stats: RaterStat[] = Array.from(byName.entries()).map(
    ([name, { total, count }]) => ({
      name,
      count,
      average: Math.round((total / count) * 10) / 10,
    })
  );

  // Average-based insights need at least 2 ratings to be meaningful.
  const qualified = stats.filter((s) => s.count >= 2);

  const toughestCritic =
    qualified.length === 0
      ? null
      : qualified.reduce((min, s) => (s.average < min.average ? s : min));
  const mostGenerous =
    qualified.length === 0
      ? null
      : qualified.reduce((max, s) => (s.average > max.average ? s : max));
  const mostActive =
    stats.length === 0
      ? null
      : stats.reduce((max, s) => (s.count > max.count ? s : max));

  return { toughestCritic, mostGenerous, mostActive };
}

function breakdown(
  movies: Movie[],
  keyFn: (m: Movie) => string[]
): BreakdownRow[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const movie of rated(movies)) {
    for (const key of keyFn(movie)) {
      if (!key) continue;
      const cur = map.get(key) || { total: 0, count: 0 };
      // Weight by the movie's average so each movie contributes once per key.
      cur.total += movie.avgStars;
      cur.count += 1;
      map.set(key, cur);
    }
  }
  return Array.from(map.entries())
    .map(([label, { total, count }]) => ({
      label,
      count,
      average: Math.round((total / count) * 10) / 10,
    }))
    .sort((a, b) => b.count - a.count || b.average - a.average);
}

export function genreBreakdown(movies: Movie[]): BreakdownRow[] {
  return breakdown(movies, (m) => m.genre);
}

export function languageBreakdown(movies: Movie[]): BreakdownRow[] {
  return breakdown(movies, (m) => (m.language ? [m.language] : []));
}

export function distinctYears(movies: Movie[]): number[] {
  const years = new Set<number>();
  for (const m of movies) {
    if (typeof m.year === "number" && m.year > 0) years.add(m.year);
  }
  return Array.from(years).sort((a, b) => b - a);
}

export function distinctValues(
  movies: Movie[],
  keyFn: (m: Movie) => string[]
): string[] {
  const set = new Set<string>();
  for (const m of movies) {
    for (const v of keyFn(m)) {
      if (v) set.add(v);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
