import { NextResponse } from "next/server";
import { ADMIN_COOKIE, COOKIE_OPTIONS, createToken, passwordMatches } from "@/lib/adminAuth";

export async function POST(req: Request) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not set on the server." }, { status: 500 });
  }
  // small delay slows down password guessing
  await new Promise((r) => setTimeout(r, 600));
  if (!password || !passwordMatches(password)) {
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, createToken(), COOKIE_OPTIONS);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return res;
}
