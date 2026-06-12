"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError("Incorrect admin password.");
        setLoading(false);
      }
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center shadow-pop sm:p-8"
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-grape to-brand-green text-2xl shadow-pop">
          🔑
        </span>
        <h1 className="mt-4 font-display text-2xl font-extrabold text-white">
          Admin access
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Enter the admin password to manage members and movies.
        </p>

        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError("");
          }}
          placeholder="Admin password"
          aria-label="Admin password"
          className="mt-6 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-lg font-semibold text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-green/60"
        />

        {error && (
          <p className="mt-2 text-sm font-semibold text-sunset">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full bg-brand-green px-5 py-3 font-semibold text-ink shadow-pop transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Checking…" : "Enter admin →"}
        </button>
      </form>
    </div>
  );
}
