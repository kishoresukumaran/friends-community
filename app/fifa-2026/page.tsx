import Link from "next/link";
import { loadFifaSnapshot } from "@/lib/content";
import FifaDashboard from "@/components/fifa/FifaDashboard";

export const dynamic = "force-dynamic";

function formatSyncedAt(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function FifaPage() {
  const snapshot = await loadFifaSnapshot();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8">
        <Link
          href="/#active-contests"
          className="text-sm font-semibold text-white/50 transition hover:text-white/80"
        >
          ← Back to home
        </Link>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          FIFA World Cup 2026 <span className="text-gradient">Predictions</span> ⚽
        </h1>
        <p className="mt-2 text-white/60">
          Live standings, match results, and everyone&apos;s calls — synced from
          the group&apos;s prediction sheet.
        </p>
        {snapshot?.syncedAt && (
          <p className="mt-1 text-xs text-white/35">
            Last updated {formatSyncedAt(snapshot.syncedAt)}
          </p>
        )}
      </div>

      {!snapshot || snapshot.leaderboard.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center">
          <p className="text-3xl">📡</p>
          <p className="mt-3 font-display text-lg font-bold text-white">
            No data synced yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/55">
            Standings will appear here once the prediction sheet syncs. The sync
            runs automatically every few minutes during the tournament.
          </p>
        </div>
      ) : (
        <FifaDashboard snapshot={snapshot} />
      )}
    </main>
  );
}
