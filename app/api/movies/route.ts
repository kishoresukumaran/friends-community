import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { createMovie, getMovies } from "@/lib/db/movies";
import { MovieInput } from "@/lib/types";

function parseInput(body: unknown): MovieInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  if (typeof b.title !== "string" || !b.title.trim()) return null;
  const ratings = Array.isArray(b.ratings)
    ? b.ratings
        .map((r) => r as Record<string, unknown>)
        .filter((r) => typeof r.name === "string" && Number(r.stars) > 0)
        .map((r) => ({
          memberId: typeof r.memberId === "string" ? r.memberId : undefined,
          name: String(r.name),
          stars: Number(r.stars),
        }))
    : [];
  return {
    title: b.title,
    year: Number(b.year) > 0 ? Number(b.year) : undefined,
    language: typeof b.language === "string" ? b.language : "",
    genre: Array.isArray(b.genre) ? b.genre.map(String) : [],
    posterUrl: typeof b.posterUrl === "string" ? b.posterUrl : "",
    emoji: typeof b.emoji === "string" ? b.emoji : "🎬",
    ratings,
  };
}

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ movies: await getMovies() });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let input: MovieInput | null = null;
  try {
    input = parseInput(await req.json());
  } catch {
    // ignore
  }
  if (!input) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }
  try {
    const movie = await createMovie(input);
    return NextResponse.json({ movie }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}
