import {
  FifaLeaderboardEntry,
  FifaMatch,
  FifaPlayerPicks,
  FifaSnapshot,
} from "./types";

export function norm(s: string): string {
  return (s || "").trim().toLowerCase();
}

function isDecided(m: FifaMatch): boolean {
  return Boolean(m.winner && m.winner.trim());
}

function isKnockout(stage: string): boolean {
  return !norm(stage).startsWith("group");
}

function mapMatches(snapshot: FifaSnapshot): Map<number, FifaMatch> {
  const map = new Map<number, FifaMatch>();
  for (const m of snapshot.matches) map.set(m.matchNo, m);
  return map;
}

// A player's combined match-winner picks across league + knockout rounds,
// keyed by match number (as a string).
interface CombinedPicker {
  email: string;
  name: string;
  picks: Record<string, string>;
}

function combinedMatchPicks(snapshot: FifaSnapshot): Map<string, CombinedPicker> {
  const map = new Map<string, CombinedPicker>();
  const add = (list: FifaPlayerPicks[]) => {
    for (const p of list) {
      const key = p.email || p.name;
      const cur =
        map.get(key) || { email: p.email, name: p.name, picks: {} };
      for (const [k, v] of Object.entries(p.picks)) {
        if (v) cur.picks[k] = v;
      }
      if (!cur.name && p.name) cur.name = p.name;
      map.set(key, cur);
    }
  };
  add(snapshot.leaguePredictions);
  add(snapshot.knockoutPredictions);
  return map;
}

// --- Title race ----------------------------------------------------------

export interface TitleRaceRow {
  rank: number;
  name: string;
  total: number;
  behindLeader: number;
  toOvertake: number | null; // points needed to pass the player directly above
}

export function titleRace(leaderboard: FifaLeaderboardEntry[]): TitleRaceRow[] {
  const sorted = [...leaderboard].sort(
    (a, b) => b.total - a.total || a.name.localeCompare(b.name)
  );
  const leaderTotal = sorted[0]?.total ?? 0;
  return sorted.map((p, i) => ({
    rank: i + 1,
    name: p.name,
    total: p.total,
    behindLeader: leaderTotal - p.total,
    toOvertake: i === 0 ? null : sorted[i - 1].total - p.total + 1,
  }));
}

// --- Accuracy ------------------------------------------------------------

export interface AccuracyRow {
  name: string;
  correct: number;
  decided: number;
  pct: number;
}

export function accuracyTable(snapshot: FifaSnapshot): AccuracyRow[] {
  const matchByNo = mapMatches(snapshot);
  const pickers = combinedMatchPicks(snapshot);
  const rows: AccuracyRow[] = [];
  for (const p of Array.from(pickers.values())) {
    let correct = 0;
    let decided = 0;
    for (const [k, pick] of Object.entries(p.picks)) {
      const m = matchByNo.get(Number(k));
      if (!m || !isDecided(m)) continue;
      decided++;
      if (norm(m.winner) === norm(pick)) correct++;
    }
    rows.push({ name: p.name, correct, decided, pct: decided ? correct / decided : 0 });
  }
  return rows
    .filter((r) => r.decided > 0)
    .sort(
      (a, b) =>
        b.pct - a.pct || b.decided - a.decided || a.name.localeCompare(b.name)
    );
}

// --- Form (last N decided matches) ---------------------------------------

export type FormResult = "correct" | "wrong" | "none";

export interface FormCell {
  matchNo: number;
  result: FormResult;
}

export interface FormRow {
  name: string;
  cells: FormCell[];
  correct: number;
  played: number;
}

export interface FormData {
  recentMatchNos: number[];
  rows: FormRow[];
  hottest: FormRow | null;
}

export function formTable(snapshot: FifaSnapshot, n = 5): FormData {
  const decided = snapshot.matches
    .filter(isDecided)
    .sort((a, b) => a.matchNo - b.matchNo);
  const recent = decided.slice(-n);
  const pickers = combinedMatchPicks(snapshot);
  const rows: FormRow[] = [];
  for (const p of Array.from(pickers.values())) {
    let correct = 0;
    let played = 0;
    const cells: FormCell[] = recent.map((m) => {
      const pick = p.picks[String(m.matchNo)];
      if (!pick) return { matchNo: m.matchNo, result: "none" };
      played++;
      const ok = norm(m.winner) === norm(pick);
      if (ok) correct++;
      return { matchNo: m.matchNo, result: ok ? "correct" : "wrong" };
    });
    rows.push({ name: p.name, cells, correct, played });
  }
  rows.sort(
    (a, b) =>
      b.correct - a.correct ||
      (b.played ? b.correct / b.played : 0) -
        (a.played ? a.correct / a.played : 0) ||
      a.name.localeCompare(b.name)
  );
  const hottest = rows.find((r) => r.played > 0) || null;
  return { recentMatchNos: recent.map((m) => m.matchNo), rows, hottest };
}

