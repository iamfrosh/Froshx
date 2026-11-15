import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Draft from "@/models/Draft";
import { feeFor, getCourse, Mode } from "@/lib/academy";
import { brandEmail, mailReady, sendMail, withTimeout } from "@/lib/mailer";
import { newRegistrationAlert, registrationEmail } from "@/lib/emailTemplates";
import { dashboardUrl, ensureStudent } from "@/lib/student";
import { SITE } from "@/lib/site";
import { validateAll, cleanPhone, RegistrationInput } from "@/lib/validate";

function makeRef() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `FXA-${s}`;
}

export const maxDuration = 30;

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field
  if (str(body.website)) return NextResponse.json({ ok: true, ref: "FXA-000000" });

  const input: RegistrationInput = {
    course: str(body.course, 60),
    mode: str(body.mode, 20),
    fullName: str(body.fullName, 120),
    email: str(body.email, 160).toLowerCase(),
    phone: cleanPhone(str(body.phone, 30)),
    gender: str(body.gender, 30),
    ageRange: str(body.ageRange, 30),
    location: str(body.location, 120),
    education: str(body.education, 60),
    device: str(body.device, 80),
    experience: str(body.experience, 60),
    startAsap: body.startAsap === true,
    preferredStart: str(body.preferredStart, 20),
    goal: str(body.goal, 600),
    source: str(body.source, 60),
    committed: body.committed === true,
    consent: body.consent === true,
  };

  const errors = validateAll(input);
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: "Please check your details and try again.", errors }, { status: 422 });
  }

  const course = getCourse(input.course)!;
  const mode = input.mode as Mode;
  const fee = feeFor(input.course, mode);

  try {
    await connectDB();

    const exists = await Registration.findOne({ email: input.email, course: input.course }).lean();
    if (exists) {
      return NextResponse.json(
        { error: `This email is already registered for ${course.title}. Reference: ${exists.ref}. Message us on WhatsApp if you need help.`, ref: exists.ref },
        { status: 409 }
      );
    }

    let ref = makeRef();
    for (let i = 0; i < 5 && (await Registration.exists({ ref })); i++) ref = makeRef();

    await Registration.create({
      ref,
      course: input.course,
      courseTitle: course.title,
      mode,
      fee,
      committed: input.committed,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      gender: input.gender,
      ageRange: input.ageRange,
      location: input.location,
      education: input.education,
      device: input.device,
      experience: input.experience,
      startAsap: input.startAsap,
      preferredStart: input.startAsap ? "As soon as possible" : input.preferredStart,
      goal: input.goal,
      source: input.source,
      consent: input.consent,
    });

    // Registration complete: remove any unfinished draft for this person
    const draftId = str(body.draftId, 80);
    await Draft.deleteMany({ $or: [{ draftId }, { email: input.email }] });

    // Confirmation email to the student + alert to FroshX. A failed email never blocks the registration.
    const start = input.startAsap ? "As soon as possible" : input.preferredStart
      ? new Date(input.preferredStart + "T00:00:00").toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })
      : "To be agreed";
    let dashboard: { email: string; password: string | null } | null = null;
    try {
      const info = await ensureStudent(input.email, input.fullName, input.phone);
      dashboard = { email: info.email, password: info.password };
    } catch (e) {
      console.error("student account failed", e);
    }
    const data = {
      fullName: input.fullName, ref, courseTitle: course.title, mode, fee, start,
      dashboard: dashboard ? { url: dashboardUrl(SITE.url), email: dashboard.email, password: dashboard.password } : undefined,
    };
    let emailStatus: "sent" | "failed" = "failed";
    if (mailReady()) {
      try {
        const m = registrationEmail(data);
        await withTimeout(sendMail({ to: input.email, ...m }), 12000);
        emailStatus = "sent";
      } catch (e) {
        console.error("confirmation email failed", e);
      }
      try {
        const a = newRegistrationAlert({ ...data, email: input.email, phone: input.phone, location: input.location });
        await withTimeout(sendMail({ to: brandEmail(), ...a }), 8000);
      } catch (e) {
        console.error("admin alert email failed", e);
      }
    }
    await Registration.updateOne({ ref }, { emailStatus });

    return NextResponse.json({ ok: true, ref, fee, mode, courseTitle: course.title, emailed: emailStatus === "sent", dashboard });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "We couldn’t save your registration right now. Please try again or message us on WhatsApp." }, { status: 500 });
  }
}
