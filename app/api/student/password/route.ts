import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { currentStudentId, hashPassword, verifyPassword } from "@/lib/studentAuth";
import { defaultPassword } from "@/lib/student";

export async function POST(req: Request) {
  const id = currentStudentId();
  if (!id) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const { current, next } = (await req.json().catch(() => ({}))) as { current?: string; next?: string };
  const pw = next || "";

  if (pw.length < 8) return NextResponse.json({ error: "Use at least 8 characters." }, { status: 400 });
  if (pw === defaultPassword()) return NextResponse.json({ error: "Choose a password different from the default one." }, { status: 400 });
  if (/^(.)\1+$/.test(pw)) return NextResponse.json({ error: "That password is too easy to guess." }, { status: 400 });

  await connectDB();
  const s = await Student.findById(id);
  if (!s) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  // the first change after logging in with the default password does not ask for the current one
  if (!s.mustChangePassword && !(current && verifyPassword(current, s.passwordHash))) {
    return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
  }
  s.passwordHash = hashPassword(pw);
  s.mustChangePassword = false;
  await s.save();
  return NextResponse.json({ ok: true });
}
