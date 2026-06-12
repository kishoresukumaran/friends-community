import { ReactNode } from "react";

type Tone = "live" | "neutral" | "gold" | "grape";

const tones: Record<Tone, string> = {
  live: "bg-brand-green/15 text-brand-green ring-brand-green/30",
  neutral: "bg-white/10 text-white/80 ring-white/15",
  gold: "bg-gold/15 text-gold ring-gold/30",
  grape: "bg-grape/15 text-grape ring-grape/30",
};

export default function Badge({
  children,
  tone = "neutral",
  pulse = false,
}: {
  children: ReactNode;
  tone?: Tone;
  pulse?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${tones[tone]}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
