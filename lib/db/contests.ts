import { getDb } from "../mongodb";
import { Contest, ContestStatus } from "../types";

const COLLECTION = "contests";

interface ContestDoc {
  _id: { toString(): string };
  slug?: string;
  title: string;
  emoji: string;
  status: ContestStatus;
  participants: number;
  daysLeft?: number;
  leaderTeaser?: string;
  winner?: string;
  tagline: string;
}

function mapContest(d: ContestDoc): Contest {
  return {
    id: d.slug || d._id.toString(),
    title: d.title,
    emoji: d.emoji,
    status: d.status,
    participants: d.participants,
    daysLeft: d.daysLeft,
    leaderTeaser: d.leaderTeaser,
    winner: d.winner,
    tagline: d.tagline,
  };
}

export async function getActiveContests(): Promise<Contest[]> {
  const db = await getDb();
  const docs = (await db
    .collection(COLLECTION)
    .find({ status: { $ne: "archived" } })
    .toArray()) as unknown as ContestDoc[];
  return docs.map(mapContest);
}

export async function getArchivedContests(): Promise<Contest[]> {
  const db = await getDb();
  const docs = (await db
    .collection(COLLECTION)
    .find({ status: "archived" })
    .toArray()) as unknown as ContestDoc[];
  return docs.map(mapContest);
}
