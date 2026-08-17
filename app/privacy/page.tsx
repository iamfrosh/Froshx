import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy & Cookie Policy",
  description: `How ${SITE.fullName} handles your data and uses cookies on this website.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <section className="pt-16 pb-24 md:pt-24">
      <div className="wrap max-w-2xl">
        <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
          Legal
        </p>
        <h1 className="font-display text-4xl font-semibold mt-3">
          Privacy &amp; Cookie Policy
        </h1>
        <p className="text-sm text-muted mt-3">Last updated: August 2026</p>

        <div className="mt-10 space-y-8 text-[15px] text-ink/80 leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-semibold text-ink">1. Who we are</h2>
            <p className="mt-2">
              {SITE.fullName} ("FroshX", "we", "us") operates this website. If
              you have questions about this policy, contact us at{" "}
              <a href={`mailto:${SITE.email}`} className="underline underline-offset-2">
                {SITE.email}
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-ink">2. Information we collect</h2>
            <p className="mt-2">
              When you use our contact form, we receive the name, email
              address, project details and any message you choose to send us.
              We use this only to respond to your enquiry — we don’t sell or
              share it with third parties.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-ink">3. Cookies</h2>
            <p className="mt-2">
              We use a small, essential cookie to remember your cookie
              preference, and — only if you accept — anonymous analytics
              cookies to understand how visitors use the site (pages viewed,
              general location, device type). These help us improve the site
              and do not identify you personally. You can withdraw consent at
              any time by clearing your browser’s cookies for this site.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-ink">4. Your rights</h2>
            <p className="mt-2">
              You can ask us what data we hold about you, request a copy, or
              ask us to delete it, by emailing{" "}
              <a href={`mailto:${SITE.email}`} className="underline underline-offset-2">
                {SITE.email}
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl font-semibold text-ink">5. Changes to this policy</h2>
            <p className="mt-2">
              We may update this policy as the website evolves. Material
              changes will be reflected by the “last updated” date above.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
