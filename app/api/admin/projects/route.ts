import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import Project from "@/models/Project";
import { toPublic } from "@/lib/projects";
import { WORK_ITEMS } from "@/lib/site";

export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 1_500_000;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function refresh() {
  revalidatePath("/");
  revalidatePath("/work");
}

function parseImage(dataUrl: unknown): { buf: Buffer; type: string } | null {
  if (typeof dataUrl !== "string") return null;
  const m = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!m) return null;
  const buf = Buffer.from(m[2], "base64");
  return buf.length > 0 && buf.length <= MAX_IMAGE_BYTES ? { buf, type: m[1] } : null;
}

function fields(b: Record<string, unknown>) {
  let url = str(b.url, 500);
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  return {
    title: str(b.title, 120), url, type: str(b.type, 60), tech: str(b.tech, 120), description: str(b.description, 400),
    imageUrl: /^https?:\/\//i.test(str(b.imageUrl, 700)) ? str(b.imageUrl, 700) : "",
    featured: b.featured !== false, published: b.published !== false,
  };
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const docs = await Project.find().sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json({ projects: docs.map((d) => ({ ...toPublic(d as never), imageUrl: d.imageUrl || "", hasUpload: !!d.hasUpload })) });
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  await connectDB();

  // one-time import of the projects already listed on the site
  if (b.seed === true) {
    if (await Project.countDocuments()) return NextResponse.json({ error: "Projects already exist." }, { status: 400 });
    await Project.insertMany(
      WORK_ITEMS.map((w, i) => ({
        title: w.title, url: w.href.startsWith("http") ? w.href : "", type: w.category, tech: w.meta || "", description: w.summary,
        order: i, featured: i < 4, published: true,
      }))
    );
    refresh();
    return NextResponse.json({ ok: true });
  }

  const f = fields(b);
  if (!f.title) return NextResponse.json({ error: "Add a project title." }, { status: 400 });
  const last = await Project.findOne().sort({ order: -1 }).select("order").lean();
  const img = parseImage(b.imageDataUrl);
  const doc = await Project.create({
    ...f, order: (last?.order ?? -1) + 1,
    ...(img ? { hasUpload: true, imageData: img.buf, imageType: img.type } : {}),
  });
  refresh();
  return NextResponse.json({ ok: true, id: String(doc._id) });
}

export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const id = str(b.id, 40);
  const f = fields(b);
  if (!id || !f.title) return NextResponse.json({ error: "Add a project title." }, { status: 400 });
  await connectDB();

  const update: Record<string, unknown> = { ...f };
  const img = parseImage(b.imageDataUrl);
  if (img) Object.assign(update, { hasUpload: true, imageData: img.buf, imageType: img.type });
  else if (b.removeUpload === true) Object.assign(update, { hasUpload: false, imageData: null, imageType: "" });
  await Project.findByIdAndUpdate(id, update);
  refresh();
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, dir } = (await req.json().catch(() => ({}))) as { id?: string; dir?: "up" | "down" };
  if (!id || (dir !== "up" && dir !== "down")) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await connectDB();
  const all = await Project.find().sort({ order: 1, createdAt: 1 }).select("_id").lean();
  const i = all.findIndex((p) => String(p._id) === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= all.length) return NextResponse.json({ ok: true });
  [all[i], all[j]] = [all[j], all[i]];
  await Promise.all(all.map((p, idx) => Project.updateOne({ _id: p._id }, { order: idx })));
  refresh();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (!id) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await connectDB();
  await Project.findByIdAndDelete(id);
  refresh();
  return NextResponse.json({ ok: true });
}
