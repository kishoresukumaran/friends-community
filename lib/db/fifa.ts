import { getDb } from "../mongodb";
import { FifaSnapshot } from "../types";

const COLLECTION = "fifa";
export const FIFA_CONTEST_ID = "fifa-2026";

// Shape accepted from the sync endpoint (everything except the server-set
// `contest` and `syncedAt` fields).
export type FifaSnapshotInput = Omit<FifaSnapshot, "contest" | "syncedAt">;

export async function getFifaSnapshot(): Promise<FifaSnapshot | null> {
  const db = await getDb();
  const doc = await db
    .collection(COLLECTION)
    .findOne({ contest: FIFA_CONTEST_ID });
  if (!doc) return null;
  return {
    contest: FIFA_CONTEST_ID,
    matches: doc.matches ?? [],
    leaderboard: doc.leaderboard ?? [],
    leaguePredictions: doc.leaguePredictions ?? [],
    knockoutPredictions: doc.knockoutPredictions ?? [],
    triviaPredictions: doc.triviaPredictions ?? [],
    preTournament: doc.preTournament ?? [],
    syncedAt:
      doc.syncedAt instanceof Date
        ? doc.syncedAt.toISOString()
        : String(doc.syncedAt ?? ""),
  };
}

export async function saveFifaSnapshot(
  input: FifaSnapshotInput
): Promise<{ syncedAt: string }> {
  const db = await getDb();
  const syncedAt = new Date();
  await db.collection(COLLECTION).updateOne(
    { contest: FIFA_CONTEST_ID },
    {
      $set: {
        contest: FIFA_CONTEST_ID,
        matches: input.matches ?? [],
        leaderboard: input.leaderboard ?? [],
        leaguePredictions: input.leaguePredictions ?? [],
        knockoutPredictions: input.knockoutPredictions ?? [],
        triviaPredictions: input.triviaPredictions ?? [],
        preTournament: input.preTournament ?? [],
        syncedAt,
      },
    },
    { upsert: true }
  );
  return { syncedAt: syncedAt.toISOString() };
}
