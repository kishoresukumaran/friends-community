import { MovieRatingEntry } from "./types";

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
