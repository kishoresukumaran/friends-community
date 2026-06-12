// Seed + fallback data. Used to populate MongoDB (see scripts/seed.mjs) and to
// keep the public page rendering if the database is empty or unreachable.

import { Contest, Movie } from "./types";
import { computeStats } from "./util";

export const seedMembers: string[] = [
  "Rahul",
  "Priya",
  "Arjun",
  "Sara",
  "Vikram",
  "Neha",
  "Sam",
  "Maya",
];

export const seedContests: Contest[] = [
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

type RawMovie = Omit<Movie, "avgStars" | "votes">;

const rawMovies: RawMovie[] = [
  {
    id: "dune-part-two",
    title: "Dune: Part Two",
    language: "English",
    genre: ["Sci-Fi", "Adventure"],
    emoji: "🏜️",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    ratings: [
      { name: "Rahul", stars: 5 },
      { name: "Priya", stars: 4.5 },
      { name: "Arjun", stars: 4 },
      { name: "Maya", stars: 4.5 },
    ],
  },
  {
    id: "the-batman",
    title: "The Batman",
    language: "English",
    genre: ["Action", "Crime"],
    emoji: "🦇",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    ratings: [
      { name: "Sam", stars: 4 },
      { name: "Vikram", stars: 4.5 },
      { name: "Neha", stars: 3.5 },
    ],
  },
  {
    id: "barbie",
    title: "Barbie",
    language: "English",
    genre: ["Comedy", "Fantasy"],
    emoji: "🎀",
    posterUrl:
      "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    ratings: [
      { name: "Priya", stars: 4 },
      { name: "Sara", stars: 3.5 },
      { name: "Maya", stars: 3 },
      { name: "Neha", stars: 4 },
    ],
  },
];

export const seedMovies: Movie[] = rawMovies.map((m) => ({
  ...m,
  ...computeStats(m.ratings),
}));
