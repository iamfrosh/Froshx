import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatLog from "@/models/ChatLog";
import { parseAiReply, systemPrompt } from "@/lib/chatKnowledge";
import { aiConfig } from "@/lib/aiConfig";
import { askAI, Turn } from "@/lib/aiClient";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");
const startOfDay = () => { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d; };

// alternate user / assistant turns, starting and ending with the user
function cleanHistory(history: unknown, message: string): Turn[] {
  const raw = Array.isArray(history) ? history : [];
  const turns: Turn[] = [];
  for (const h of raw.slice(-12)) {
    const role = h?.role === "assistant" ? "assistant" : "user";
    const content = clip(h?.content, 700);
    if (!content) continue;
    if (turns.length && turns[turns.length - 1].role === role) turns[turns.length - 1].content += `\n${content}`;
    else turns.push({ role, content });
  }
  if (turns.length && turns[turns.length - 1].role === "user") turns.pop(); // the new message replaces it
  while (turns.length && turns[0].role !== "user") turns.shift();
  turns.push({ role: "user", content: message });
  return turns;
}

// lets the chat bubble know whether AI answers are switched on
export async function GET() {
  return NextResponse.json({ ai: aiConfig().ready });
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const message = clip(b.message, 600);
  const sid = clip(b.sid, 64);
  if (!message || !sid) return NextResponse.json({ ok: false }, { status: 400 });

  // the browser already answered from the free built-in knowledge: just keep a record
  if (b.log === true) {
    try {
      await connectDB();
      await ChatLog.create({ sid, question: message, answer: clip(b.answer, 400), source: "rules", intent: clip(b.intent, 40) });
    } catch {}
    return NextResponse.json({ ok: true });
  }

  let db = false;
  try { await connectDB(); db = true; } catch {}
  const log = async (answer: string, source: "ai" | "none", intent = "unknown") => {
    if (!db) return;
    try { await ChatLog.create({ sid, question: message, answer, source, intent }); } catch {}
  };

  if (!aiConfig().ready) {
    await log("", "none");
    return NextResponse.json({ reply: null, handoff: true });
  }

  try {
    // protect against abuse and surprise bills (only when the database is reachable)
    if (db) {
      const [mine, today] = await Promise.all([
        ChatLog.countDocuments({ sid, source: "ai", createdAt: { $gte: startOfDay() } }),
        ChatLog.countDocuments({ source: "ai", createdAt: { $gte: startOfDay() } }),
      ]);
      if (mine >= Number(process.env.CHAT_SESSION_LIMIT || 40) || today >= Number(process.env.CHAT_DAILY_LIMIT || 600)) {
        await log("", "none", "limit");
        return NextResponse.json({ reply: null, handoff: true, limited: true });
      }
    }
    const { text: raw, model } = await askAI(systemPrompt(clip(b.name, 40)), cleanHistory(b.history, message), 900);
    const parsed = parseAiReply(raw.replace(/[*#`]/g, ""));
    const text = parsed.text.slice(0, 1200);
    await log(text, parsed.handoff ? "none" : "ai", parsed.handoff ? "handoff" : model);
    return NextResponse.json({ reply: text, ai: true, handoff: parsed.handoff, chips: parsed.chips });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI failed";
    console.error("chat ai error:", msg);
    await log(`AI error: ${msg}`.slice(0, 300), "none", "ai-error");
    return NextResponse.json({ reply: null, handoff: true, error: true });
  }
}
