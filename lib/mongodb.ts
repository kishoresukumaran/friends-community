import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "friends_community";

// True when a connection string is configured. Public reads fall back to seed
// data when this is false, so the site still renders without a DB.
export const DB_CONFIGURED = Boolean(uri);

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> | null {
  if (!uri) return null;

  // Reuse a single connection across hot reloads (dev) and serverless
  // invocations (prod) to stay well within the free-tier connection limit.
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(uri).connect();
  }
  return global._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const clientPromise = getClientPromise();
  if (!clientPromise) {
    throw new Error("MONGODB_URI is not set");
  }
  const client = await clientPromise;
  return client.db(dbName);
}