// --- Category champions --------------------------------------------------

export interface CategoryChampion {
  label: string;
  emoji: string;
  value: number;
  names: string[];
}

export function categoryChampions(
  leaderboard: FifaLeaderboardEntry[]
): CategoryChampion[] {
  const cats: {
    key: "league" | "knockout" | "preTournament" | "trivia";
    label: string;
    emoji: string;
  }[] = [
    { key: "league", label: "League King", emoji: "👑" },
    { key: "knockout", label: "KO Master", emoji: "🥊" },
    { key: "preTournament", label: "Oracle", emoji: "🔮" },
    { key: "trivia", label: "Trivia Genius", emoji: "🧠" },
  ];
  return cats.map((c) => {
    let max = -Infinity;
    for (const p of leaderboard) max = Math.max(max, p[c.key]);
    const names =
      max > 0 ? leaderboard.filter((p) => p[c.key] === max).map((p) => p.name) : [];
    return {
      label: c.label,
      emoji: c.emoji,
      value: max === -Infinity ? 0 : max,
      names,
    };
  });
}

// --- Crowd / consensus ---------------------------------------------------

export interface MatchPickStat {
  matchNo: number;
  stage: string;
  team1: string;
  team2: string;
  team1Count: number;
  team2Count: number;
  total: number;
  majorityTeam: string;
  majorityCount: number;
  majorityPct: number;
  decided: boolean;
  winner: string;
  majorityCorrect: boolean | null;
}

export function matchPickStats(snapshot: FifaSnapshot): MatchPickStat[] {
  const pickers = combinedMatchPicks(snapshot);
  const stats: MatchPickStat[] = [];
  for (const m of snapshot.matches) {
    let t1 = 0;
    let t2 = 0;
    for (const p of Array.from(pickers.values())) {
      const pick = p.picks[String(m.matchNo)];
      if (!pick) continue;
      if (norm(pick) === norm(m.team1)) t1++;
      else if (norm(pick) === norm(m.team2)) t2++;
    }
    const total = t1 + t2;
    if (total === 0) continue;
    const majorityTeam = t1 >= t2 ? m.team1 : m.team2;
    const majorityCount = Math.max(t1, t2);
    const decided = isDecided(m);
    stats.push({
      matchNo: m.matchNo,
      stage: m.stage,
      team1: m.team1,
      team2: m.team2,
      team1Count: t1,
      team2Count: t2,
      total,
      majorityTeam,
      majorityCount,
      majorityPct: majorityCount / total,
      decided,
      winner: m.winner,
      majorityCorrect: decided ? norm(majorityTeam) === norm(m.winner) : null,
    });
  }
  return stats;
}

export interface ContrarianWin {
  matchNo: number;
  label: string;
  winner: string;
  backers: string[];
  backerCount: number;
  total: number;
}

// Decided matches where the winning team was the minority pick, plus who
// backed the underdog.
export function contrarianWins(snapshot: FifaSnapshot): ContrarianWin[] {
  const pickers = combinedMatchPicks(snapshot);
  const divisive = matchPickStats(snapshot).filter(
    (s) => s.decided && s.majorityCorrect === false
  );
  const wins: ContrarianWin[] = [];
  for (const s of divisive) {
    const backers: string[] = [];
    for (const p of Array.from(pickers.values())) {
      const pick = p.picks[String(s.matchNo)];
      if (pick && norm(pick) === norm(s.winner)) backers.push(p.name);
    }
    wins.push({
      matchNo: s.matchNo,
      label: `${s.team1} vs ${s.team2}`,
      winner: s.winner,
      backers,
      backerCount: backers.length,
      total: s.total,
    });
  }
  return wins.sort(
    (a, b) => a.backerCount - b.backerCount || b.matchNo - a.matchNo
  );
}

// The most evenly split match (prefers decided ones for the drama).
export function mostDivisiveMatch(snapshot: FifaSnapshot): MatchPickStat | null {
  const all = matchPickStats(snapshot).filter(
    (s) => s.team1Count > 0 && s.team2Count > 0
  );
  if (all.length === 0) return null;
  const decided = all.filter((s) => s.decided);
  const pool = decided.length > 0 ? decided : all;
  return pool.sort(
    (a, b) =>
      Math.abs(a.team1Count - a.team2Count) -
        Math.abs(b.team1Count - b.team2Count) || b.total - a.total
  )[0];
}

