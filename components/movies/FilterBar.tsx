export interface Filters {
  year: string;
  genre: string;
  language: string;
}

export default function FilterBar({
  years,
  genres,
  languages,
  filters,
  onChange,
  onClear,
  resultCount,
}: {
  years: number[];
  genres: string[];
  languages: string[];
  filters: Filters;
  onChange: (next: Filters) => void;
  onClear: () => void;
  resultCount: number;
}) {
  const hasFilters = filters.year || filters.genre || filters.language;

  const selectClass =
    "rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-green/60";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        aria-label="Filter by year"
        value={filters.year}
        onChange={(e) => onChange({ ...filters, year: e.target.value })}
        className={selectClass}
      >
        <option value="" className="bg-ink">
          All years
        </option>
        {years.map((y) => (
          <option key={y} value={String(y)} className="bg-ink">
            {y}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by genre"
        value={filters.genre}
        onChange={(e) => onChange({ ...filters, genre: e.target.value })}
        className={selectClass}
      >
        <option value="" className="bg-ink">
          All genres
        </option>
        {genres.map((g) => (
          <option key={g} value={g} className="bg-ink">
            {g}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by language"
        value={filters.language}
        onChange={(e) => onChange({ ...filters, language: e.target.value })}
        className={selectClass}
      >
        <option value="" className="bg-ink">
          All languages
        </option>
        {languages.map((l) => (
          <option key={l} value={l} className="bg-ink">
            {l}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10"
        >
          Clear
        </button>
      )}

      <span className="ml-auto text-sm text-white/45">
        {resultCount} {resultCount === 1 ? "movie" : "movies"}
      </span>
    </div>
  );
}
