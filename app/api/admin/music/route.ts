import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import MusicSetting from "@/models/MusicSetting";

export const dynamic = "force-dynamic";
const MAX_BYTES = 4_000_000; // keeps the upload under Vercel's request size limit

const view = (m: { enabled?: boolean; volume?: number; source?: string; url?: string; hasUpload?: boolean; audioName?: string } | null) => ({
  enabled: m ? m.enabled !== false : true,
  volume: typeof m?.volume === "number" ? m.volume : 0.7,
  source: m?.source || "builtin",
  url: m?.url || "",
  hasUpload: !!m?.hasUpload,
  audioName: m?.audioName || "",
});

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  return NextResponse.json(view(await MusicSetting.findOne({ key: "main" }).lean()));
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const enabled = form.get("enabled") === "true";
  const volume = Math.min(1, Math.max(0, Number(form.get("volume")) || 0));
  const source = ["builtin", "upload", "url"].includes(String(form.get("source"))) ? String(form.get("source")) : "builtin";
  let url = String(form.get("url") || "").trim().slice(0, 600);
  if (source === "url" && !/^https?:\/\//i.test(url)) return NextResponse.json({ error: "Paste a direct link that starts with https:// to an audio file." }, { status: 400 });
  if (source !== "url") url = url && /^https?:\/\//i.test(url) ? url : "";

  const update: Record<string, unknown> = { key: "main", enabled, volume, source, url };
  const file = form.get("file") as unknown as { size: number; type: string; name: string; arrayBuffer(): Promise<ArrayBuffer> } | string | null;
  if (file && typeof file !== "string" && file.size > 0) {
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "That file is too big. Keep it under 4 MB (a 128 kbps MP3 of about 4 minutes)." }, { status: 400 });
    if (!/^audio\//.test(file.type)) return NextResponse.json({ error: "Please upload an audio file (MP3, M4A, WAV or OGG)." }, { status: 400 });
    update.audioData = Buffer.from(await file.arrayBuffer());
    update.audioType = file.type;
    update.audioName = file.name.slice(0, 120);
    update.hasUpload = true;
  }

  await connectDB();
  const existing = await MusicSetting.findOne({ key: "main" }).select("hasUpload");
  if (source === "upload" && !update.hasUpload && !existing?.hasUpload) {
    return NextResponse.json({ error: "Choose an audio file to upload." }, { status: 400 });
  }
  const saved = await MusicSetting.findOneAndUpdate({ key: "main" }, update, { upsert: true, new: true, setDefaultsOnInsert: true });
  return NextResponse.json({ ok: true, ...view(saved) });
}
