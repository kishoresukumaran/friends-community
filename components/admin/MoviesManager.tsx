"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Member, Movie } from "@/lib/types";
import MovieForm from "@/components/admin/MovieForm";

type Editing = { mode: "new" } | { mode: "edit"; movie: Movie } | null;

export default function MoviesManager({
  initialMovies,
  members,
}: {
  initialMovies: Movie[];
  members: Member[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [busyId, setBusyId] = useState("");

  function done() {
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this movie?")) return;
    setBusyId(id);
    try {
      await fetch(`/api/movies/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusyId("");
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-extrabold text-white">
          Movies{" "}
          <span className="text-base font-medium text-white/40">
            ({initialMovies.length})
          </span>
        </h2>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing({ mode: "new" })}
            className="rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-ink transition hover:brightness-110"
          >
            + New movie
          </button>
        )}
      </div>

      {editing?.mode === "new" && (
        <div className="mt-4">
          <MovieForm
            members={members}
            onDone={done}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <ul className="mt-4 space-y-3">
        {initialMovies.map((movie) => (
          <li key={movie.id}>
            {editing?.mode === "edit" && editing.movie.id === movie.id ? (
              <MovieForm
                members={members}
                movie={movie}
                onDone={done}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-grape to-sunset">
                  {movie.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={movie.posterUrl}
                      alt={`${movie.title} poster`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xl">
                      {movie.emoji || "🎬"}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-white">
                    {movie.title}
                  </p>
                  <p className="text-sm text-white/50">
                    {movie.avgStars.toFixed(1)} ★ · {movie.votes} ratings
                    {movie.language ? ` · ${movie.language}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing({ mode: "edit", movie })}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(movie.id)}
                    disabled={busyId === movie.id}
                    className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/80 transition hover:border-sunset/40 hover:bg-sunset/10 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
        {initialMovies.length === 0 && editing === null && (
          <li className="text-sm text-white/40">
            No movies yet. Add your first one above.
          </li>
        )}
      </ul>
    </section>
  );
}
