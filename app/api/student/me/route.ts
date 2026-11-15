import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import Registration from "@/models/Registration";
import { currentStudentId } from "@/lib/studentAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  const id = currentStudentId();
  if (!id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const s = await Student.findById(id).lean();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const regs = await Registration.find({ email: s.email }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({
    student: { fullName: s.fullName || regs[0]?.fullName || "", email: s.email, phone: s.phone || regs[0]?.phone || "", mustChangePassword: s.mustChangePassword },
    registrations: regs.map((r) => ({
      id: String(r._id), ref: r.ref, courseTitle: r.courseTitle, mode: r.mode, fee: r.fee, status: r.status,
      preferredStart: r.preferredStart || "", startDate: r.startDate || "", adminNote: r.adminNote || "",
      location: r.location || "", createdAt: (r as unknown as { createdAt?: Date }).createdAt || null,
    })),
  });
}
