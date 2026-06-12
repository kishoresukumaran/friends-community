import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-card backdrop-blur-sm transition hover:border-white/20 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
