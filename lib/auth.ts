import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "fc-admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

const SECRET = process.env.SESSION_SECRET || "";

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function createSessionToken(): string {
  const payload = JSON.stringify({
    role: "admin",
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const data = Buffer.from(payload).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token || !SECRET) return false;
  const [data, sig] = token.split(".");
  if (!data || !sig) return false;
  if (!safeEqual(sig, sign(data))) return false;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    return payload.role === "admin" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

// Reads the admin session cookie (server components + route handlers).
export function isAdmin(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return verifySessionToken(token);
}

// Validates the submitted admin password against the configured env var.
export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  return safeEqual(password, expected);
}
