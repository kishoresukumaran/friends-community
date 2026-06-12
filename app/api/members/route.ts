import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { addMember, getMembers } from "@/lib/db/members";

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({ members: await getMembers() });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let name = "";
  try {
    const body = await req.json();
    name = typeof body?.name === "string" ? body.name.trim() : "";
  } catch {
    // ignore
  }
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  try {
    const member = await addMember(name);
    return NextResponse.json({ member }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}
