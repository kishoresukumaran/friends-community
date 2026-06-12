import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { removeMember } from "@/lib/db/members";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await removeMember(params.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 503 });
  }
}
