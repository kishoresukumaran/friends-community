import { Movie } from "./types";

// ── helpers ──────────────────────────────────────────────────────────────────

export function allRaterNames(movies: Movie[]): string[] {
  const names = new Set<string>();
  for (const m of movies) {
    for (const r of m.ratings) {
      if (r.name) names.add(r.name);
    }
  }
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

// Movies a given person has rated, with their individual star value attached.
export interface PersonRating {
  movieId: string;
  title: string;
  stars: number;
  avgStars: number;
  genre: string[];
  language: string;
  year: number | undefined;
}

function ratingsFor(movies: Movie[], name: string): PersonRating[] {
  const out: PersonRating[] = [];
  for (const m of movies) {
    const r = m.ratings.find((r) => r.name === name);
    if (r) {
      out.push({
        movieId: m.id,
        title: m.title,
        stars: r.stars,
        avgStars: m.avgStars,
        genre: m.genre ?? [],
        language: m.language ?? "",
        year: m.year,
      });
    }
  }
  return out;
}

// ── personality label ─────────────────────────────────────────────────────────

export interface PersonalityResult {
  label: string;
  description: string;
  avgRating: number;
  moviesRated: number;
}

export function personalityLabel(
  movies: Movie[],
  name: string,
  groupAvg: number
): PersonalityResult {
  const rated = ratingsFor(movies, name);
  if (rated.length === 0) {
    return {
      label: "No ratings yet",
      description: "",
      avgRating: 0,
      moviesRated: 0,
    };
  }
  const avgRating =
    Math.round(
      (rated.reduce((s, r) => s + r.stars, 0) / rated.length) * 10
    ) / 10;
  const diff = avgRating - groupAvg;
  let label: string;
  let description: string;
  if (diff >= 1.0) {
    label = "Super fan";
    description = "Rates almost everything higher than the group.";
  } else if (diff >= 0.5) {
    label = "Generous rater";
    description = "Consistently kinder than the group average.";
  } else if (diff <= -1.0) {
    label = "Hard to please";
    description = "Rarely impressed — sets a very high bar.";
  } else if (diff <= -0.5) {
    label = "Tough critic";
    description = "Stricter than the group average.";
  } else {
    label = "In sync with the group";
    description = "Ratings closely mirror the group's collective taste.";
  }
  return { label, description, avgRating, moviesRated: rated.length };
}

// ── genre affinity ────────────────────────────────────────────────────────────

export interface GenreAffinityRow {
  genre: string;
  avgRating: number;
  count: number;
}

export interface GenreAffinity {
  rows: GenreAffinityRow[];
  topGenre: string | null;
  bottomGenre: string | null;
}

export function personGenreAffinity(
  movies: Movie[],
  name: string
): GenreAffinity {
  const rated = ratingsFor(movies, name);
  const map = new Map<string, { total: number; count: number }>();
  for (const r of rated) {
    for (const g of r.genre) {
      if (!g) continue;
      const cur = map.get(g) ?? { total: 0, count: 0 };
      cur.total += r.stars;
      cur.count += 1;
      map.set(g, cur);
    }
  }
  const rows: GenreAffinityRow[] = Array.from(map.entries())
    .map(([genre, { total, count }]) => ({
      genre,
      avgRating: Math.round((total / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => b.avgRating - a.avgRating || b.count - a.count);

  const qualified = rows.filter((r) => r.count >= 2);
  const topGenre = qualified[0]?.genre ?? rows[0]?.genre ?? null;
  const bottomGenre =
    qualified.length >= 2
      ? qualified[qualified.length - 1].genre
      : rows.length >= 2
      ? rows[rows.length - 1].genre
      : null;

  return { rows, topGenre, bottomGenre };
}

// ── language preference ───────────────────────────────────────────────────────

export interface LanguagePreferenceRow {
  language: string;
  avgRating: number;
  count: number;
}

export function languagePreference(
  movies: Movie[],
  name: string
): LanguagePreferenceRow[] {
  const rated = ratingsFor(movies, name).filter((r) => r.language);
  const map = new Map<string, { total: number; count: number }>();
  for (const r of rated) {
    const cur = map.get(r.language) ?? { total: 0, count: 0 };
    cur.total += r.stars;
    cur.count += 1;
    map.set(r.language, cur);
  }
  return Array.from(map.entries())
    .map(([language, { total, count }]) => ({
      language,
      avgRating: Math.round((total / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => b.avgRating - a.avgRating || b.count - a.count);
}

// ── era preference ────────────────────────────────────────────────────────────

export interface EraPreferenceRow {
  year: number;
  avgRating: number;
  count: number;
}

export function eraPreference(
  movies: Movie[],
  name: string
): EraPreferenceRow[] {
  const rated = ratingsFor(movies, name).filter((r) => r.year != null);
  const map = new Map<number, { total: number; count: number }>();
  for (const r of rated) {
    const y = r.year as number;
    const cur = map.get(y) ?? { total: 0, count: 0 };
    cur.total += r.stars;
    cur.count += 1;
    map.set(y, cur);
  }
  return Array.from(map.entries())
    .map(([year, { total, count }]) => ({
      year,
      avgRating: Math.round((total / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => a.year - b.year);
}

// ── contrarian picks ──────────────────────────────────────────────────────────

export interface ContrarianPick {
  title: string;
  stars: number;
  avgStars: number;
  diff: number; // positive = rated higher than group, negative = lower
}

export function contrarianPicks(
  movies: Movie[],
  name: string,
  n = 5
): ContrarianPick[] {
  const rated = ratingsFor(movies, name).filter((r) => r.avgStars > 0);
  return rated
    .map((r) => ({
      title: r.title,
      stars: r.stars,
      avgStars: r.avgStars,
      diff: Math.round((r.stars - r.avgStars) * 10) / 10,
    }))
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, n);
}

// ── group taste ───────────────────────────────────────────────────────────────

export interface GroupTasteRow {
  label: string;
  average: number;
  count: number;
}

export interface GroupTaste {
  rows: GroupTasteRow[];
  top: GroupTasteRow | null;
}

// Group-level taste for a dimension. Each rated movie contributes its group
// average once per key, so the average reflects how the whole crew tends to
// rate that genre/language/era. The headline pick prefers keys with >= 2
// movies so a single outlier does not win.
function buildGroupTaste(
  movies: Movie[],
  keyFn: (m: Movie) => string[]
): GroupTaste {
  const map = new Map<string, { total: number; count: number }>();
  for (const m of movies) {
    if (m.votes <= 0) continue;
    for (const key of keyFn(m)) {
      if (!key) continue;
      const cur = map.get(key) ?? { total: 0, count: 0 };
      cur.total += m.avgStars;
      cur.count += 1;
      map.set(key, cur);
    }
  }
  const rows: GroupTasteRow[] = Array.from(map.entries())
    .map(([label, { total, count }]) => ({
      label,
      average: Math.round((total / count) * 10) / 10,
      count,
    }))
    .sort((a, b) => b.average - a.average || b.count - a.count);
  const qualified = rows.filter((r) => r.count >= 2);
  const top = qualified[0] ?? rows[0] ?? null;
  return { rows, top };
}

export function groupGenreTaste(movies: Movie[]): GroupTaste {
  return buildGroupTaste(movies, (m) => m.genre ?? []);
}

export function groupLanguageTaste(movies: Movie[]): GroupTaste {
  return buildGroupTaste(movies, (m) => (m.language ? [m.language] : []));
}

export function groupYearTaste(movies: Movie[]): GroupTaste {
  return buildGroupTaste(movies, (m) =>
    m.year != null ? [String(m.year)] : []
  );
}

// ── taste twins ───────────────────────────────────────────────────────────────

export interface TasteTwinShared {
  title: string;
  starsA: number;
  starsB: number;
  diff: number; // |starsA - starsB|
}

export interface TasteTwinPair {
  nameA: string;
  nameB: string;
  correlation: number; // Pearson -1..1
  sharedCount: number;
  shared: TasteTwinShared[];
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : Math.round((num / denom) * 100) / 100;
}

export function tasteTwins(
  movies: Movie[],
  minShared = 3
): TasteTwinPair[] {
  const names = allRaterNames(movies);
  const titleById = new Map<string, string>();
  for (const m of movies) titleById.set(m.id, m.title);

  // Build a map: name -> { movieId -> stars }
  const ratingMap = new Map<string, Map<string, number>>();
  for (const name of names) {
    const m = new Map<string, number>();
    for (const movie of movies) {
      const r = movie.ratings.find((r) => r.name === name);
      if (r) m.set(movie.id, r.stars);
    }
    ratingMap.set(name, m);
  }

  const pairs: TasteTwinPair[] = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = ratingMap.get(names[i])!;
      const b = ratingMap.get(names[j])!;
      const sharedIds = Array.from(a.keys()).filter((id) => b.has(id));
      if (sharedIds.length < minShared) continue;
      const xs = sharedIds.map((id) => a.get(id)!);
      const ys = sharedIds.map((id) => b.get(id)!);
      const shared: TasteTwinShared[] = sharedIds
        .map((id) => {
          const starsA = a.get(id)!;
          const starsB = b.get(id)!;
          return {
            title: titleById.get(id) ?? "Unknown",
            starsA,
            starsB,
            diff: Math.round(Math.abs(starsA - starsB) * 10) / 10,
          };
        })
        .sort((x, y) => x.diff - y.diff || x.title.localeCompare(y.title));
      pairs.push({
        nameA: names[i],
        nameB: names[j],
        correlation: pearson(xs, ys),
        sharedCount: sharedIds.length,
        shared,
      });
    }
  }
  return pairs.sort(
    (a, b) => b.correlation - a.correlation || b.sharedCount - a.sharedCount
  );
}
