import { BreakdownRow } from "@/lib/analytics";

export default function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: BreakdownRow[];
}) {
  const maxCount = rows.reduce((m, r) => Math.max(m, r.count), 0) || 1;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
      <h3 className="font-display text-base font-bold text-white">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-sm text-white/40">No data yet</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/80">{row.label}</span>
                <span className="text-white/50">
                  {row.average.toFixed(1)} ★ · {row.count}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-green to-grape"
                  style={{ width: `${(row.count / maxCount) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
