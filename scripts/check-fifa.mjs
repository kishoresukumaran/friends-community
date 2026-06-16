// Read-only check: is the FIFA snapshot actually in MongoDB?
// Run with: node --env-file=.env.local scripts/check-fifa.mjs

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "friends_community";

if (!uri) {
  console.error("[check] MONGODB_URI is not set.");
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(dbName);
  const doc = await db.collection("fifa").findOne({ contest: "fifa-2026" });

  if (!doc) {
    console.log("[check] No FIFA document found in collection 'fifa'.");
  } else {
    console.log("[check] FIFA document FOUND. syncedAt:", doc.syncedAt);
    console.log("[check] counts:", {
      matches: doc.matches?.length ?? 0,
      leaderboard: doc.leaderboard?.length ?? 0,
      leaguePredictions: doc.leaguePredictions?.length ?? 0,
      knockoutPredictions: doc.knockoutPredictions?.length ?? 0,
      triviaPredictions: doc.triviaPredictions?.length ?? 0,
      preTournament: doc.preTournament?.length ?? 0,
    });
    const top = [...(doc.leaderboard ?? [])]
      .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
      .slice(0, 3)
      .map((e) => `${e.name} (${e.total})`);
    console.log("[check] top 3 leaderboard:", top);
  }
} catch (err) {
  console.error("[check] Error:", err.message);
  process.exit(1);
} finally {
  await client.close();
}
