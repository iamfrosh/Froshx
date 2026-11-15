import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const p = await Project.findById(params.id).select("+imageData imageType hasUpload");
    if (!p || !p.hasUpload || !p.imageData) return new NextResponse("Not found", { status: 404 });
    const buf = p.imageData as unknown as Buffer;
    return new NextResponse(new Uint8Array(buf), {
      headers: { "Content-Type": p.imageType || "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
