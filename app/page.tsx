import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SITE, SERVICES, WORK_ITEMS } from "@/lib/site";
import WorkCard from "@/components/WorkCard";
import TeamCard from "@/components/TeamCard";
import CTABand from "@/components/CTABand";
import Testimonial from "@/components/Testimonial";
import { ArrowUpRightIcon, CheckIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: `${SITE.fullName} — Websites & Software, Built Properly`,
  description: SITE.description,
  alternates: { canonical: "/" },
};

const TEAM_PREVIEW = [
  { name: "Ajala Emmanuel Olushola", role: "Founder & Software Developer", photo: "/team/ajala-emmanuel.jpeg" },
  { name: "Joel John", role: "Graphics Designer", photo: "/team/joel-john.jpeg" },
  { name: "Praise James", role: "UI/UX Designer", photo: "/team/praise-james.jpeg" },
  { name: "Keziah Mobolaji", role: "Social Media Manager", photo: "/team/keziah-mobolaji.jpeg" },
];

const PROCESS = [
  { label: "Discover", text: "We learn your goals, your users and what \u201cdone well\u201d looks like for you." },
  { label: "Design", text: "Wireframes and visuals you review and shape before a line of code is written." },
  { label: "Build", text: "Clean, modern development — responsive, fast and tested across devices." },
  { label: "Launch & support", text: "We ship it, index it with search engines, and stay on for support." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            backgroundImage:
              "radial-gradient(circle, #E7E2DA 1px, transparent 1px)",
            backgroundSize: "22px 22px",
            maskImage: "radial-gradient(ellipse 60% 50% at 70% 20%, black, transparent)",
          }}
        />
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[520px] h-[520px] rounded-full bg-flare-gradient opacity-25 blur-[100px] -z-10"
        />
        <div className="wrap pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl animate-rise">
            <h1 className="font-display text-[2.5rem] leading-[1.08] md:text-6xl md:leading-[1.05] font-semibold mt-6 text-balance">
              We design and build digital products that hold up to scrutiny.
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed max-w-xl">
              FroshX Technologies builds websites, platforms and interfaces for
              institutions and businesses — engineered properly, designed with
              intent, and shipped on time.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-ink text-white font-semibold text-base px-7 py-4 hover:bg-flare-600 transition-colors"
              >
                Start a project
                <ArrowUpRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/work"
                className="inline-flex items-center gap-2 text-base font-semibold text-ink px-2 py-4 hover:text-flare-600 transition-colors"
              >
                See our work
              </Link>
            </div>
          </div>
        </div>

        <div className="x-divider" />
      </section>

      {/* Trust strip */}
      <section className="py-10 md:py-12 border-b border-line">
        <div className="wrap">
          <p className="text-xs font-semibold tracking-wider uppercase text-muted mb-5">
            Trusted to build for
          </p>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <p className="font-display text-lg font-semibold text-ink/80">
              Federal University of Kashere
            </p>
            <span className="hidden sm:block w-1 h-1 rounded-full bg-line" />
            <p className="font-display text-lg font-semibold text-ink/80">
              Faculty of Education Student Union
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 md:py-28">
        <div className="wrap">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
              What we do
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-balance">
              One team, from first sketch to launched product.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {SERVICES.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-line p-6 md:p-7 hover:border-flare-300 hover:bg-cloud transition-colors"
              >
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="text-[15px] text-muted leading-relaxed mt-2.5">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-3 rounded-2xl bg-cloud border border-line px-6 py-5">
            <p className="text-sm text-ink">
              <span className="font-display font-semibold">Projects typically start from {SITE.startingPrice}</span>
              <span className="text-muted"> — final cost depends on scope.</span>
            </p>
            <p className="text-sm text-ink">
              <span className="font-display font-semibold">Typical build time: {SITE.typicalTimeline}</span>
            </p>
          </div>
        </div>
      </section>

      <Testimonial />

      {/* Featured work */}
      <section className="py-20 md:py-28 bg-cloud">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
                Selected work
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-balance">
                A look at what we’ve shipped.
              </h2>
            </div>
            <Link
              href="/work"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-flare-600 transition-colors"
            >
              View all work <ArrowUpRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-12">
            {WORK_ITEMS.slice(0, 4).map((item) => (
              <WorkCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-28">
        <div className="wrap">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
              How we work
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-balance">
              A process built to remove guesswork.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-14">
            {PROCESS.map((step, i) => (
              <div key={step.label} className="relative">
                <p className="font-display text-4xl font-semibold text-flare-500/25">
                  0{i + 1}
                </p>
                <h3 className="font-display text-lg font-semibold mt-2">{step.label}</h3>
                <p className="text-[15px] text-muted leading-relaxed mt-2">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why FroshX */}
      <section className="py-20 md:py-28 bg-ink text-white">
        <div className="wrap grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-flare-300">
              Why FroshX
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-balance">
              Small studio discipline, agency-grade output.
            </h2>
            <p className="mt-5 text-white/60 leading-relaxed">
              We keep every project close, review every screen ourselves, and
              write copy and code we’d be comfortable shipping under our own
              name — because we are.
            </p>
          </div>
          <ul className="space-y-4">
            {[
              "Fully responsive across mobile, tablet and desktop",
              "SEO-friendly structure, metadata and clean URLs from day one",
              "Accessible, secure builds with proper loading and error states",
              "Direct communication with the people actually building your site",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-flare-500/20 flex items-center justify-center shrink-0">
                  <CheckIcon className="w-3 h-3 text-flare-300" />
                </span>
                <span className="text-white/80 text-[15px]">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team preview */}
      <section className="py-20 md:py-28">
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
                The people
              </p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 text-balance">
                Meet the team behind the work.
              </h2>
            </div>
            <Link
              href="/team"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-flare-600 transition-colors"
            >
              Full team <ArrowUpRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 max-w-4xl">
            {TEAM_PREVIEW.map((m) => (
              <TeamCard key={m.name} member={m} />
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
