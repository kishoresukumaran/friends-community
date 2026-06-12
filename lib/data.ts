// Hardcoded placeholder data for Step 1 (landing page).
// Structured so it can later be swapped for MongoDB Atlas documents.

export type ContestStatus = "live" | "upcoming" | "archived";

export type Contest = {
  id: string;
  title: string;
  emoji: string;
  status: ContestStatus;
  participants: number;
  // Days until the contest closes (only meaningful for live/upcoming).
  daysLeft?: number;
  // Short teaser about who's on top.
  leaderTeaser?: string;
  // For archived contests, who took the crown.
  winner?: string;
  tagline: string;
};

export type MovieRating = {
  id: string;
  title: string;
  year: number;
  emoji: string;
  // Group verdict, average stars out of 5.
  avgStars: number;
  votes: number;
};

export const activeContests: Contest[] = [
  {
    id: "fifa-2026",
    title: "FIFA World Cup 2026",
    emoji: "⚽",
    status: "live",
    participants: 18,
    daysLeft: 23,
    leaderTeaser: "Rahul is top of the table 🔥",
    tagline: "Predict every match. Climb the leaderboard. Talk trash.",
  },
];

export const archivedContests: Contest[] = [
  {
    id: "ipl-2025",
    title: "IPL 2025 Predictions",
    emoji: "🏏",
    status: "archived",
    participants: 21,
    winner: "Priya 🏆",
    tagline: "62 matches, countless arguments, one champion.",
  },
];

export const movieRatings: MovieRating[] = [
  {
    id: "dune-part-two",
    title: "Dune: Part Two",
    year: 2024,
    emoji: "🏜️",
    avgStars: 4.5,
    votes: 16,
  },
  {
    id: "the-batman",
    title: "The Batman",
    year: 2022,
    emoji: "🦇",
    avgStars: 4,
    votes: 14,
  },
  {
    id: "barbie",
    title: "Barbie",
    year: 2023,
    emoji: "🎀",
    avgStars: 3.5,
    votes: 19,
  },
];
