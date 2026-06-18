import { getDb } from "../mongodb";
import { FitnessEntry, FitnessMonth, FitnessMonthInput } from "../types";

const COLLECTION = "fitness";

interface FitnessDoc {
  year: number;
  month: number;
  entries?: FitnessEntry[];
}

function monthId(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function mapMonth(d: FitnessDoc): FitnessMonth {
  const entries = (d.entries || [])
    .map((e) => ({
      memberId: e.memberId ? String(e.memberId) : undefined,
      name: e.name,
      distanceKm: Number(e.distanceKm) || 0,
    }))
    .sort((a, b) => b.distanceKm - a.distanceKm || a.name.localeCompare(b.name));
  return {
    id: monthId(d.year, d.month),
    year: d.year,
    month: d.month,
    entries,
  };
}

function normalizeEntries(entries: FitnessEntry[]): FitnessEntry[] {
  return (entries || [])
    .filter((e) => e.name && Number(e.distanceKm) > 0)
    .map((e) => ({
      memberId: e.memberId,
      name: e.name,
      distanceKm: Math.round(Number(e.distanceKm) * 10) / 10,
    }));
}

export async function getFitnessMonths(): Promise<FitnessMonth[]> {
  const db = await getDb();
  const docs = (await db
    .collection(COLLECTION)
    .find({})
    .sort({ year: -1, month: -1 })
    .toArray()) as unknown as FitnessDoc[];
  return docs.map(mapMonth);
}

export async function upsertFitnessMonth(
  input: FitnessMonthInput
): Promise<FitnessMonth> {
  const db = await getDb();
  const year = Math.trunc(Number(input.year));
  const month = Math.trunc(Number(input.month));
  const entries = normalizeEntries(input.entries);
  const now = new Date();
  await db.collection(COLLECTION).updateOne(
    { year, month },
    {
      $set: { entries, updatedAt: now },
      $setOnInsert: { year, month, createdAt: now },
    },
    { upsert: true }
  );
  return mapMonth({ year, month, entries });
}

export async function deleteFitnessMonth(
  year: number,
  month: number
): Promise<void> {
  const db = await getDb();
  await db
    .collection(COLLECTION)
    .deleteOne({ year: Math.trunc(Number(year)), month: Math.trunc(Number(month)) });
}
