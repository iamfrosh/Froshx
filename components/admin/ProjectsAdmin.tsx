"use client";

import { useCallback, useEffect, useState } from "react";
import ProjectCard, { hostOf } from "../ProjectCard";
import { screenshotUrl } from "@/lib/links";
import "../academy/academy.css";

type P = {
  id: string; title: string; url: string; type: string; tech: string; description: string; image: string;
  imageUrl: string; hasUpload: boolean; featured: boolean; published: boolean;
};
type Mode = "link" | "upload" | "shot";
type Form = { id: string; url: string; title: string; type: string; tech: string; description: string; imageUrl: string; featured: boolean; published: boolean; mode: Mode; upload: string; hadUpload: boolean };

const EMPTY: Form = { id: "", url: "", title: "", type: "", tech: "", description: "", imageUrl: "", featured: true, published: true, mode: "shot", upload: "", hadUpload: false };

// shrink a screenshot in the browser so it uploads quickly
async function toDataUrl(file: File): Promise<string> {
  const src = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("That file isn’t a readable image.")); i.src = src; });
  URL.revokeObjectURL(src);
  for (const [w, q] of [[1400, 0.82], [1200, 0.7], [1000, 0.6]] as const) {
    const scale = Math.min(1, w / img.width);
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const out = c.toDataURL("image/jpeg", q);
    if (out.length < 1_900_000) return out;
  }
  throw new Error("That image is too large. Try a smaller screenshot.");
}

