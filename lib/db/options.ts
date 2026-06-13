import { getDb } from "../mongodb";
import { MovieOptionKind, MovieOptions } from "../types";

// A single config document in the `meta` collection holds the admin-managed
// option lists. The form options are the union of these base defaults, any
// values admins added, and values already used by existing movies — so nothing
// ever disappears from the dropdowns.
const COLLECTION = "meta";
const KEY = "movieOptions";

export const BASE_LANGUAGES = [
  "Tamil",
  "English",
  "Hindi",
  "Malayalam",
  "Telugu",
  "Kannada",
];
export const BASE_GENRES = [
  "Comedy",
  "Romance",
  "Sci-Fi",
  "Drama",
  "Fantasy",
  "Action",
];
export const BASE_YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export function baseMovieOptions(): MovieOptions {
  return {
    languages: [...BASE_LANGUAGES],
    genres: [...BASE_GENRES],
    years: [...BASE_YEARS].sort((a, b) => b - a),
  };
}

// De-dupe strings case-insensitively while preserving first-seen order.
function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const v = raw.trim();
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

function dedupeYears(values: number[]): number[] {
  return Array.from(new Set(values.filter((y) => Number.isFinite(y)))).sort(
    (a, b) => b - a
  );
}

export async function getMovieOptions(): Promise<MovieOptions> {
  const db = await getDb();

  const doc = await db.collection(COLLECTION).findOne({ key: KEY });
  const storedLanguages = Array.isArray(doc?.languages)
    ? (doc!.languages as string[])
    : [];
  const storedGenres = Array.isArray(doc?.genres)
    ? (doc!.genres as string[])
    : [];
  const storedYears = Array.isArray(doc?.years)
    ? (doc!.years as number[])
    : [];

  const movies = await db
    .collection("movies")
    .find({}, { projection: { language: 1, genre: 1, year: 1 } })
    .toArray();
  const usedLanguages = movies
    .map((m) => m.language)
    .filter((l): l is string => typeof l === "string");
  const usedGenres = movies.flatMap((m) =>
    Array.isArray(m.genre) ? (m.genre as string[]) : []
  );
  const usedYears = movies
    .map((m) => m.year)
    .filter((y): y is number => typeof y === "number");

  return {
    languages: dedupeStrings([
      ...BASE_LANGUAGES,
      ...storedLanguages,
      ...usedLanguages,
    ]),
    genres: dedupeStrings([...BASE_GENRES, ...storedGenres, ...usedGenres]),
    years: dedupeYears([...BASE_YEARS, ...storedYears, ...usedYears]),
  };
}

export async function addMovieOption(
  kind: MovieOptionKind,
  rawValue: string
): Promise<MovieOptions> {
  const db = await getDb();

  if (kind === "year") {
    const year = Number(rawValue);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      throw new Error("Invalid year");
    }
    await db
      .collection(COLLECTION)
      .updateOne({ key: KEY }, { $addToSet: { years: year } }, { upsert: true });
  } else {
    const value = rawValue.trim();
    if (!value) throw new Error("Empty value");
    const field = kind === "language" ? "languages" : "genres";
    await db
      .collection(COLLECTION)
      .updateOne(
        { key: KEY },
        { $addToSet: { [field]: value } },
        { upsert: true }
      );
  }

  return getMovieOptions();
}
