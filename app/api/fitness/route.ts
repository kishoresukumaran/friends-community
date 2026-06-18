import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getFitnessMonths, upsertFitnessMonth } from "@/lib/db/fitness";
import { FitnessEntry, FitnessMonthInput } from "@/lib/types";

function parseInput(body: unknown): FitnessMonthInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const year = Number(b.year);
  const month = Number(b.month);
  if (!Number.isInteger(year) || year < 2000 || year > 9999) return null;
  if (!Number.isInteger(month) || month < 1 || month > 12) return null;
  const entries: FitnessEntry[] = Array.isArray(b.entries)
    ? b.entries
        .map((e) => e as Record<string, unknown>)
        .filter(
          (e) => typeof e.name === "string" && Number(e.distanceKm) > 0
        )
        .map((e) => ({
          memberId: typeof e.memberId === "string" ? e.memberId : undefined,
          name: String(e.name),
          distanceKm: Number(e.distanceKm),
        }))
    : [];
  return { year, month, entries };
}

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ months: await getFitnessMonths() });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let input: FitnessMonthInput | null = null;
  try {
    input = parseInput(await req.json());
  } catch {
    // ignore
  }
  if (!input) {
    return NextResponse.json(
      { error: "Valid year and month are required" },
      { status: 400 }
    );
  }
  try {
    const month = await upsertFitnessMonth(input);
    return NextResponse.json({ month }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}
