// Shared domain types used by the DB layer, API routes, and UI.

export type ContestStatus = "live" | "upcoming" | "archived";

export interface Contest {
  id: string;
  title: string;
  emoji: string;
  status: ContestStatus;
  participants: number;
  daysLeft?: number;
  leaderTeaser?: string;
  winner?: string;
  tagline: string;
}

export interface Member {
  id: string;
  name: string;
}

export interface MovieRatingEntry {
  memberId?: string;
  name: string;
  // Stars given by this person, 0.5 - 5 in half steps.
  stars: number;
}

export interface Movie {
  id: string;
  title: string;
  language: string;
  genre: string[];
  posterUrl?: string;
  emoji?: string;
  ratings: MovieRatingEntry[];
  // Derived from `ratings` at read time.
  avgStars: number;
  votes: number;
}

// Shape accepted when creating/updating a movie (no derived fields).
export interface MovieInput {
  title: string;
  language: string;
  genre: string[];
  posterUrl?: string;
  emoji?: string;
  ratings: MovieRatingEntry[];
}
