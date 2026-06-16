import crypto from "crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  FifaSnapshotInput,
  getFifaSnapshot,
  saveFifaSnapshot,
} from "@/lib/db/fifa";
import {
  FifaLeaderboardEntry,
  FifaMatch,
  FifaPlayerPicks,
  FifaPreTournamentEntry,
} from "@/lib/types";

const SYNC_SECRET = process.env.FIFA_SYNC_SECRET || "";

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// Accepts "Authorization: Bearer <secret>" or a raw "x-sync-secret" header.
function isAuthorized(req: Request): boolean {
  if (!SYNC_SECRET) return false;
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const raw = req.headers.get("x-sync-secret") || "";
  const provided = bearer || raw;
  if (!provided) return false;
  return timingSafeEqual(provided, SYNC_SECRET);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim();
}

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function bool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  const s = str(v).toLowerCase();
  return s === "true" || s === "yes" || s === "y" || s === "1";
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function normalizeMatch(raw: unknown): FifaMatch {
  const m = (raw || {}) as Record<string, unknown>;
  return {
    matchNo: num(m.matchNo),
    stage: str(m.stage),
    dateTime: str(m.dateTime),
    team1: str(m.team1),
    team2: str(m.team2),
    location: str(m.location),
    winner: str(m.winner),
    isPowerMatch: bool(m.isPowerMatch),
    underdogTeam: str(m.underdogTeam),
    triviaQuestion: str(m.triviaQuestion),
    triviaAnswer: str(m.triviaAnswer),
  };
}

function normalizeLeaderboard(raw: unknown): FifaLeaderboardEntry {
  const e = (raw || {}) as Record<string, unknown>;
  return {
    email: str(e.email),
    name: str(e.name),
    league: num(e.league),
    knockout: num(e.knockout),
    preTournament: num(e.preTournament),
    trivia: num(e.trivia),
    total: num(e.total),
  };
}

function normalizePicks(raw: unknown): FifaPlayerPicks {
  const p = (raw || {}) as Record<string, unknown>;
  const picksIn = (p.picks || {}) as Record<string, unknown>;
  const picks: Record<string, string> = {};
  for (const [k, v] of Object.entries(picksIn)) {
    const val = str(v);
    if (val) picks[k] = val;
  }
  return {
    email: str(p.email),
    name: str(p.name),
    picks,
    points: num(p.points),
    bonusPoints: num(p.bonusPoints),
    total: num(p.total),
  };
}

function normalizePreTournament(raw: unknown): FifaPreTournamentEntry {
  const p = (raw || {}) as Record<string, unknown>;
  return {
    email: str(p.email),
    name: str(p.name),
    top4: str(p.top4),
    finalists: str(p.finalists),
    champion: str(p.champion),
    actualTop4: str(p.actualTop4),
    actualFinalists: str(p.actualFinalists),
    actualChampion: str(p.actualChampion),
    points: num(p.points),
  };
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input: FifaSnapshotInput = {
    matches: arr(body.matches).map(normalizeMatch),
    leaderboard: arr(body.leaderboard).map(normalizeLeaderboard),
    leaguePredictions: arr(body.leaguePredictions).map(normalizePicks),
    knockoutPredictions: arr(body.knockoutPredictions).map(normalizePicks),
    triviaPredictions: arr(body.triviaPredictions).map(normalizePicks),
    preTournament: arr(body.preTournament).map(normalizePreTournament),
  };

  try {
    const { syncedAt } = await saveFifaSnapshot(input);
    return NextResponse.json({
      ok: true,
      syncedAt,
      counts: {
        matches: input.matches.length,
        leaderboard: input.leaderboard.length,
        leaguePredictions: input.leaguePredictions.length,
        knockoutPredictions: input.knockoutPredictions.length,
        triviaPredictions: input.triviaPredictions.length,
        preTournament: input.preTournament.length,
      },
    });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}

// Admin-only read for debugging the latest synced snapshot.
export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ snapshot: await getFifaSnapshot() });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}
