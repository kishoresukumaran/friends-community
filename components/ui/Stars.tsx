// Renders a 0-5 star verdict, supporting half stars.

export default function Stars({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const clamped = Math.max(0, Math.min(5, value));

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${clamped} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = Math.max(0, Math.min(1, clamped - i)); // 0, 0.5, or 1
        return (
          <span key={i} className={`relative inline-block ${dimension}`}>
            <Star className={`${dimension} text-white/15`} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star className={`${dimension} text-gold`} />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2.5l2.9 5.88 6.49.94-4.7 4.58 1.11 6.46L12 17.9l-5.8 3.05 1.1-6.46-4.69-4.58 6.49-.94L12 2.5z" />
    </svg>
  );
}
