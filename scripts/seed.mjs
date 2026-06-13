// Seeds MongoDB Atlas with the initial members, contests, and movies.
// Run with: npm run seed   (loads env from .env.local via --env-file)

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "friends_community";

if (!uri) {
  console.error(
    "[seed] MONGODB_URI is not set. Add it to .env.local and try again."
  );
  process.exit(1);
}

const members = ["Rahul", "Priya", "Arjun", "Sara", "Vikram", "Neha", "Sam", "Maya"];

const contests = [
  {
    slug: "fifa-2026",
    title: "FIFA World Cup 2026",
    emoji: "⚽",
    status: "live",
    participants: 18,
    daysLeft: 23,
    leaderTeaser: "Rahul is top of the table 🔥",
    tagline: "Predict every match. Climb the leaderboard. Talk trash.",
  },
  {
    slug: "ipl-2026",
    title: "IPL 2026 Predictions",
    emoji: "🏏",
    status: "archived",
    participants: 21,
    winner: "Priya 🏆",
    tagline: "62 matches, countless arguments, one champion.",
  },
];

const movies = [
  {
    title: "Dune: Part Two",
    year: 2024,
    language: "English",
    genre: ["Sci-Fi", "Adventure"],
    emoji: "🏜️",
    posterUrl: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    ratings: [
      { name: "Rahul", stars: 5 },
      { name: "Priya", stars: 4.5 },
      { name: "Arjun", stars: 4 },
      { name: "Maya", stars: 4.5 },
    ],
  },
  {
    title: "The Batman",
    year: 2022,
    language: "English",
    genre: ["Action", "Crime"],
    emoji: "🦇",
    posterUrl: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    ratings: [
      { name: "Sam", stars: 4 },
      { name: "Vikram", stars: 4.5 },
      { name: "Neha", stars: 3.5 },
    ],
  },
  {
    title: "Barbie",
    year: 2023,
    language: "English",
    genre: ["Comedy", "Fantasy"],
    emoji: "🎀",
    posterUrl: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
    ratings: [
      { name: "Priya", stars: 4 },
      { name: "Sara", stars: 3.5 },
      { name: "Maya", stars: 3 },
      { name: "Neha", stars: 4 },
    ],
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const now = new Date();

  // Members
  await db.collection("members").deleteMany({});
  const memberRes = await db
    .collection("members")
    .insertMany(members.map((name) => ({ name, createdAt: now })));
  const nameToId = {};
  members.forEach((name, i) => {
    nameToId[name] = memberRes.insertedIds[i];
  });
  console.log(`[seed] inserted ${members.length} members`);

  // Contests
  await db.collection("contests").deleteMany({});
  await db
    .collection("contests")
    .insertMany(contests.map((c) => ({ ...c, createdAt: now })));
  console.log(`[seed] inserted ${contests.length} contests`);

  // Movies (attach memberId to each rating where we know the person)
  await db.collection("movies").deleteMany({});
  await db.collection("movies").insertMany(
    movies.map((m) => ({
      title: m.title,
      year: m.year,
      language: m.language,
      genre: m.genre,
      emoji: m.emoji,
      posterUrl: m.posterUrl,
      ratings: m.ratings.map((r) => ({
        memberId: nameToId[r.name] ?? null,
        name: r.name,
        stars: r.stars,
      })),
      createdAt: now,
      updatedAt: now,
    }))
  );
  console.log(`[seed] inserted ${movies.length} movies`);

  console.log("[seed] done ✅");
} catch (err) {
  console.error("[seed] failed:", err);
  process.exitCode = 1;
} finally {
  await client.close();
}
