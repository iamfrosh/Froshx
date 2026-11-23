import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import ChatEnquiry from "@/models/ChatEnquiry";
import { mailReady, sendMail, withTimeout } from "@/lib/mailer";
import { firstName, messageEmail } from "@/lib/emailTemplates";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Send your answer to the visitor by email (professional FroshX design) and mark the enquiry answered.
export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!mailReady()) return NextResponse.json({ error: "Email isn't set up yet. Add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel and redeploy." }, { status: 500 });
  const b = (await req.json().catch(() => ({}))) as { id?: string; subject?: string; message?: string };
  const message = (b.message || "").trim().slice(0, 5000);
  const subject = (b.subject || "").trim().slice(0, 150) || "Reply from FroshX";
  if (!b.id || !message) return NextResponse.json({ error: "Write your reply first." }, { status: 400 });

  try {
    await connectDB();
    const e = await ChatEnquiry.findById(b.id);
    if (!e) return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
    const full = `${message}\n\nYour question was:\n“${e.question}”`;
    const m = messageEmail({ subject, message: full, vars: { name: firstName(e.name || ""), fullName: e.name || "", course: "", ref: "" } });
    await withTimeout(sendMail({ to: e.email, ...m }), 15000);
    e.replies.push({ subject, text: message, at: new Date() });
    e.status = "answered";
    await e.save();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("chat reply failed", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not send the reply." }, { status: 500 });
  }
}
