"use client";

import { useMemo, useState } from "react";
import { Member, Movie } from "@/lib/types";

const STAR_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

type RatingState = Record<
  string,
  { included: boolean; name: string; stars: number }
>;

export default function MovieForm({
  members,
  movie,
  onDone,
  onCancel,
}: {
  members: Member[];
  movie?: Movie;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(movie?.title || "");
  const [language, setLanguage] = useState(movie?.language || "");
  const [genre, setGenre] = useState((movie?.genre || []).join(", "));
  const [emoji, setEmoji] = useState(movie?.emoji || "🎬");
  const [posterUrl, setPosterUrl] = useState(movie?.posterUrl || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Build initial rating state keyed by member id, pre-filling existing ratings.
  const [ratings, setRatings] = useState<RatingState>(() => {
    const byName = new Map(
      (movie?.ratings || []).map((r) => [r.name, r.stars])
    );
    const state: RatingState = {};
    for (const m of members) {
      const stars = byName.get(m.name);
      state[m.id] = {
        included: stars !== undefined,
        name: m.name,
        stars: stars ?? 4,
      };
    }
    return state;
  });

  const includedCount = useMemo(
    () => Object.values(ratings).filter((r) => r.included).length,
    [ratings]
  );

  function toggle(id: string) {
    setRatings((prev) => ({
      ...prev,
      [id]: { ...prev[id], included: !prev[id].included },
    }));
  }

  function setStars(id: string, stars: number) {
    setRatings((prev) => ({
      ...prev,
      [id]: { ...prev[id], included: true, stars },
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    setBusy(true);
    setError("");

    const payload = {
      title: title.trim(),
      language: language.trim(),
      genre: genre
        .split(",")
        .map((g) => g.trim())
        .filter(Boolean),
      emoji: emoji.trim() || "🎬",
      posterUrl: posterUrl.trim(),
      ratings: members
        .filter((m) => ratings[m.id]?.included)
        .map((m) => ({
          memberId: m.id,
          name: m.name,
          stars: ratings[m.id].stars,
        })),
    };

    try {
      const res = await fetch(
        movie ? `/api/movies/${movie.id}` : "/api/movies",
        {
          method: movie ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error();
      onDone();
    } catch {
      setError("Could not save the movie.");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
    >
      <div className="flex gap-4">
        <div className="h-28 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-grape to-sunset">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt="Poster preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-3xl">
              {emoji || "🎬"}
            </div>
          )}
        </div>

        <div className="grid flex-1 gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Movie title"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-green/60"
          />
          <div className="flex gap-2">
            <input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Language"
              className="w-1/2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-green/60"
            />
            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="Emoji"
              maxLength={4}
              className="w-1/2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-green/60"
            />
          </div>
          <input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="Genres (comma separated)"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-green/60"
          />
          <input
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="Poster image URL"
            className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-green/60"
          />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-white/80">
          Ratings{" "}
          <span className="font-medium text-white/40">
            ({includedCount} selected)
          </span>
        </p>
        {members.length === 0 ? (
          <p className="mt-2 text-sm text-white/40">
            Add members above first, then assign their star ratings here.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-white/5">
            {members.map((m) => {
              const r = ratings[m.id];
              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <label className="flex items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={r?.included || false}
                      onChange={() => toggle(m.id)}
                      className="h-4 w-4 accent-brand-green"
                    />
                    {m.name}
                  </label>
                  <select
                    value={r?.stars ?? 4}
                    onChange={(e) => setStars(m.id, Number(e.target.value))}
                    disabled={!r?.included}
                    className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-green/60 disabled:opacity-40"
                  >
                    {STAR_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-ink">
                        {s} ★
                      </option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-sunset">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-brand-green px-5 py-2.5 font-semibold text-ink transition hover:brightness-110 disabled:opacity-60"
        >
          {busy ? "Saving…" : movie ? "Save changes" : "Create movie"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-semibold text-white/80 transition hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
