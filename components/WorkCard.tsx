import { WorkItem } from "@/lib/site";
import { ArrowUpRightIcon } from "./Icons";

export default function WorkCard({ item }: { item: WorkItem }) {
  const external = item.href.startsWith("http");
  const Wrapper = external ? "a" : "div";
  const wrapperProps = external
    ? { href: item.href, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className="group block rounded-3xl border border-line bg-cloud p-7 md:p-9 hover:border-flare-300 hover:shadow-soft transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-sm font-semibold text-flare-500/50">
            {item.idx}
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-flare-600 bg-flare-50 px-3 py-1.5 rounded-full">
            {item.category}
          </span>
        </div>
        {external && (
          <ArrowUpRightIcon className="w-5 h-5 text-muted group-hover:text-flare-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
        )}
      </div>
      <h3 className="font-display text-2xl md:text-[26px] font-semibold mt-5 text-balance">
        {item.title}
      </h3>
      <p className="text-sm text-muted mt-2">{item.meta}</p>
      <p className="text-[15px] text-ink/70 leading-relaxed mt-4">{item.summary}</p>
      {item.year && <p className="text-xs text-muted mt-6">{item.year}</p>}
    </Wrapper>
  );
}
