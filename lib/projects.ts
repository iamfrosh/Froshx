import { connectDB } from "./mongodb";
import Project from "@/models/Project";
import { WORK_ITEMS } from "./site";
import { screenshotUrl } from "./links";

export type PublicProject = {
  id: string;
  title: string;
  url: string;
  type: string;
  tech: string;
  description: string;
  image: string;
  featured: boolean;
  order: number;
  published: boolean;
};

export { screenshotUrl };

type Doc = { _id: unknown; title: string; url?: string; type?: string; tech?: string; description?: string; imageUrl?: string; hasUpload?: boolean; order?: number; featured?: boolean; published?: boolean; updatedAt?: Date };

export function toPublic(d: Doc): PublicProject {
  const id = String(d._id);
  const image = d.hasUpload ? `/api/projects/${id}/image?v=${d.updatedAt ? new Date(d.updatedAt).getTime() : 0}` : d.imageUrl || screenshotUrl(d.url || "");
  return {
    id, title: d.title, url: d.url || "", type: d.type || "", tech: d.tech || "", description: d.description || "",
    image, featured: d.featured !== false, order: d.order ?? 0, published: d.published !== false,
  };
}

// Used by the public pages. Falls back to the built-in list if the database is empty or unreachable.
export async function getProjects(): Promise<PublicProject[]> {
  try {
    await connectDB();
    const docs = await Project.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
    if (docs.length) return docs.map((d) => toPublic(d as unknown as Doc));
  } catch (e) {
    console.error("getProjects fallback", e);
  }
  return WORK_ITEMS.map((w, i) => ({
    id: w.slug, title: w.title, url: w.href.startsWith("http") ? w.href : "", type: w.category, tech: w.meta || "",
    description: w.summary, image: w.href.startsWith("http") ? screenshotUrl(w.href) : "", featured: i < 4, order: i, published: true,
  }));
}
