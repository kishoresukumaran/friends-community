import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { deleteFitnessMonth } from "@/lib/db/fitness";

// id is `${year}-${MM}`, e.g. "2026-06".
function parseId(id: string): { year: number; month: number } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(id);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = parseId(params.id);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    await deleteFitnessMonth(parsed.year, parsed.month);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}
