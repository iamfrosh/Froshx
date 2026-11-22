import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import ChatLog from "@/models/ChatLog";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const since = new Date(); since.setUTCHours(0, 0, 0, 0);
  const [logs, total, today, ai, unanswered] = await Promise.all([
    ChatLog.find().sort({ createdAt: -1 }).limit(300).lean(),
    ChatLog.countDocuments(),
    ChatLog.countDocuments({ createdAt: { $gte: since } }),
    ChatLog.countDocuments({ source: "ai", createdAt: { $gte: since } }),
    ChatLog.countDocuments({ source: "none" }),
  ]);
  return NextResponse.json({
    aiReady: Boolean(process.env.AI_PROVIDER && process.env.AI_API_KEY),
    provider: process.env.AI_PROVIDER || "",
    stats: { total, today, aiToday: ai, unanswered },
    logs: logs.map((l) => ({ id: String(l._id), question: l.question, answer: l.answer, source: l.source, intent: l.intent, at: l.createdAt })),
  });
}
