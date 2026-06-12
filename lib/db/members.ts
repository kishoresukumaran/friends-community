import { ObjectId } from "mongodb";
import { getDb } from "../mongodb";
import { Member } from "../types";

const COLLECTION = "members";

export async function getMembers(): Promise<Member[]> {
  const db = await getDb();
  const docs = await db
    .collection(COLLECTION)
    .find({})
    .sort({ name: 1 })
    .toArray();
  return docs.map((d) => ({ id: d._id.toString(), name: d.name as string }));
}

export async function addMember(name: string): Promise<Member> {
  const db = await getDb();
  const clean = name.trim();
  const res = await db
    .collection(COLLECTION)
    .insertOne({ name: clean, createdAt: new Date() });
  return { id: res.insertedId.toString(), name: clean };
}

export async function removeMember(id: string): Promise<void> {
  const db = await getDb();
  await db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
}
