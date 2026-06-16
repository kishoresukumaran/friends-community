// One-off: upsert archived cricket contests into MongoDB.
// Run with: node --env-file=.env.local scripts/add-archived-contests.mjs

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "friends_community";

if (!uri) {
  console.error("[add-archived] MONGODB_URI is not set. Add it to .env.local.");
  process.exit(1);
}

const contests = [
  {
    slug: "icc-world-cup-2026",
    title: "ICC World Cup 2026",
    emoji: "🏏",
    status: "archived",
    participants: 0,
    winner: "Ramnath 🏆",
    podium: ["Ramnath", "Shakthivel", "Bharath Krishna & Ranjith"],
    tagline: "The big one. Bragging rights for a lifetime.",
  },
  {
    slug: "asia-cup-2025",
    title: "Asia Cup 2025",
    emoji: "🏏",
    status: "archived",
    participants: 0,
    winner: "Kishore 🏆",
    tagline: "Continental bragging rights on the line.",
  },
  {
    slug: "tnpl-2025",
    title: "TNPL 2025",
    emoji: "🏏",
    status: "archived",
    participants: 0,
    winner: "Ranjith 🏆",
    tagline: "Tamil Nadu's finest, predicted ball by ball.",
  },
  {
    slug: "ipl-2025",
    title: "IPL 2025 Predictions",
    emoji: "🏏",
    status: "archived",
    participants: 0,
    winner: "Karthikeshwar 🏆",
    tagline: "The original prediction war.",
  },
  {
    slug: "t20-world-cup-2024",
    title: "T20 Cricket World Cup 2024",
    emoji: "🏏",
    status: "archived",
    participants: 0,
    winner: "Krish 🏆",
    tagline: "Where it all began for the crew.",
  },
];

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(dbName);
  const col = db.collection("contests");

  for (const c of contests) {
    const res = await col.updateOne(
      { slug: c.slug },
      { $set: c },
      { upsert: true }
    );
    const action = res.upsertedCount ? "inserted" : "updated";
    console.log(`[add-archived] ${action}: ${c.slug}`);
  }

  console.log("[add-archived] Done.");
} catch (err) {
  console.error("[add-archived] Failed:", err);
  process.exit(1);
} finally {
  await client.close();
}
