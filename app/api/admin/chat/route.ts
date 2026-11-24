import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import ChatLog from "@/models/ChatLog";
import ChatEnquiry from "@/models/ChatEnquiry";
import { aiConfig } from "@/lib/aiConfig";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();

  // tiny summary used by the "Chat inbox" shortcut on admin pages
  if (new URL(req.url).searchParams.get("summary")) {
    return NextResponse.json({ open: await ChatEnquiry.countDocuments({ status: "open" }) });
  }

  const since = new Date(); since.setUTCHours(0, 0, 0, 0);
  const [enquiries, logs, total, today, ai, unanswered, open, lastErr] = await Promise.all([
    ChatEnquiry.find().sort({ status: -1, createdAt: -1 }).limit(200).lean(), // "open" sorts after "answered", so re-sort below
    ChatLog.find().sort({ createdAt: -1 }).limit(250).lean(),
    ChatLog.countDocuments(),
    ChatLog.countDocuments({ createdAt: { $gte: since } }),
    ChatLog.countDocuments({ source: "ai", createdAt: { $gte: since } }),
    ChatLog.countDocuments({ source: "none" }),
    ChatEnquiry.countDocuments({ status: "open" }),
    ChatLog.findOne({ intent: "ai-error" }).sort({ createdAt: -1 }).lean(),
  ]);
  const list = enquiries
    .map((e) => ({
      id: String(e._id), email: e.email, name: e.name || "", phone: e.phone || "", question: e.question, status: e.status,
      transcript: (e.transcript || []).map((t) => ({ from: t.from, text: t.text })),
      replies: (e.replies || []).map((r) => ({ subject: r.subject, text: r.text, at: r.at })),
      at: (e as unknown as { createdAt?: Date }).createdAt,
    }))
    .sort((a, b) => (a.status === b.status ? new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime() : a.status === "open" ? -1 : 1));
  return NextResponse.json({
    aiReady: aiConfig().ready,
    provider: aiConfig().provider,
    lastAiError: lastErr ? { text: lastErr.answer || "", at: lastErr.createdAt } : null,
    stats: { total, today, aiToday: ai, unanswered, open },
    enquiries: list,
    logs: logs.map((l) => ({ id: String(l._id), question: l.question, answer: l.answer, source: l.source, intent: l.intent, at: l.createdAt })),
  });
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status } = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!id || !["open", "answered"].includes(status || "")) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await connectDB();
  await ChatEnquiry.findByIdAndUpdate(id, { status });
  return NextResponse.json({ ok: true });
}
