import { TESTIMONIALS } from "@/lib/site";

export default function Testimonial() {
  const t = TESTIMONIALS[0];
  if (!t) return null;

  return (
    <section className="py-20 md:py-24 bg-cloud border-y border-line">
      <div className="wrap max-w-3xl">
        <p className="text-4xl md:text-5xl font-display text-flare-300 leading-none mb-2">
          &ldquo;
        </p>
        <blockquote className="font-display text-2xl md:text-3xl font-medium text-ink leading-snug text-balance">
          {t.quote}
        </blockquote>
        <p className="mt-6 text-sm text-muted">
          <span className="font-semibold text-ink">{t.name}</span> — {t.role}
        </p>
      </div>
    </section>
  );
}
