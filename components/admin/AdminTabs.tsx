"use client";

import { useState } from "react";
import { FitnessMonth, Member, Movie, MovieOptions } from "@/lib/types";
import MembersManager from "@/components/admin/MembersManager";
import MoviesManager from "@/components/admin/MoviesManager";
import FitnessManager from "@/components/admin/FitnessManager";

type Tab = "movies" | "fitness";

export default function AdminTabs({
  members,
  movies,
  movieOptions,
  fitnessMonths,
}: {
  members: Member[];
  movies: Movie[];
  movieOptions: MovieOptions;
  fitnessMonths: FitnessMonth[];
}) {
  const [tab, setTab] = useState<Tab>("movies");

  return (
    <div className="space-y-8">
      <MembersManager initialMembers={members} />

      <div>
        <div className="flex gap-2 rounded-2xl bg-white/5 p-1">
          <TabButton active={tab === "movies"} onClick={() => setTab("movies")}>
            Movies
          </TabButton>
          <TabButton
            active={tab === "fitness"}
            onClick={() => setTab("fitness")}
          >
            Fitness
          </TabButton>
        </div>

        <div className="mt-4">
          {tab === "movies" ? (
            <MoviesManager
              initialMovies={movies}
              members={members}
              movieOptions={movieOptions}
            />
          ) : (
            <FitnessManager members={members} months={fitnessMonths} />
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-white text-ink shadow-pop" : "text-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
