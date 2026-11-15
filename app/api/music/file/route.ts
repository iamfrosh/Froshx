import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import MusicSetting from "@/models/MusicSetting";

export const dynamic = "force-dynamic";

// Serves the uploaded track. Supports Range requests, which iPhones need to play audio.
export async function GET(req: Request) {
  try {
    await connectDB();
    const m = await MusicSetting.findOne({ key: "main" }).select("+audioData audioType hasUpload");
    if (!m || !m.hasUpload || !m.audioData) return new NextResponse("Not found", { status: 404 });
    const buf = m.audioData as unknown as Buffer;
    const total = buf.length;
    const type = m.audioType || "audio/mpeg";
    const base = { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "public, max-age=3600" };

    const range = req.headers.get("range");
    const match = range?.match(/bytes=(\d*)-(\d*)/);
    if (match) {
      let start = match[1] ? parseInt(match[1], 10) : 0;
      let end = match[2] ? parseInt(match[2], 10) : total - 1;
      if (!match[1] && match[2]) { start = Math.max(0, total - parseInt(match[2], 10)); end = total - 1; }
      end = Math.min(end, total - 1);
      if (start > end || start >= total) return new NextResponse(null, { status: 416, headers: { "Content-Range": `bytes */${total}` } });
      const chunk = buf.subarray(start, end + 1);
      return new NextResponse(new Uint8Array(chunk), { status: 206, headers: { ...base, "Content-Range": `bytes ${start}-${end}/${total}`, "Content-Length": String(chunk.length) } });
    }
    return new NextResponse(new Uint8Array(buf), { headers: { ...base, "Content-Length": String(total) } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
