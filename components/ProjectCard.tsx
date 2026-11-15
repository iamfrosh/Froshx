"use client";

import { useState } from "react";
import type { PublicProject } from "@/lib/projects";
import { ArrowUpRightIcon } from "./Icons";

export const hostOf = (url: string) => {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; }
};

// A "link preview" card: browser frame + screenshot of the site + details.
export default function ProjectCard({ project, index }: { project: Pick<PublicProject, "title" | "url" | "type" | "tech" | "description" | "image">; index?: number }) {
  const [failed, setFailed] = useState(false);
  const host = hostOf(project.url);
  const live = Boolean(project.url);
  const tech = project.tech.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 4);
  const showImage = project.image && !failed;

  const Shot = (
    <div className="overflow-hidden rounded-t-[22px] border-b border-line bg-ink">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ml-2 min-w-0 flex-1 truncate rounded-md bg-white/10 px-3 py-1 text-[11px] text-white/70">{host || "coming soon"}</span>
      </div>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-cloud">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.image}
            alt={`Preview of ${project.title}`}
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-flare-50 via-white to-flare-100">
            <span className="font-display text-7xl font-semibold text-flare-500/40">{project.title.charAt(0)}</span>
            <span className="mt-2 text-xs font-medium text-muted">{host || "Preview coming soon"}</span>
          </div>
        )}
        {live && (
          <span className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/55 via-transparent to-transparent pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg">
              Visit live site <ArrowUpRightIcon className="h-4 w-4" />
            </span>
          </span>
        )}
      </div>
    </div>
  );

  const Body = (
    <div className="p-6">
      <div className="flex flex-wrap items-center gap-2">
        {index !== undefined && <span className="font-display text-sm font-semibold text-flare-500/60">{String(index + 1).padStart(2, "0")}</span>}
        {project.type && <span className="rounded-full bg-flare-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-flare-600">{project.type}</span>}
      </div>
      <h3 className="font-display mt-4 text-xl font-semibold sm:text-2xl">{project.title}</h3>
      {project.description && <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-ink/70">{project.description}</p>}
      {tech.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {tech.map((t) => <li key={t} className="rounded-lg border border-line bg-cloud px-2.5 py-1 text-xs font-medium text-muted">{t}</li>)}
        </ul>
      )}
      {live && <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-flare-600 group-hover:underline">View project <ArrowUpRightIcon className="h-4 w-4" /></p>}
    </div>
  );

  const cls = "group block overflow-hidden rounded-3xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-flare-300 hover:shadow-soft";
  return live ? (
    <a href={project.url} target="_blank" rel="noopener noreferrer" className={cls}>{Shot}{Body}</a>
  ) : (
    <div className={cls}>{Shot}{Body}</div>
  );
}
