import { MovieRatingEntry } from "./types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Human-friendly month label, e.g. monthLabel(2026, 6) -> "June 2026".
export function monthLabel(year: number, month: number): string {
  const name = MONTH_NAMES[month - 1] ?? `Month ${month}`;
  return `${name} ${year}`;
}

// Group verdict = average of all individual star ratings, rounded to 1 decimal.
export function computeStats(ratings: MovieRatingEntry[]): {
  avgStars: number;
  votes: number;
} {
  const votes = ratings.length;
  if (votes === 0) return { avgStars: 0, votes: 0 };
  const total = ratings.reduce((sum, r) => sum + (Number(r.stars) || 0), 0);
  const avgStars = Math.round((total / votes) * 10) / 10;
  return { avgStars, votes };
}
