import { ObjectId } from "mongodb";
import { getDb } from "../mongodb";
import { Movie, MovieInput, MovieRatingEntry } from "../types";
import { computeStats } from "../util";

const COLLECTION = "movies";

interface MovieDoc {
  _id: ObjectId;
  title: string;
  language?: string;
  genre?: string[];
  posterUrl?: string;
  emoji?: string;
  ratings?: MovieRatingEntry[];
}

function mapMovie(d: MovieDoc): Movie {
  const ratings = (d.ratings || []).map((r) => ({
    memberId: r.memberId ? String(r.memberId) : undefined,
    name: r.name,
    stars: Number(r.stars) || 0,
  }));
  const { avgStars, votes } = computeStats(ratings);
  return {
    id: d._id.toString(),
    title: d.title,
    language: d.language || "",
    genre: d.genre || [],
    posterUrl: d.posterUrl || "",
    emoji: d.emoji || "🎬",
    ratings,
    avgStars,
    votes,
  };
}

export async function getMovies(): Promise<Movie[]> {
  const db = await getDb();
  const docs = (await db
    .collection(COLLECTION)
    .find({})
    .sort({ createdAt: -1 })
    .toArray()) as unknown as MovieDoc[];
  return docs.map(mapMovie);
}

export async function getMovie(id: string): Promise<Movie | null> {
  const db = await getDb();
  const doc = (await db
    .collection(COLLECTION)
    .findOne({ _id: new ObjectId(id) })) as unknown as MovieDoc | null;
  return doc ? mapMovie(doc) : null;
}

function normalizeInput(input: MovieInput) {
  return {
    title: input.title.trim(),
    language: (input.language || "").trim(),
    genre: (input.genre || []).map((g) => g.trim()).filter(Boolean),
    posterUrl: (input.posterUrl || "").trim(),
    emoji: (input.emoji || "🎬").trim() || "🎬",
    ratings: (input.ratings || [])
      .filter((r) => r.name && r.stars > 0)
      .map((r) => ({
        memberId: r.memberId,
        name: r.name,
        stars: Number(r.stars),
      })),
  };
}

export async function createMovie(input: MovieInput): Promise<Movie> {
  const db = await getDb();
  const now = new Date();
  const doc = { ...normalizeInput(input), createdAt: now, updatedAt: now };
  const res = await db.collection(COLLECTION).insertOne(doc);
  return mapMovie({ _id: res.insertedId, ...doc } as MovieDoc);
}

export async function updateMovie(
  id: string,
  input: MovieInput
): Promise<Movie | null> {
  const db = await getDb();
  const update = { ...normalizeInput(input), updatedAt: new Date() };
  await db
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set: update });
  return getMovie(id);
}

export async function deleteMovie(id: string): Promise<void> {
  const db = await getDb();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
}
