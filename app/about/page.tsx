import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import CTABand from "@/components/CTABand";
import { CheckIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "About FroshX",
  description:
    "FroshX Technologies is a small web and software studio based in Gombe, Nigeria, building websites and platforms for institutions and businesses.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    title: "Built to last",
    text: "We write clean, maintainable code and design systems that stay usable long after launch — not just for the demo.",
  },
  {
    title: "Clarity first",
    text: "Every screen has a job. If a page, button or line of copy isn't earning its place, we cut it.",
  },
  {
    title: "Honest process",
    text: "You see wireframes before pixels, and pixels before code. No surprises at delivery.",
  },
  {
    title: "Local, accountable",
    text: "We're based in Nigeria and build for Nigerian institutions and businesses — we understand the context we design for.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="pt-16 pb-20 md:pt-24 md:pb-24">
        <div className="wrap">
          <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
            About us
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3 max-w-2xl text-balance">
            Tech, redefined for the people who’ll actually use it.
          </h1>
          <p className="mt-6 text-lg text-muted leading-relaxed max-w-2xl">
            {SITE.fullName} is a small, focused studio building websites,
            platforms and digital products. We started with one simple idea:
            institutions, unions and young businesses deserve the same level
            of design and engineering care that big agencies give large
            clients — without the bloated process.
          </p>
        </div>
      </section>

      <div className="x-divider" />

      <section className="py-20 md:py-24">
        <div className="wrap grid md:grid-cols-2 gap-14 items-start">
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
              Our story
            </p>
            <h2 className="font-display text-3xl font-semibold mt-3 text-balance">
              From a founder’s portfolio to a working studio.
            </h2>
            <div className="mt-6 space-y-4 text-[15px] text-muted leading-relaxed">
              <p>
                FroshX began as a single developer’s practice — building fast,
                well-considered websites and refining that craft project by
                project. That standard is still the one every FroshX build is
                held to.
              </p>
              <p>
                As the work grew, so did the team: a UI/UX designer to plan
                every screen around real users, a graphics designer to give
                each brand a consistent visual identity, and a social media
                lead to carry that identity beyond the website itself.
              </p>
              <p>
                Today, FroshX builds for institutions and student bodies as
                comfortably as it builds for individual founders — including
                a full faculty website for the Federal University of Kashere,
                commissioned through its Faculty of Education Student Union.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-cloud border border-line p-8 md:p-10">
            <p className="text-xs font-semibold tracking-wider uppercase text-flare-600 mb-6">
              What guides us
            </p>
            <ul className="space-y-6">
              {VALUES.map((v) => (
                <li key={v.title} className="flex gap-4">
                  <span className="mt-1 w-6 h-6 rounded-full bg-flare-100 flex items-center justify-center shrink-0">
                    <CheckIcon className="w-3.5 h-3.5 text-flare-600" />
                  </span>
                  <div>
                    <p className="font-display font-semibold">{v.title}</p>
                    <p className="text-sm text-muted mt-1 leading-relaxed">{v.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CTABand
        title="Want a studio that treats your brief like it's the only one?"
        subtitle="Send us a message and let's talk through what you're building."
      />
    </>
  );
}
