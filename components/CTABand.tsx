import Link from "next/link";
import { ArrowUpRightIcon } from "./Icons";

export default function CTABand({
  title = "Have a project in mind?",
  subtitle = "Tell us what you're building — we'll reply within one working day.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div
        aria-hidden
        className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-flare-gradient opacity-20 blur-3xl"
      />
      <div className="wrap py-20 md:py-24 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-white text-balance">
              {title}
            </h2>
            <p className="mt-3 text-white/60 text-base md:text-lg">{subtitle}</p>
          </div>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 shrink-0 rounded-full bg-white text-ink font-semibold text-base px-7 py-4 hover:bg-flare-500 hover:text-white transition-colors"
          >
            Start a project
            <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
