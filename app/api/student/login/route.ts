import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { STUDENT_COOKIE, STUDENT_COOKIE_OPTIONS, createStudentToken, hashPassword, verifyPassword } from "@/lib/studentAuth";

const GENERIC = "Incorrect email or password.";
const DUMMY = hashPassword("not-a-real-password");

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = (body.email || "").toLowerCase().trim();
  const password = body.password || "";
  if (!process.env.ADMIN_SECRET && !process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Login is not set up yet." }, { status: 500 });
  }
  if (!email || !password) return NextResponse.json({ error: GENERIC }, { status: 400 });

  await connectDB();
  const s = await Student.findOne({ email });
  if (!s) {
    verifyPassword(password, DUMMY); // keep timing similar whether or not the email exists
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }
  if (s.lockUntil && s.lockUntil.getTime() > Date.now()) {
    const mins = Math.ceil((s.lockUntil.getTime() - Date.now()) / 60000);
    return NextResponse.json({ error: `Too many attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` }, { status: 429 });
  }
  if (!verifyPassword(password, s.passwordHash)) {
    const fails = (s.failedLogins || 0) + 1;
    await Student.updateOne({ _id: s._id }, fails >= 5 ? { failedLogins: 0, lockUntil: new Date(Date.now() + 15 * 60000) } : { failedLogins: fails });
    return NextResponse.json({ error: GENERIC }, { status: 401 });
  }
  await Student.updateOne({ _id: s._id }, { failedLogins: 0, lockUntil: null, lastLoginAt: new Date() });
  const res = NextResponse.json({ ok: true, mustChangePassword: s.mustChangePassword });
  res.cookies.set(STUDENT_COOKIE, createStudentToken(String(s._id)), STUDENT_COOKIE_OPTIONS);
  return res;
}
