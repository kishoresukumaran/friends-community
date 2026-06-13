"use client";

import { useMemo, useState } from "react";
import { Member, Movie, MovieOptionKind, MovieOptions } from "@/lib/types";

const STAR_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];
const ADD_SENTINEL = "__add__";

type RatingState = Record<
  string,
  { included: boolean; name: string; stars: number }
>;

const fieldClass =
  "rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-green/60";

export default function MovieForm({
  members,
  movie,
  movieOptions,
  onDone,
  onCancel,
}: {
  members: Member[];
  movie?: Movie;
  movieOptions: MovieOptions;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(movie?.title || "");
  const [year, setYear] = useState(movie?.year ? String(movie.year) : "");
  const [language, setLanguage] = useState(movie?.language || "");
  const [genres, setGenres] = useState<string[]>(movie?.genre || []);
  const [emoji, setEmoji] = useState(movie?.emoji || "🎬");
  const [posterUrl, setPosterUrl] = useState(movie?.posterUrl || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Option lists are seeded from the server and grow when an admin adds one.
  const [languageOptions, setLanguageOptions] = useState(
    movieOptions.languages
  );
  const [genreOptions, setGenreOptions] = useState(movieOptions.genres);
  const [yearOptions, setYearOptions] = useState(movieOptions.years);
  const [optError, setOptError] = useState("");

  const [langAddOpen, setLangAddOpen] = useState(false);
  const [yearAddOpen, setYearAddOpen] = useState(false);
  const [genreAddOpen, setGenreAddOpen] = useState(false);

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

  function toggleGenre(g: string) {
    setGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  // Persists a new dropdown option and returns the cleaned value on success.
  async function addOption(
    kind: MovieOptionKind,
    rawValue: string
  ): Promise<string | null> {
    const value = rawValue.trim();
    if (!value) return null;
    setOptError("");
    try {
      const res = await fetch("/api/movie-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, value }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLanguageOptions(data.options.languages);
      setGenreOptions(data.options.genres);
      setYearOptions(data.options.years);
      return value;
    } catch {
      setOptError("Could not add that option.");
      return null;
    }
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
      year: year.trim() ? Number(year) : undefined,
      language: language.trim(),
      genre: genres,
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
            className={fieldClass}
          />

          <div className="flex gap-2">
            <select
              aria-label="Language"
              value={language}
              onChange={(e) => {
                if (e.target.value === ADD_SENTINEL) {
                  setLangAddOpen(true);
                } else {
                  setLanguage(e.target.value);
                }
              }}
              className={`min-w-0 flex-1 ${fieldClass} ${
                language ? "" : "text-white/40"
              }`}
            >
              <option value="" className="bg-ink">
                Language
              </option>
              {languageOptions.map((l) => (
                <option key={l} value={l} className="bg-ink">
                  {l}
                </option>
              ))}
              <option value={ADD_SENTINEL} className="bg-ink text-brand-green">
                + Add new…
              </option>
            </select>

            <select
              aria-label="Year"
              value={year}
              onChange={(e) => {
                if (e.target.value === ADD_SENTINEL) {
                  setYearAddOpen(true);
                } else {
                  setYear(e.target.value);
                }
              }}
              className={`w-28 ${fieldClass} ${year ? "" : "text-white/40"}`}
            >
              <option value="" className="bg-ink">
                Year
              </option>
              {yearOptions.map((y) => (
                <option key={y} value={String(y)} className="bg-ink">
                  {y}
                </option>
              ))}
              <option value={ADD_SENTINEL} className="bg-ink text-brand-green">
                + Add…
              </option>
            </select>

            <input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="Emoji"
              maxLength={4}
              className={`w-16 ${fieldClass}`}
            />
          </div>

          {langAddOpen && (
            <AddOptionRow
              placeholder="New language"
              onAdd={async (v) => {
                const added = await addOption("language", v);
                if (added) {
                  setLanguage(added);
                  setLangAddOpen(false);
                }
              }}
              onCancel={() => setLangAddOpen(false)}
            />
          )}

          {yearAddOpen && (
            <AddOptionRow
              placeholder="New year e.g. 2027"
              numeric
              onAdd={async (v) => {
                const added = await addOption("year", v);
                if (added) {
                  setYear(added);
                  setYearAddOpen(false);
                }
              }}
              onCancel={() => setYearAddOpen(false)}
            />
          )}

          <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5">
            <p className="mb-2 text-xs font-medium text-white/40">Genres</p>
            <div className="flex flex-wrap gap-1.5">
              {genreOptions.map((g) => {
                const selected = genres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      selected
                        ? "bg-brand-green text-ink"
                        : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
              {!genreAddOpen && (
                <button
                  type="button"
                  onClick={() => setGenreAddOpen(true)}
                  className="rounded-full border border-dashed border-white/25 px-3 py-1 text-xs font-semibold text-brand-green transition hover:bg-white/5"
                >
                  + Add
                </button>
              )}
            </div>
            {genreAddOpen && (
              <AddOptionRow
                placeholder="New genre"
                onAdd={async (v) => {
                  const added = await addOption("genre", v);
                  if (added) {
                    setGenres((prev) =>
                      prev.includes(added) ? prev : [...prev, added]
                    );
                    setGenreAddOpen(false);
                  }
                }}
                onCancel={() => setGenreAddOpen(false)}
              />
            )}
          </div>

          <input
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="Poster image URL"
            className={fieldClass}
          />

          {optError && <p className="text-sm text-sunset">{optError}</p>}
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

function AddOptionRow({
  placeholder,
  numeric,
  onAdd,
  onCancel,
}: {
  placeholder: string;
  numeric?: boolean;
  onAdd: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!value.trim() || saving) return;
    setSaving(true);
    await onAdd(value);
    setSaving(false);
  }

  return (
    <div className="mt-1 flex gap-2">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        inputMode={numeric ? "numeric" : undefined}
        maxLength={numeric ? 4 : 40}
        className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-brand-green/60"
      />
      <button
        type="button"
        onClick={submit}
        disabled={saving || !value.trim()}
        className="rounded-xl bg-brand-green px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-110 disabled:opacity-50"
      >
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10"
      >
        Cancel
      </button>
    </div>
  );
}
