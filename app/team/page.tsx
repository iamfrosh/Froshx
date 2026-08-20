 import type { Metadata } from "next";
import Image from "next/image";
import CTABand from "@/components/CTABand";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Meet the people behind FroshX Technologies — development, UI/UX design, graphics and social media.",
  alternates: { canonical: "/team" },
};

const TEAM = [
  {
    name: "Ajala Emmanuel Olushola",
    role: "Founder & Software Developer",
    bio: "Leads engineering on every FroshX build — from architecture to the last line of shipped code.",
    photo: "/team/ajala-emmanuel.jpeg",
  },
  {
    name: "Joel John",
    role: "Graphics Designer",
    bio: "Shapes the visual identity behind every brand FroshX touches — logos, layouts and design assets.",
    photo: "/team/joel-john.jpeg",
  },
  {
    name: "Praise James",
    role: "UI/UX Designer",
    bio: "Plans every screen around the person using it — clear flows, sensible layouts, no dead ends.",
    photo: "/team/praise-james.jpeg",
  },
  {
    name: "Keziah Mobolaji",
    role: "Social Media Manager",
    bio: "Keeps FroshX's presence on Instagram and Facebook consistent, current and on-brand.",
    photo: "/team/keziah-mobolaji.jpeg",
  },
];

export default function TeamPage() {
  return (
    <>
      <section className="pt-16 pb-16 md:pt-24 md:pb-20">
        <div className="wrap">
          <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
            Our team
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3 max-w-2xl text-balance">
            The people building FroshX.
          </h1>
          <p className="mt-6 text-lg text-muted leading-relaxed max-w-2xl">
            Development, design and brand, all under one roof — a small team
            that works close enough to every project to actually stand behind
            it.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="wrap grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((m) => (
            <div key={m.name}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-gradient">
                {m.photo ? (
                  <Image
                    src={m.photo}
                    alt={`${m.name}, ${m.role}`}
                    fill
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                    className="object-cover object-top"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-5xl font-semibold text-white/25">
                      {m.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <p className="font-display text-lg font-semibold mt-4">{m.name}</p>
              <p className="text-sm text-flare-600 font-medium">{m.role}</p>
              <p className="text-sm text-muted mt-2 leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </section>

      <CTABand
        title="Like how we work? Let's build something."
        subtitle="Reach out and tell us what you need — we'll bring the right people in."
      />
    </>
  );
}
