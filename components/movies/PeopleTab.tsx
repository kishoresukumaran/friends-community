"use client";

import { ReactNode, useMemo, useState } from "react";
import { Movie } from "@/lib/types";
import { groupSummary } from "@/lib/analytics";
import {
  allRaterNames,
  contrarianPicks,
  eraPreference,
  groupGenreTaste,
  groupLanguageTaste,
  groupYearTaste,
  GroupTaste,
  languagePreference,
  personGenreAffinity,
  personalityLabel,
  tasteTwins,
  TasteTwinPair,
} from "@/lib/movie-people-analytics";

export default function PeopleTab({ movies }: { movies: Movie[] }) {
  const names = useMemo(() => allRaterNames(movies), [movies]);
  const [selected, setSelected] = useState<string>(() => {
    if (movies.length === 0) return "";
    const counts = new Map<string, number>();
    for (const m of movies)
      for (const r of m.ratings)
        counts.set(r.name, (counts.get(r.name) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
  });

  const groupAvg = useMemo(() => groupSummary(movies).groupAverage, [movies]);

  // Group taste
  const genreTaste = useMemo(() => groupGenreTaste(movies), [movies]);
  const languageTaste = useMemo(() => groupLanguageTaste(movies), [movies]);
  const eraTaste = useMemo(() => groupYearTaste(movies), [movies]);

  // Taste twins
  const twins = useMemo(() => tasteTwins(movies, 3), [movies]);

  // Per person
  const personality = useMemo(
    () => personalityLabel(movies, selected, groupAvg),
    [movies, selected, groupAvg]
  );
  const genres = useMemo(
    () => personGenreAffinity(movies, selected),
    [movies, selected]
  );
  const languages = useMemo(
    () => languagePreference(movies, selected),
    [movies, selected]
  );
  const era = useMemo(() => eraPreference(movies, selected), [movies, selected]);
  const contrarian = useMemo(
    () => contrarianPicks(movies, selected, 5),
    [movies, selected]
  );

  if (names.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-white/40">
        No ratings yet — come back once the group has watched some films.
      </p>
    );
  }

  const maxGenreRating = Math.max(...genres.rows.map((r) => r.avgRating), 5);
  const maxLangRating = Math.max(...languages.map((r) => r.avgRating), 5);
  const maxEraRating = Math.max(...era.map((r) => r.avgRating), 5);

  return (
    <div className="space-y-10">
      {/* ── Group taste ─────────────────────────────────────────── */}
      <section>
        <SubHeading
          eyebrow="The whole crew"
          title="Group taste"
        />
        <p className="mt-1 text-xs text-white/50">
          What the group gravitates toward. Tap any card to see the reasoning.
        </p>
        <div className="mt-4 space-y-3">
          <GroupTasteCard
            emoji="🎭"
            kind="genre"
            taste={genreTaste}
          />
          <GroupTasteCard
            emoji="🗣️"
            kind="language"
            taste={languageTaste}
          />
          <GroupTasteCard emoji="📅" kind="era" taste={eraTaste} />
        </div>
      </section>

      {/* ── Taste twins ─────────────────────────────────────────── */}
      {twins.length > 0 && (
        <section>
          <SubHeading eyebrow="Kindred spirits" title="Taste twins" />
          <p className="mt-1 text-xs text-white/50">
            Pairs who rate movies most alike. Tap to see where they line up.
          </p>
          <div className="mt-4 space-y-3">
            {twins.slice(0, 5).map((pair) => (
              <TasteTwinCard
                key={`${pair.nameA}-${pair.nameB}`}
                pair={pair}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Per person ──────────────────────────────────────────── */}
      <section>
        <SubHeading eyebrow="Per person" title="Individual breakdown" />
        <select
          aria-label="Select person"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-green/60 sm:w-auto"
        >
          {names.map((n) => (
            <option key={n} value={n} className="bg-ink">
              {n}
            </option>
          ))}
        </select>

        {/* Personality */}
        <div className="mt-6">
          <Eyebrow text="Rating style" />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 font-display text-sm font-extrabold text-white">
              {personality.label}
            </span>
            <span className="text-sm text-white/60">
              {personality.description}
            </span>
          </div>
          <p className="mt-2 text-xs text-white/45">
            Avg rating:{" "}
            <span className="font-semibold text-white/70">
              {personality.avgRating} ★
            </span>{" "}
            vs group avg{" "}
            <span className="font-semibold text-white/70">{groupAvg} ★</span> ·{" "}
            {personality.moviesRated} movies rated
          </p>
        </div>

        {/* Genre affinity */}
        {genres.rows.length > 0 && (
          <div className="mt-6">
            <Eyebrow text="How they rate by genre" />
            {genres.topGenre && (
              <p className="mt-1 text-xs text-white/50">
                Loves{" "}
                <span className="font-semibold text-white/80">
                  {genres.topGenre}
                </span>
                {genres.bottomGenre &&
                  genres.bottomGenre !== genres.topGenre && (
                    <>
                      {" "}· hardest on{" "}
                      <span className="font-semibold text-white/80">
                        {genres.bottomGenre}
                      </span>
                    </>
                  )}
              </p>
            )}
            <p className="mt-2 text-xs text-white/40">
              Tap a row to see the movies behind it.
            </p>
            <BarList
              rows={genres.rows.map((r) => ({
                label: r.genre,
                value: r.avgRating,
                count: r.count,
                movies: r.movies,
              }))}
              max={maxGenreRating}
              color="bg-brand-green"
            />
          </div>
        )}

        {/* Language preference */}
        {languages.length > 0 && (
          <div className="mt-6">
            <Eyebrow text="Ratings by language" />
            <p className="mt-2 text-xs text-white/40">
              Tap a row to see the movies behind it.
            </p>
            <BarList
              rows={languages.map((r) => ({
                label: r.language,
                value: r.avgRating,
                count: r.count,
                movies: r.movies,
              }))}
              max={maxLangRating}
              color="bg-grape"
            />
          </div>
        )}

        {/* Era preference */}
        {era.length > 1 && (
          <div className="mt-6">
            <Eyebrow text="Era preference" />
            <p className="mt-2 text-xs text-white/40">
              Tap a row to see the movies behind it.
            </p>
            <BarList
              rows={era.map((r) => ({
                label: String(r.year),
                value: r.avgRating,
                count: r.count,
                movies: r.movies,
              }))}
              max={maxEraRating}
              color="bg-brand-teal"
            />
          </div>
        )}

        {/* Contrarian picks */}
        {contrarian.length > 0 && (
          <div className="mt-6">
            <Eyebrow text="Most divergent takes" />
            <p className="mt-1 text-xs text-white/50">
              Where their rating drifted furthest from the group average.
            </p>
            <ul className="mt-3 space-y-2">
              {contrarian.map((c) => (
                <li
                  key={c.title}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] px-4 py-3 text-sm"
                >
                  <span className="min-w-0 truncate text-white/85">
                    {c.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <span className="text-white/50">{c.avgStars} group</span>
                    <span className="text-white/30">→</span>
                    <span className="font-display font-extrabold text-white">
                      {c.stars}
                    </span>
                    <span
                      className={`w-10 text-right font-semibold ${
                        c.diff > 0 ? "text-brand-green" : "text-sunset"
                      }`}
                    >
                      {c.diff > 0 ? "+" : ""}
                      {c.diff}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

// ── group taste card ──────────────────────────────────────────────────────────

const GROUP_TASTE_COPY: Record<
  "genre" | "language" | "era",
  { title: string; noun: string; topLabel: (l: string) => string }
> = {
  genre: {
    title: "Favourite genre",
    noun: "genres",
    topLabel: (l) => l,
  },
  language: {
    title: "Favourite language",
    noun: "languages",
    topLabel: (l) => l,
  },
  era: {
    title: "Go-to era",
    noun: "release years",
    topLabel: (l) => l,
  },
};

function GroupTasteCard({
  emoji,
  kind,
  taste,
}: {
  emoji: string;
  kind: "genre" | "language" | "era";
  taste: GroupTaste;
}) {
  const copy = GROUP_TASTE_COPY[kind];
  const max = Math.max(...taste.rows.map((r) => r.average), 5);

  if (!taste.top) {
    return (
      <ExpandableCard
        disabled
        header={
          <CardHeader emoji={emoji} title={copy.title} value="—" />
        }
      >
        {null}
      </ExpandableCard>
    );
  }

  return (
    <ExpandableCard
      header={
        <CardHeader
          emoji={emoji}
          title={copy.title}
          value={`${copy.topLabel(taste.top.label)} · ${taste.top.average}★`}
        />
      }
    >
      <p className="mb-3 text-xs text-white/55">
        Each movie contributes the group&apos;s average rating once, so this
        ranks {copy.noun} by how the whole crew tends to score them (pick favours{" "}
        {copy.noun} with at least 2 movies).
      </p>
      <BarList
        rows={taste.rows.map((r) => ({
          label: r.label,
          value: r.average,
          count: r.count,
        }))}
        max={max}
        color="bg-gold"
      />
    </ExpandableCard>
  );
}

// ── taste twin card ───────────────────────────────────────────────────────────

function TasteTwinCard({ pair }: { pair: TasteTwinPair }) {
  const pct = Math.round(pair.correlation * 100);
  const exactMatches = pair.shared.filter((s) => s.diff === 0).length;

  return (
    <ExpandableCard
      header={
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <span className="text-base">🤝</span>
            <span className="truncate">{pair.nameA}</span>
            <span className="text-white/40">&</span>
            <span className="truncate">{pair.nameB}</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand-teal"
                style={{ width: `${Math.max(0, pct)}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right font-display text-sm font-extrabold text-brand-teal">
              {pct}%
            </span>
          </div>
        </div>
      }
    >
      <p className="mb-3 text-xs text-white/55">
        Across {pair.sharedCount} movies they both rated, their scores line up{" "}
        {pct}% (Pearson correlation). They rated {exactMatches} of them exactly
        the same.
      </p>
      <ul className="space-y-1.5">
        {pair.shared.map((s) => (
          <li
            key={s.title}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="min-w-0 truncate text-white/80">{s.title}</span>
            <span className="flex shrink-0 items-center gap-2">
              <span className="font-display font-bold text-white">
                {s.starsA}
              </span>
              <span className="text-white/30">vs</span>
              <span className="font-display font-bold text-white">
                {s.starsB}
              </span>
              <span
                className={`w-12 text-right text-xs font-semibold ${
                  s.diff === 0
                    ? "text-brand-green"
                    : s.diff <= 0.5
                    ? "text-white/50"
                    : "text-sunset"
                }`}
              >
                {s.diff === 0 ? "match" : `±${s.diff}`}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </ExpandableCard>
  );
}

// ── shared building blocks ──────────────────────────────────────────────────────

function ExpandableCard({
  header,
  children,
  disabled = false,
}: {
  header: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-expanded={open}
        disabled={disabled}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        {header}
        {!disabled && (
          <span
            className={`ml-auto shrink-0 self-start text-white/40 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        )}
      </button>
      {open && !disabled && (
        <div className="border-t border-white/10 px-4 py-3">{children}</div>
      )}
    </div>
  );
}

function CardHeader({
  emoji,
  title,
  value,
}: {
  emoji: string;
  title: string;
  value: string;
}) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-xl">
        {emoji}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold uppercase tracking-wide text-white/40">
          {title}
        </span>
        <span className="block truncate font-display font-extrabold text-white">
          {value}
        </span>
      </span>
    </span>
  );
}

interface BarRowData {
  label: string;
  value: number;
  count: number;
  movies?: { title: string; stars: number }[];
}

function BarList({
  rows,
  max,
  color,
}: {
  rows: BarRowData[];
  max: number;
  color: string;
}) {
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <BarRow key={r.label} row={r} max={max} color={color} />
      ))}
    </ul>
  );
}

function BarRow({
  row,
  max,
  color,
}: {
  row: BarRowData;
  max: number;
  color: string;
}) {
  const [open, setOpen] = useState(false);
  const expandable = !!row.movies && row.movies.length > 0;

  const bar = (
    <div className="flex items-center gap-3">
      <span className="flex w-24 shrink-0 items-center gap-1 sm:w-32">
        {expandable && (
          <span
            className={`shrink-0 text-white/35 transition-transform duration-200 ${
              open ? "rotate-90" : ""
            }`}
          >
            ›
          </span>
        )}
        <span className="truncate text-sm text-white/80">{row.label}</span>
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${(row.value / max) * 100}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right font-display text-sm font-extrabold text-white">
        {row.value}
      </span>
      <span className="w-8 shrink-0 text-right text-xs text-white/40">
        ×{row.count}
      </span>
    </div>
  );

  if (!expandable) {
    return <li>{bar}</li>;
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full rounded-lg text-left transition hover:bg-white/[0.03]"
      >
        {bar}
      </button>
      {open && (
        <ul className="mb-1 ml-3 mt-2 space-y-1 border-l border-white/10 pl-3">
          {row.movies!.map((m) => (
            <li
              key={m.title}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="min-w-0 truncate text-white/65">{m.title}</span>
              <span className="shrink-0 font-semibold text-white/85">
                {m.stars}★
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function SubHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-green">
        {eyebrow}
      </p>
      <h3 className="mt-0.5 font-display text-xl font-extrabold text-white sm:text-2xl">
        {title}
      </h3>
    </div>
  );
}

function Eyebrow({ text }: { text: string }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
      {text}
    </p>
  );
}
