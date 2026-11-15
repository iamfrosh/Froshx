import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import Student from "@/models/Student";
import { createMissingStudents, defaultPassword } from "@/lib/student";
import { hashPassword } from "@/lib/studentAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as { action?: string; email?: string };
  await connectDB();

  if (b.action === "create-missing") {
    return NextResponse.json({ ok: true, ...(await createMissingStudents()) });
  }
  if (b.action === "reset" && b.email) {
    const r = await Student.updateOne(
      { email: b.email.toLowerCase() },
      { passwordHash: hashPassword(defaultPassword()), mustChangePassword: true, failedLogins: 0, lockUntil: null }
    );
    if (!r.matchedCount) return NextResponse.json({ error: "No dashboard account for that email yet." }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Bad request" }, { status: 400 });
}
