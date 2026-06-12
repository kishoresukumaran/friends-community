"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Member } from "@/lib/types";

export default function MembersManager({
  initialMembers,
}: {
  initialMembers: Member[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    const clean = name.trim();
    if (!clean) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });
      if (!res.ok) throw new Error();
      setName("");
      router.refresh();
    } catch {
      setError("Could not add member.");
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(id: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Could not remove member.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <h2 className="font-display text-xl font-extrabold text-white">
        Members{" "}
        <span className="text-base font-medium text-white/40">
          ({initialMembers.length})
        </span>
      </h2>
      <p className="mt-1 text-sm text-white/50">
        The fixed list of friends you can assign movie ratings to.
      </p>

      <form onSubmit={addMember} className="mt-4 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a friend's name"
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-green/60"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-brand-green px-4 py-2.5 font-semibold text-ink transition hover:brightness-110 disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-sunset">{error}</p>}

      <ul className="mt-4 flex flex-wrap gap-2">
        {initialMembers.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-3 pr-1 text-sm text-white/80"
          >
            <span>{m.name}</span>
            <button
              type="button"
              onClick={() => removeMember(m.id)}
              disabled={busy}
              aria-label={`Remove ${m.name}`}
              className="grid h-6 w-6 place-items-center rounded-full text-white/50 transition hover:bg-sunset/20 hover:text-sunset"
            >
              ×
            </button>
          </li>
        ))}
        {initialMembers.length === 0 && (
          <li className="text-sm text-white/40">No members yet. Add some above.</li>
        )}
      </ul>
    </section>
  );
}
