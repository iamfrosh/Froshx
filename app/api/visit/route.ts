import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Visit from "@/models/Visit";

const BOT = /bot|crawl|spider|slurp|preview|lighthouse|headless/i;

export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") || "";
    if (BOT.test(ua)) return NextResponse.json({ ok: true });

    const body = (await req.json()) as { sid?: string; path?: string; referrer?: string };
    const sid = (body.sid || "").slice(0, 64);
    const path = (body.path || "/").slice(0, 200);
    if (!sid || path.startsWith("/admin")) return NextResponse.json({ ok: true });

    let referrer = "";
    try {
      referrer = body.referrer ? new URL(body.referrer).hostname.slice(0, 100) : "";
    } catch {}

    await connectDB();
    await Visit.create({
      sid,
      path,
      referrer,
      device: /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
