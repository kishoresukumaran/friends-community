import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { addMovieOption, getMovieOptions } from "@/lib/db/options";
import { MovieOptionKind } from "@/lib/types";

const KINDS: MovieOptionKind[] = ["language", "genre", "year"];

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ options: await getMovieOptions() });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let kind: MovieOptionKind | null = null;
  let value = "";
  try {
    const body = (await req.json()) as Record<string, unknown>;
    if (KINDS.includes(body.kind as MovieOptionKind)) {
      kind = body.kind as MovieOptionKind;
    }
    if (typeof body.value === "string" || typeof body.value === "number") {
      value = String(body.value);
    }
  } catch {
    // ignore — handled below
  }

  if (!kind || !value.trim()) {
    return NextResponse.json(
      { error: "kind and value are required" },
      { status: 400 }
    );
  }

  try {
    const options = await addMovieOption(kind, value);
    return NextResponse.json({ options }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not add option" }, { status: 400 });
  }
}
