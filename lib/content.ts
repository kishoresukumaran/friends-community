// DB-backed reads for the public landing page, with graceful fallback to seed
// data so the site never breaks if MongoDB is empty or unreachable.

import { getActiveContests, getArchivedContests } from "./db/contests";
import { getMovies } from "./db/movies";
import { seedContests, seedMovies } from "./data";
import { Contest, Movie } from "./types";

export async function loadContests(): Promise<{
  active: Contest[];
  archived: Contest[];
}> {
  try {
    const [active, archived] = await Promise.all([
      getActiveContests(),
      getArchivedContests(),
    ]);
    if (active.length || archived.length) return { active, archived };
  } catch {
    // fall through to seed data
  }
  return {
    active: seedContests.filter((c) => c.status !== "archived"),
    archived: seedContests.filter((c) => c.status === "archived"),
  };
}

export async function loadMovies(): Promise<Movie[]> {
  try {
    const movies = await getMovies();
    if (movies.length) return movies;
  } catch {
    // fall through to seed data
  }
  return seedMovies;
}
