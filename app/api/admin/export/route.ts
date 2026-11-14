import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import Registration from "@/models/Registration";

export const dynamic = "force-dynamic";

const esc = (v: unknown) => {
  let s = v === undefined || v === null ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const rows = await Registration.find().sort({ createdAt: -1 }).lean();
  const head = ["Reference", "Date", "Name", "Email", "Phone", "Course", "Mode", "Fee", "Status", "Gender", "Age range", "Location", "Education", "Device", "Experience", "Preferred start", "Goal", "Heard about us"];
  const lines = [head.map(esc).join(",")];
  for (const r of rows) {
    lines.push(
      [r.ref, ((r as unknown as { createdAt?: Date }).createdAt ?? new Date(0)).toISOString(), r.fullName, r.email, r.phone, r.courseTitle, r.mode, r.fee, r.status, r.gender, r.ageRange, r.location, r.education, r.device, r.experience, r.preferredStart, r.goal, r.source]
        .map(esc)
        .join(",")
    );
  }
  return new NextResponse("\uFEFF" + lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="froshx-academy-registrations.csv"`,
    },
  });
}