export default function ProjectsAdmin() {
  const [list, setList] = useState<P[] | null>(null);
  const [f, setF] = useState<Form>(EMPTY);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/projects", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) { setErr(json.error || "Could not load projects."); return; }
    setList(json.projects);
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  const image =
    f.mode === "upload" ? f.upload || (f.hadUpload && f.id ? `/api/projects/${f.id}/image` : "")
    : f.mode === "link" ? f.imageUrl || screenshotUrl(f.url)
    : screenshotUrl(f.url);

  const fetchPreview = async () => {
    setErr(""); setNote("");
    if (!f.url.trim()) { setErr("Paste the project link first."); return; }
    setFetching(true);
    const res = await fetch("/api/admin/projects/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: f.url }) });
    const json = await res.json().catch(() => ({}));
    setFetching(false);
    if (!res.ok) { setErr(json.error || "Could not read that link. You can still fill the details by hand."); return; }
    setF((p) => ({
      ...p,
      url: json.url || p.url,
      title: p.title || json.title || "",
      description: p.description || json.description || "",
      imageUrl: json.image || "",
      mode: json.image ? "link" : "shot",
    }));
    setNote(json.image ? "Preview found. Check the card on the right." : "No preview image published by that site. We’ll use an automatic screenshot, or you can upload your own.");
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    setErr("");
    try { const d = await toDataUrl(file); setF((p) => ({ ...p, upload: d, mode: "upload" })); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not use that image."); }
  };

  const save = async () => {
    setErr(""); setNote("");
    if (!f.title.trim()) { setErr("Add a project title."); return; }
    setSaving(true);
    const body = {
      id: f.id, url: f.url, title: f.title, type: f.type, tech: f.tech, description: f.description,
      imageUrl: f.mode === "link" ? f.imageUrl : "",
      imageDataUrl: f.mode === "upload" && f.upload ? f.upload : undefined,
      removeUpload: f.mode !== "upload" && f.hadUpload,
      featured: f.featured, published: f.published,
    };
    const res = await fetch("/api/admin/projects", { method: f.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) { setErr(json.error || "Could not save."); return; }
    setNote(f.id ? "Project updated." : "Project added. It is now on your website.");
    setF(EMPTY);
    load();
  };

  const edit = (p: P) => {
    setErr(""); setNote("");
    setF({ id: p.id, url: p.url, title: p.title, type: p.type, tech: p.tech, description: p.description, imageUrl: p.imageUrl, featured: p.featured, published: p.published, mode: p.hasUpload ? "upload" : p.imageUrl ? "link" : "shot", upload: "", hadUpload: p.hasUpload });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggle = async (p: P, key: "published" | "featured") => {
    await fetch("/api/admin/projects", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, url: p.url, title: p.title, type: p.type, tech: p.tech, description: p.description, imageUrl: p.imageUrl, featured: key === "featured" ? !p.featured : p.featured, published: key === "published" ? !p.published : p.published }) });
    load();
  };
  const move = async (id: string, dir: "up" | "down") => { await fetch("/api/admin/projects", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, dir }) }); load(); };
  const remove = async (p: P) => {
    if (!window.confirm(`Delete “${p.title}”? This can’t be undone.`)) return;
    await fetch("/api/admin/projects", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id }) });
    if (f.id === p.id) setF(EMPTY);
    load();
  };
  const seed = async () => {
    const res = await fetch("/api/admin/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seed: true }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setErr(json.error || "Could not import."); else load();
  };

  return (
    <div className="mt-6 space-y-8">
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">{f.id ? "Edit project" : "Add a project"}</h2>
            <p className="mt-1 text-sm text-muted">Paste the link, press <b>Fetch preview</b>, then check the card on the right.</p>
          </div>

          <div>
            <label htmlFor="pu" className="mb-2 block text-sm font-medium">Project link</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input id="pu" className="ax-input" inputMode="url" placeholder="https://yourproject.vercel.app" value={f.url} onChange={(e) => set("url", e.target.value)} />
              <button type="button" onClick={fetchPreview} disabled={fetching} className="shrink-0 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-flare-600 disabled:opacity-60">{fetching ? "Reading…" : "Fetch preview"}</button>
            </div>
          </div>

          <div>
            <label htmlFor="pt" className="mb-2 block text-sm font-medium">Title</label>
            <input id="pt" className="ax-input" value={f.title} onChange={(e) => set("title", e.target.value)} maxLength={120} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pk" className="mb-2 block text-sm font-medium">Type</label>
              <input id="pk" className="ax-input" placeholder="E-commerce" value={f.type} onChange={(e) => set("type", e.target.value)} maxLength={60} />
            </div>
            <div>
              <label htmlFor="ph" className="mb-2 block text-sm font-medium">Tech (comma separated)</label>
              <input id="ph" className="ax-input" placeholder="React, Node.js" value={f.tech} onChange={(e) => set("tech", e.target.value)} maxLength={120} />
            </div>
          </div>
          <div>
            <label htmlFor="pd" className="mb-2 block text-sm font-medium">Short description</label>
            <textarea id="pd" rows={3} className="ax-input resize-none" value={f.description} onChange={(e) => set("description", e.target.value)} maxLength={400} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Preview image</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {([["link", "From the link"], ["shot", "Auto screenshot"], ["upload", "Upload my own"]] as const).map(([m, l]) => (
                <button key={m} type="button" onClick={() => set("mode", m)} aria-pressed={f.mode === m} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${f.mode === m ? "border-flare-500 bg-flare-50" : "border-line hover:border-flare-300"}`}>{l}</button>
              ))}
            </div>
            {f.mode === "upload" && (
              <div className="mt-3">
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => onFile(e.target.files?.[0])} className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
                <p className="mt-1.5 text-xs text-muted">Best: a full-page screenshot of the site. It is shrunk automatically.</p>
              </div>
            )}
            {f.mode === "link" && <p className="mt-2 text-xs text-muted">Uses the preview image the site publishes for sharing. Press Fetch preview to load it.</p>}
            {f.mode === "shot" && <p className="mt-2 text-xs text-muted">A screenshot is taken automatically from the link (free WordPress mShots service). It can take a minute the first time. For the sharpest result, upload your own.</p>}
          </div>

          <div className="flex flex-wrap gap-5 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-[#F97316]" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} /> Show on homepage</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-[#F97316]" checked={f.published} onChange={(e) => set("published", e.target.checked)} /> Visible on website</label>
          </div>

          {err && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
          {note && <p role="status" className="rounded-xl bg-cloud px-4 py-3 text-sm">{note}</p>}

          <div className="flex gap-3">
            <button type="button" onClick={save} disabled={saving} className="flex-1 rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-white hover:bg-flare-600 disabled:opacity-60">{saving ? "Saving…" : f.id ? "Save changes" : "Add project"}</button>
            {f.id && <button type="button" onClick={() => setF(EMPTY)} className="rounded-full border border-line px-5 py-3.5 text-sm font-semibold hover:border-ink">Cancel</button>}
          </div>
        </div>

        <div className="lg:sticky lg:top-24">
          <p className="mb-2 text-sm font-medium">How it will look on your website</p>
          <ProjectCard key={image + f.title} project={{ title: f.title || "Project title", url: f.url, type: f.type, tech: f.tech, description: f.description || "Your short description appears here.", image }} />
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">Your projects {list ? `(${list.length})` : ""}</h2>
          {list && list.length === 0 && <button onClick={seed} className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold hover:border-ink">Import my current projects</button>}
        </div>
        {!list && <p className="mt-4 text-sm text-muted">Loading…</p>}
        {list && list.length === 0 && <p className="mt-4 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">No projects yet. Until you add one, your website shows its built-in list.</p>}
        <ul className="mt-4 space-y-3">
          {list?.map((p, i) => (
            <li key={p.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-3 sm:p-4">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-cloud">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" className="h-full w-full object-cover object-top" loading="lazy" />
                ) : <span className="flex h-full items-center justify-center font-display text-2xl text-flare-500/40">{p.title.charAt(0)}</span>}
              </div>
              <div className="min-w-[160px] flex-1">
                <p className="font-semibold">{p.title}</p>
                <p className="text-[13px] text-muted">{hostOf(p.url) || "No link"} · {p.type || "No type"}</p>
                <p className="mt-1 flex gap-2 text-[11px] font-bold uppercase tracking-wide">
                  {!p.published && <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-700">Hidden</span>}
                  {p.featured && <span className="rounded-full bg-flare-50 px-2 py-0.5 text-flare-700">Homepage</span>}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <button onClick={() => move(p.id, "up")} disabled={i === 0} aria-label="Move up" className="h-9 w-9 rounded-full border border-line hover:border-ink disabled:opacity-30">↑</button>
                <button onClick={() => move(p.id, "down")} disabled={i === list.length - 1} aria-label="Move down" className="h-9 w-9 rounded-full border border-line hover:border-ink disabled:opacity-30">↓</button>
                <button onClick={() => toggle(p, "featured")} className="rounded-full border border-line px-3.5 py-2 font-semibold hover:border-ink">{p.featured ? "Remove from home" : "Show on home"}</button>
                <button onClick={() => toggle(p, "published")} className="rounded-full border border-line px-3.5 py-2 font-semibold hover:border-ink">{p.published ? "Hide" : "Show"}</button>
                <button onClick={() => edit(p)} className="rounded-full bg-ink px-4 py-2 font-semibold text-white hover:bg-flare-600">Edit</button>
                <button onClick={() => remove(p)} className="rounded-full border border-red-200 px-3.5 py-2 font-semibold text-red-600 hover:bg-red-50">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
