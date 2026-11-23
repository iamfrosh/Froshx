import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatEnquiry from "@/models/ChatEnquiry";
import { brandEmail, mailReady, sendMail, withTimeout } from "@/lib/mailer";
import { messageEmail } from "@/lib/emailTemplates";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// A visitor leaves their email so the team can answer a question the assistant couldn't.
export async function POST(req: Request) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  if (clip(b.website, 50)) return NextResponse.json({ ok: true }); // spam trap
  const email = clip(b.email, 160).toLowerCase();
  const question = clip(b.question, 800);
  const sid = clip(b.sid, 64);
  if (!emailRe.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 422 });
  if (question.length < 3) return NextResponse.json({ error: "Please write your question." }, { status: 422 });

  const transcript = (Array.isArray(b.history) ? b.history : []).slice(-8).map((h: { role?: string; content?: string }) => ({
    from: h?.role === "assistant" ? "bot" : "visitor",
    text: clip(h?.content, 400),
  })).filter((h) => h.text);

  try {
    await connectDB();
    const since = new Date(Date.now() - 24 * 3600 * 1000);
    if (sid && (await ChatEnquiry.countDocuments({ sid, createdAt: { $gte: since } })) >= 5) {
      return NextResponse.json({ error: "You've sent a few questions today. We'll reply to them soon." }, { status: 429 });
    }
    const name = clip(b.name, 80);
    const phone = clip(b.phone, 30).replace(/[^\d+]/g, "");
    await ChatEnquiry.create({ sid, email, name, phone, question, transcript });

    // tell the team (best effort; the enquiry is already saved)
    if (mailReady()) {
      try {
        const m = messageEmail({
          subject: `New chat enquiry from ${name || email}`,
          message: `${name || "A visitor"} (${email}${phone ? ", " + phone : ""}) asked:\n\n“${question}”\n\nOpen your inbox to reply.`,
          ctaLabel: "Open chat inbox",
          ctaUrl: `${SITE.url}/admin/chat`,
          vars: { name: "team", fullName: "FroshX team", course: "", ref: "" },
        });
        await withTimeout(sendMail({ to: brandEmail(), ...m }), 10000);
      } catch (e) {
        console.error("enquiry alert failed", e);
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("enquiry error", e);
    return NextResponse.json({ error: "We couldn't save that just now. Please message us on WhatsApp." }, { status: 500 });
  }
}
