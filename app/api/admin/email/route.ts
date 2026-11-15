import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import Registration from "@/models/Registration";
import Draft from "@/models/Draft";
import { brandEmail, mailReady, sendMail, withTimeout } from "@/lib/mailer";
import { dashboardInviteEmail, firstName, messageEmail, registrationEmail } from "@/lib/emailTemplates";
import { dashboardUrl, ensureStudent } from "@/lib/student";
import { SITE } from "@/lib/site";
import { getCourse } from "@/lib/academy";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Body = {
  mode?: "bulk" | "test" | "resend" | "dashboard";
  target?: "registrations" | "drafts";
  ids?: string[];
  id?: string;
  subject?: string;
  message?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

const MAX_PER_REQUEST = 25;

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!mailReady()) {
    return NextResponse.json({ error: "Email is not set up. Add GMAIL_USER and GMAIL_APP_PASSWORD in Vercel, then redeploy." }, { status: 500 });
  }
  const b = (await req.json().catch(() => ({}))) as Body;

  try {
    await connectDB();

    // ---- resend the registration confirmation
    if (b.mode === "resend") {
      const r = await Registration.findById(b.id).lean();
      if (!r) return NextResponse.json({ error: "Registration not found." }, { status: 404 });
      const start = r.preferredStart || "To be agreed";
      const info = await ensureStudent(r.email, r.fullName, r.phone);
      const m = registrationEmail({ fullName: r.fullName, ref: r.ref, courseTitle: r.courseTitle, mode: r.mode, fee: r.fee, start, dashboard: { url: dashboardUrl(SITE.url), email: info.email, password: info.password } });
      await withTimeout(sendMail({ to: r.email, ...m }), 12000);
      await Registration.updateOne({ _id: r._id }, { emailStatus: "sent" });
      return NextResponse.json({ ok: true, sent: 1, failed: [] });
    }

    // ---- dashboard invitations (one email per person, even if they registered for several courses)
    if (b.mode === "dashboard") {
      const ids = Array.isArray(b.ids) ? b.ids.slice(0, MAX_PER_REQUEST) : [];
      if (!ids.length) return NextResponse.json({ error: "No recipients." }, { status: 400 });
      const docs = await Registration.find({ _id: { $in: ids } }).lean();
      const seen = new Set<string>();
      const people = docs.filter((r) => (seen.has(r.email) ? false : (seen.add(r.email), true)));
      const failed: { email: string; error: string }[] = [];
      let sent = 0;
      for (let i = 0; i < people.length; i += 3) {
        const chunk = people.slice(i, i + 3);
        const results = await Promise.allSettled(
          chunk.map(async (r) => {
            const info = await ensureStudent(r.email, r.fullName, r.phone);
            const m = dashboardInviteEmail({ fullName: r.fullName, info: { url: dashboardUrl(SITE.url), email: info.email, password: info.password } });
            return withTimeout(sendMail({ to: r.email, ...m }), 15000);
          })
        );
        results.forEach((res, k) => {
          if (res.status === "fulfilled") sent++;
          else failed.push({ email: chunk[k].email, error: res.reason instanceof Error ? res.reason.message : "Failed" });
        });
      }
      return NextResponse.json({ ok: true, sent, failed });
    }

    const subject = (b.subject || "").trim().slice(0, 150);
    const message = (b.message || "").trim().slice(0, 6000);
    if (!subject || !message) return NextResponse.json({ error: "Add a subject and a message." }, { status: 400 });

    // ---- test email to the brand inbox
    if (b.mode === "test") {
      const m = messageEmail({ subject, message, ctaLabel: b.ctaLabel, ctaUrl: b.ctaUrl, vars: { name: "Amina", fullName: "Amina Yusuf", course: "Web Development", ref: "FXA-TEST01" } });
      await withTimeout(sendMail({ to: brandEmail(), ...m }), 12000);
      return NextResponse.json({ ok: true, sent: 1, failed: [], to: brandEmail() });
    }

    // ---- bulk (the admin page sends in batches)
    const ids = Array.isArray(b.ids) ? b.ids.slice(0, MAX_PER_REQUEST) : [];
    if (!ids.length) return NextResponse.json({ error: "No recipients." }, { status: 400 });

    type Person = { email: string; name: string; fullName: string; course: string; ref: string };
    let people: Person[] = [];
    if (b.target === "drafts") {
      const docs = await Draft.find({ _id: { $in: ids } }).lean();
      people = docs
        .filter((d) => d.email)
        .map((d) => ({ email: d.email as string, name: firstName(d.fullName || ""), fullName: d.fullName || "", course: getCourse(d.course || "")?.title || "your chosen course", ref: "" }));
    } else {
      const docs = await Registration.find({ _id: { $in: ids } }).lean();
      people = docs.map((r) => ({ email: r.email, name: firstName(r.fullName), fullName: r.fullName, course: r.courseTitle, ref: r.ref }));
    }

    const failed: { email: string; error: string }[] = [];
    let sent = 0;
    for (let i = 0; i < people.length; i += 4) {
      const chunk = people.slice(i, i + 4);
      const results = await Promise.allSettled(
        chunk.map((p) => {
          const m = messageEmail({ subject, message, ctaLabel: b.ctaLabel, ctaUrl: b.ctaUrl, vars: p });
          return withTimeout(sendMail({ to: p.email, ...m }), 15000);
        })
      );
      results.forEach((r, k) => {
        if (r.status === "fulfilled") sent++;
        else failed.push({ email: chunk[k].email, error: r.reason instanceof Error ? r.reason.message : "Failed" });
      });
    }
    return NextResponse.json({ ok: true, sent, failed });
  } catch (err) {
    console.error("admin email error", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not send." }, { status: 500 });
  }
}
