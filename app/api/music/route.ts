import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MusicSetting from "@/models/MusicSetting";

export const dynamic = "force-dynamic";

// Public: what the website should play right now.
export async function GET() {
  let cfg = { enabled: true, volume: 0.7, source: "builtin", src: "" };
  try {
    await connectDB();
    const m = await MusicSetting.findOne({ key: "main" }).lean();
    if (m) {
      const v = m.updatedAt ? new Date(m.updatedAt).getTime() : 0;
      cfg = {
        enabled: m.enabled !== false,
        volume: typeof m.volume === "number" ? m.volume : 0.7,
        source: m.source || "builtin",
        src: m.source === "upload" && m.hasUpload ? `/api/music/file?v=${v}` : m.source === "url" ? m.url || "" : "",
      };
      if ((cfg.source === "upload" || cfg.source === "url") && !cfg.src) cfg.source = "builtin";
    }
  } catch {}
  return NextResponse.json(cfg, { headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" } });
}
