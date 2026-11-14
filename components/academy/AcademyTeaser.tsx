import Link from "next/link";
import { SITE } from "@/lib/site";
import { ACADEMY, COURSES, MIN_FEES, naira } from "@/lib/academy";
import { WhatsAppIcon, ArrowUpRightIcon, CheckIcon } from "../Icons";
import { CertificateIcon, ClockIcon, COURSE_ICONS, MapPinIcon, TargetIcon, WifiIcon, CalendarIcon } from "./AcademyIcons";
import Reveal from "./Reveal";
import QuoteSlider from "./QuoteSlider";
import "./academy.css";

export default function AcademyTeaser() {
  const ask = `${SITE.whatsapp}?text=${encodeURIComponent("Hello FroshX Academy, I want to ask a question about the courses.")}`;

  return (
    <section id="academy" className="relative scroll-mt-20 overflow-hidden border-b border-line bg-cloud">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-flare-gradient opacity-20 blur-[90px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 top-[55%] h-80 w-80 rounded-full bg-flare-gradient opacity-15 blur-[100px]" />

      <div className="wrap relative py-16 md:py-24">
        {/* recruiting headline */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider shadow-sm sm:text-xs">
              <span className="ax-live-dot" /> Registration open · Start your career in tech
            </span>
            <h2 className="font-display mt-6 text-balance text-[34px] font-semibold leading-[1.1] sm:text-5xl md:text-6xl">
              Learn a skill that pays, <span className="bg-flare-gradient bg-clip-text text-transparent">in just {ACADEMY.weeks} weeks.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Beginner courses in tech and design. Learn by building real things and finish with a certificate.
            </p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link href="/register" className="ax-shimmer-btn group inline-flex items-center justify-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-white transition hover:bg-flare-600">
                Register now
                <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <a href={ask} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-white px-6 py-4 font-semibold transition hover:border-[#25D366]">
                <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> Ask a question
              </a>
            </div>
            <ul className="mx-auto mt-9 grid max-w-md grid-cols-2 gap-x-6 gap-y-3 text-left text-sm font-medium text-ink/80 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center">
              <li className="flex items-center gap-2"><ClockIcon className="h-4 w-4 shrink-0 text-flare-600" /> {ACADEMY.weeks}-week courses</li>
              <li className="flex items-center gap-2"><CertificateIcon className="h-4 w-4 shrink-0 text-flare-600" /> Certificate</li>
              <li className="flex items-center gap-2"><TargetIcon className="h-4 w-4 shrink-0 text-flare-600" /> Beginner friendly</li>
              <li className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 shrink-0 text-flare-600" /> Flexible start dates</li>
            </ul>
          </div>
        </Reveal>

        {/* fees */}
        <Reveal delay={80}>
          <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-2">
            {([["online", "Online training", WifiIcon], ["physical", "Physical training", MapPinIcon]] as const).map(([id, label, Icon]) => (
              <Link key={id} href={`/register?mode=${id}`} className="group rounded-3xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-flare-300 hover:shadow-soft">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-flare-50 text-flare-600"><Icon className="h-5 w-5" /></span>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-flare-600">{label}</p>
                <p className="font-display mt-1 text-4xl font-semibold"><span className="mr-1 text-base font-medium text-muted">from</span>{naira(MIN_FEES[id])}</p>
                <p className="mt-1 text-sm text-muted">Per course, per student. Price shown on each course.</p>
              </Link>
            ))}
          </div>
        </Reveal>

        {/* courses */}
        <div className="mt-20">
          <Reveal>
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-flare-600">Available courses</p>
              <h3 className="font-display mt-3 text-balance text-3xl font-semibold md:text-4xl">Pick the skill you want to walk away with.</h3>
            </div>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((c, i) => {
              const Icon = COURSE_ICONS[c.icon];
              return (
                <Reveal key={c.id} delay={(i % 3) * 80}>
                  <Link href={`/register?course=${c.id}`} className="group flex h-full flex-col rounded-3xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-flare-300 hover:shadow-soft">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-flare-50 text-flare-600 transition-colors duration-300 group-hover:bg-flare-500 group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h4 className="font-display mt-5 text-xl font-semibold">{c.title}</h4>
                    <p className="mt-1.5 text-[15px] text-muted">{c.blurb}</p>
                    <p className="mt-3 text-xs font-semibold text-ink/70">Online {naira(c.fees.online)} · Physical {naira(c.fees.physical)}</p>
                    <ul className="mt-4 space-y-2">
                      {c.skills.slice(0, 3).map((s) => (
                        <li key={s} className="flex items-start gap-2.5 text-sm leading-snug">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-flare-100 text-flare-700"><CheckIcon className="h-2.5 w-2.5" /></span>
                          {s}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto pt-6 text-sm font-semibold text-flare-600 group-hover:underline">See details and register →</span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* quotes */}
        <div className="mt-20">
          <Reveal><QuoteSlider /></Reveal>
        </div>

        {/* closing CTA */}
        <Reveal>
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <h3 className="font-display text-balance text-3xl font-semibold">Ready to start?</h3>
            <p className="mt-3 text-muted">Registering takes about 2 minutes. Please register only if you’re serious about learning.</p>
            <Link href="/register" className="ax-shimmer-btn mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-9 py-4 font-semibold text-white transition hover:bg-flare-600">
              Register now <ArrowUpRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
