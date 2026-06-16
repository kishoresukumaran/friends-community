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
  year?: number;
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
  year?: number;
  language: string;
  genre: string[];
  posterUrl?: string;
  emoji?: string;
  ratings: MovieRatingEntry[];
}

// Selectable, admin-extensible option lists for the movie form.
export interface MovieOptions {
  languages: string[];
  genres: string[];
  years: number[];
}

export type MovieOptionKind = "language" | "genre" | "year";

// --- FIFA 2026 prediction contest ---------------------------------------
// The Google Sheet is the scoring engine; an Apps Script pushes these
// snapshots into MongoDB. The app stores and displays them read-only.

export interface FifaMatch {
  matchNo: number;
  stage: string;
  dateTime: string;
  team1: string;
  team2: string;
  location: string;
  winner: string;
  isPowerMatch: boolean;
  underdogTeam: string;
  triviaQuestion: string;
  triviaAnswer: string;
}

export interface FifaLeaderboardEntry {
  email: string;
  name: string;
  league: number;
  knockout: number;
  preTournament: number;
  trivia: number;
  total: number;
}

// A player's per-match predictions, keyed by match number (as a string key
// since JSON object keys are strings). Used for League, Knockout, and Trivia.
export interface FifaPlayerPicks {
  email: string;
  name: string;
  picks: Record<string, string>;
  points: number;
  bonusPoints?: number;
  total?: number;
}

export interface FifaPreTournamentEntry {
  email: string;
  name: string;
  top4: string;
  finalists: string;
  champion: string;
  actualTop4: string;
  actualFinalists: string;
  actualChampion: string;
  points: number;
}

export interface FifaSnapshot {
  contest: string;
  matches: FifaMatch[];
  leaderboard: FifaLeaderboardEntry[];
  leaguePredictions: FifaPlayerPicks[];
  knockoutPredictions: FifaPlayerPicks[];
  triviaPredictions: FifaPlayerPicks[];
  preTournament: FifaPreTournamentEntry[];
  syncedAt: string;
}
