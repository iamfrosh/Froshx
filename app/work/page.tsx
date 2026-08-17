import type { Metadata } from "next";
import Image from "next/image";
import { WORK_ITEMS } from "@/lib/site";
import WorkCard from "@/components/WorkCard";
import CTABand from "@/components/CTABand";

export const metadata: Metadata = {
  title: "Our Work",
  description:
    "Websites and platforms FroshX Technologies has designed and built, including the Faculty of Education portal for the Federal University of Kashere.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <section className="pt-16 pb-16 md:pt-24 md:pb-20">
        <div className="wrap">
          <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
            Our work
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3 max-w-2xl text-balance">
            A small studio, a growing body of work.
          </h1>
          <p className="mt-6 text-lg text-muted leading-relaxed max-w-2xl">
            Every project below was designed and built end-to-end by the
            FroshX team — from first wireframe to the version that’s live
            today.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="wrap grid md:grid-cols-2 gap-5">
          {WORK_ITEMS.map((item) => (
            <WorkCard key={item.slug} item={item} />
          ))}

          <div className="rounded-3xl border border-dashed border-line p-7 md:p-9 flex flex-col justify-center">
            <p className="font-display text-xl font-semibold text-balance">
              Your project could be next.
            </p>
            <p className="text-[15px] text-muted mt-2 leading-relaxed">
              We’re always taking on a small number of new builds. If you’re
              planning a website or platform, we’d like to hear about it.
            </p>
          </div>
        </div>
      </section>

      {/* Brand & marketing design samples */}
      <section className="pb-24">
        <div className="wrap">
          <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
            Beyond the screen
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold mt-3 max-w-xl text-balance">
            Brand &amp; marketing design, alongside every build.
          </h2>
          <p className="mt-3 text-[15px] text-muted max-w-xl leading-relaxed">
            A couple of promotional pieces from our graphics side of the
            studio.
          </p>
          <div className="flex flex-wrap gap-4 mt-7">
            <div className="w-36 sm:w-44 rounded-2xl overflow-hidden border border-line shadow-soft">
              <Image
                src="/work/flier-1.jpg"
                alt="FroshX Technologies promotional flier"
                width={400}
                height={500}
                className="w-full h-auto"
              />
            </div>
            <div className="w-36 sm:w-44 rounded-2xl overflow-hidden border border-line shadow-soft">
              <Image
                src="/work/flier-2.jpg"
                alt="FroshX Technologies promotional flier featuring a client project"
                width={400}
                height={500}
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <CTABand
        title="Ready to see your idea built properly?"
        subtitle="Tell us about your project and we'll get back to you within a working day."
      />
    </>
  );
}