export interface WisdomStat {
  correct: number;
  total: number;
  pct: number;
}

// How often the crowd's majority pick was right, across decided matches.
export function wisdomOfCrowd(snapshot: FifaSnapshot): WisdomStat {
  const stats = matchPickStats(snapshot).filter(
    (s) => s.decided && s.majorityCorrect !== null
  );
  const total = stats.length;
  const correct = stats.filter((s) => s.majorityCorrect).length;
  return { correct, total, pct: total ? correct / total : 0 };
}

// --- Champion pick survival ----------------------------------------------

export interface ChampionPick {
  team: string;
  count: number;
  backers: string[];
  eliminated: boolean;
}

export interface ChampionSurvival {
  knockoutStarted: boolean;
  rows: ChampionPick[];
}

export function championSurvival(snapshot: FifaSnapshot): ChampionSurvival {
  const eliminated = new Set<string>();
  let knockoutStarted = false;
  for (const m of snapshot.matches) {
    if (!isKnockout(m.stage) || !isDecided(m)) continue;
    knockoutStarted = true;
    const loser = norm(m.winner) === norm(m.team1) ? m.team2 : m.team1;
    if (loser) eliminated.add(norm(loser));
  }

  const counts = new Map<string, { team: string; backers: string[] }>();
  for (const p of snapshot.preTournament) {
    const team = (p.champion || "").trim();
    if (!team) continue;
    const key = norm(team);
    const cur = counts.get(key) || { team, backers: [] };
    cur.backers.push(p.name);
    counts.set(key, cur);
  }

  const rows = Array.from(counts.values())
    .map((c) => ({
      team: c.team,
      count: c.backers.length,
      backers: c.backers,
      eliminated: eliminated.has(norm(c.team)),
    }))
    .sort((a, b) => b.count - a.count || a.team.localeCompare(b.team));

  return { knockoutStarted, rows };
}

// --- Head to head --------------------------------------------------------

export interface H2HRow {
  matchNo: number;
  label: string;
  pickA: string;
  pickB: string;
  winner: string;
  decided: boolean;
  aCorrect: boolean;
  bCorrect: boolean;
  agree: boolean;
}

export interface H2H {
  a: FifaLeaderboardEntry | null;
  b: FifaLeaderboardEntry | null;
  rows: H2HRow[];
  aCorrect: number;
  bCorrect: number;
  sharedDecided: number;
  agreements: number;
}

export function headToHead(
  snapshot: FifaSnapshot,
  emailA: string,
  emailB: string
): H2H {
  const a = snapshot.leaderboard.find((p) => p.email === emailA) || null;
  const b = snapshot.leaderboard.find((p) => p.email === emailB) || null;
  const matchByNo = mapMatches(snapshot);
  const pickers = combinedMatchPicks(snapshot);
  const pa = pickers.get(emailA);
  const pb = pickers.get(emailB);

  const nos = new Set<number>();
  if (pa) Object.keys(pa.picks).forEach((k) => nos.add(Number(k)));
  if (pb) Object.keys(pb.picks).forEach((k) => nos.add(Number(k)));

  const rows: H2HRow[] = [];
  let aCorrect = 0;
  let bCorrect = 0;
  let sharedDecided = 0;
  let agreements = 0;

  for (const no of Array.from(nos).sort((x, y) => x - y)) {
    const m = matchByNo.get(no);
    if (!m) continue;
    const pickA = pa?.picks[String(no)] || "";
    const pickB = pb?.picks[String(no)] || "";
    const decided = isDecided(m);
    const aOk = decided && !!pickA && norm(pickA) === norm(m.winner);
    const bOk = decided && !!pickB && norm(pickB) === norm(m.winner);
    if (aOk) aCorrect++;
    if (bOk) bCorrect++;
    if (decided && pickA && pickB) sharedDecided++;
    const agree = !!pickA && !!pickB && norm(pickA) === norm(pickB);
    if (agree) agreements++;
    rows.push({
      matchNo: no,
      label: `${m.team1} vs ${m.team2}`,
      pickA,
      pickB,
      winner: m.winner,
      decided,
      aCorrect: aOk,
      bCorrect: bOk,
      agree,
    });
  }

  return { a, b, rows, aCorrect, bCorrect, sharedDecided, agreements };
}
