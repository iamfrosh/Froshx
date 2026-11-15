import { connectDB } from "./mongodb";
import Student from "@/models/Student";
import Registration from "@/models/Registration";
import { hashPassword } from "./studentAuth";

// The shared starting password every new student receives. Students are asked to change it on first login.
// Override on Vercel with STUDENT_DEFAULT_PASSWORD if you want a different one.
export const defaultPassword = () => process.env.STUDENT_DEFAULT_PASSWORD || "1234556789";

export type DashboardInfo = { email: string; password: string | null; created: boolean };

// Make sure a dashboard account exists for this email. password is only returned while the account still uses the default.
export async function ensureStudent(email: string, fullName: string, phone: string): Promise<DashboardInfo> {
  await connectDB();
  const e = email.toLowerCase().trim();
  const existing = await Student.findOne({ email: e });
  if (existing) {
    return { email: e, password: existing.mustChangePassword ? defaultPassword() : null, created: false };
  }
  try {
    await Student.create({ email: e, fullName, phone, passwordHash: hashPassword(defaultPassword()), mustChangePassword: true });
    return { email: e, password: defaultPassword(), created: true };
  } catch {
    // another request created it at the same moment
    const again = await Student.findOne({ email: e });
    return { email: e, password: again?.mustChangePassword ? defaultPassword() : null, created: false };
  }
}

export async function createMissingStudents() {
  await connectDB();
  const regs = await Registration.find({}, { email: 1, fullName: 1, phone: 1 }).lean();
  const seen = new Set<string>();
  let created = 0;
  for (const r of regs) {
    const e = r.email.toLowerCase();
    if (seen.has(e)) continue;
    seen.add(e);
    const info = await ensureStudent(e, r.fullName, r.phone);
    if (info.created) created++;
  }
  return { created, total: seen.size };
}

export const dashboardUrl = (base: string) => `${base}/dashboard/login`;
