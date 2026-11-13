import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Draft from "@/models/Draft";
import { cleanPhone } from "@/lib/validate";

const str = (v: unknown, max = 160) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Saves progress of an unfinished registration so the team can follow up.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const draftId = str(body.draftId, 80);
    const email = str(body.email).toLowerCase();
    const phone = cleanPhone(str(body.phone, 30));
    if (!draftId || (!email && !phone)) return NextResponse.json({ ok: true });

    await connectDB();
    await Draft.findOneAndUpdate(
      { draftId },
      {
        draftId,
        course: str(body.course, 60),
        mode: str(body.mode, 20),
        fullName: str(body.fullName, 120),
        email,
        phone,
        step: Number(body.step) || 1,
        updatedAt: new Date(),
      },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("draft error", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
