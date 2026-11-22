import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatLog from "@/models/ChatLog";
import { systemPrompt } from "@/lib/chatKnowledge";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Turn = { role: "user" | "assistant"; content: string };
const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

const aiReady = () => Boolean(process.env.AI_PROVIDER && process.env.AI_API_KEY);

function startOfDay() { const d = new Date(); d.setUTCHours(0, 0, 0, 0); return d; }

// alternate user / assistant turns, starting with the user
function cleanHistory(history: unknown, message: string): Turn[] {
  const raw = Array.isArray(history) ? history : [];
  const turns: Turn[] = [];
  for (const h of raw.slice(-8)) {
    const role = h?.role === "assistant" ? "assistant" : "user";
    const content = clip(h?.content, 500);
    if (!content) continue;
    if (turns.length && turns[turns.length - 1].role === role) turns[turns.length - 1].content += `\n${content}`;
    else turns.push({ role, content });
  }
  if (turns.length && turns[turns.length - 1].role === "user") turns.pop(); // the new message replaces it
  while (turns.length && turns[0].role !== "user") turns.shift();
  turns.push({ role: "user", content: message });
  return turns;
}

async function askAI(turns: Turn[]): Promise<string> {
  const provider = process.env.AI_PROVIDER;
  const key = process.env.AI_API_KEY as string;
  const system = systemPrompt();
  const signal = AbortSignal.timeout(20000);

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.AI_MODEL || "claude-haiku-5-5", max_tokens: 300, system, messages: turns }),
      signal,
    });
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const j = await res.json();
    return String(j?.content?.[0]?.text || "");
  }

  if (provider === "gemini") {
    const model = process.env.AI_MODEL || "gemini-2.5-flash";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: turns.map((t) => ({ role: t.role === "assistant" ? "model" : "user", parts: [{ text: t.content }] })),
        generationConfig: { maxOutputTokens: 300, temperature: 0.3 },
      }),
      signal,
    });
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const j = await res.json();
    return String(j?.candidates?.[0]?.content?.parts?.[0]?.text || "");
  }
  throw new Error("Unknown AI_PROVIDER");
}

export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const message = clip(b.message, 500);
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

  // unknown question: AI helps if it is set up, otherwise hand over to the team
  let db = false;
  try { await connectDB(); db = true; } catch {}

  const log = async (answer: string, source: "ai" | "none") => {
    if (!db) return;
    try { await ChatLog.create({ sid, question: message, answer, source, intent: "unknown" }); } catch {}
  };

  if (!aiReady() || !db) {
    await log("", "none");
    return NextResponse.json({ reply: null, handoff: true });
  }

  try {
    const [mine, today] = await Promise.all([
      ChatLog.countDocuments({ sid, source: "ai", createdAt: { $gte: startOfDay() } }),
      ChatLog.countDocuments({ source: "ai", createdAt: { $gte: startOfDay() } }),
    ]);
    if (mine >= Number(process.env.CHAT_SESSION_LIMIT || 15) || today >= Number(process.env.CHAT_DAILY_LIMIT || 300)) {
      await log("", "none");
      return NextResponse.json({ reply: null, handoff: true, limited: true });
    }
    const text = (await askAI(cleanHistory(b.history, message))).replace(/[*_#`]/g, "").trim().slice(0, 700);
    if (!text) throw new Error("empty");
    await log(text, "ai");
    return NextResponse.json({ reply: text, ai: true });
  } catch (e) {
    console.error("chat ai error", e);
    await log("", "none");
    return NextResponse.json({ reply: null, handoff: true });
  }
}
