import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { fetchLinkPreview } from "@/lib/linkPreview";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { url } = (await req.json().catch(() => ({}))) as { url?: string };
  if (!url) return NextResponse.json({ error: "Paste a link first." }, { status: 400 });
  try {
    return NextResponse.json(await fetchLinkPreview(url));
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Could not read that link." }, { status: 422 });
  }
}
