import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { aiConfig } from "@/lib/aiConfig";
import { askAI } from "@/lib/aiClient";
import { parseAiReply, systemPrompt } from "@/lib/chatKnowledge";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

// Admin-only: checks that the AI key really works and shows the exact error if not.
export async function POST() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cfg = aiConfig();
  if (!cfg.ready) {
    return NextResponse.json({ ok: false, error: "No AI key found. In Vercel add AI_API_KEY (and AI_PROVIDER = gemini), then redeploy. If you just added it, you must redeploy for it to take effect." });
  }
  try {
    const { text, model } = await askAI(systemPrompt(), [{ role: "user", content: "How much is a website, and what services do you offer?" }], 700);
    return NextResponse.json({ ok: true, provider: cfg.provider, model, reply: parseAiReply(text).text });
  } catch (e) {
    return NextResponse.json({ ok: false, provider: cfg.provider, error: e instanceof Error ? e.message : "Failed" });
  }
}
