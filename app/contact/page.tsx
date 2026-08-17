import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import ContactForm from "@/components/ContactForm";
import { MailIcon, PhoneIcon, WhatsAppIcon, InstagramIcon, FacebookIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with FroshX Technologies about a website, platform or design project.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="pt-16 pb-24 md:pt-24 md:pb-28">
      <div className="wrap grid lg:grid-cols-[1fr_1.2fr] gap-14">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-flare-600">
            Contact
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold mt-3 text-balance">
            Let’s build something worth showing off.
          </h1>
          <p className="mt-6 text-lg text-muted leading-relaxed max-w-md">
            Tell us about your project and we’ll get back to you within one
            working day.
          </p>

          <ul className="mt-10 space-y-5">
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="flex items-center gap-3 group"
              >
                <span className="w-11 h-11 rounded-full bg-flare-50 flex items-center justify-center shrink-0">
                  <MailIcon className="w-[18px] h-[18px] text-flare-600" />
                </span>
                <span>
                  <span className="block text-xs text-muted">Email</span>
                  <span className="block text-[15px] font-medium group-hover:text-flare-600 transition-colors">
                    {SITE.email}
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-3 group"
              >
                <span className="w-11 h-11 rounded-full bg-flare-50 flex items-center justify-center shrink-0">
                  <PhoneIcon className="w-[18px] h-[18px] text-flare-600" />
                </span>
                <span>
                  <span className="block text-xs text-muted">Call</span>
                  <span className="block text-[15px] font-medium group-hover:text-flare-600 transition-colors">
                    {SITE.phoneDisplay}
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <span className="w-11 h-11 rounded-full bg-flare-50 flex items-center justify-center shrink-0">
                  <WhatsAppIcon className="w-[18px] h-[18px] text-[#25D366]" />
                </span>
                <span>
                  <span className="block text-xs text-muted">WhatsApp</span>
                  <span className="block text-[15px] font-medium group-hover:text-flare-600 transition-colors">
                    Chat with us
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <span className="w-11 h-11 rounded-full bg-flare-50 flex items-center justify-center shrink-0">
                  <InstagramIcon className="w-[18px] h-[18px] text-flare-600" />
                </span>
                <span>
                  <span className="block text-xs text-muted">Instagram</span>
                  <span className="block text-[15px] font-medium group-hover:text-flare-600 transition-colors">
                    {SITE.instagramHandle}
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a
                href={SITE.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 group"
              >
                <span className="w-11 h-11 rounded-full bg-flare-50 flex items-center justify-center shrink-0">
                  <FacebookIcon className="w-[18px] h-[18px] text-flare-600" />
                </span>
                <span>
                  <span className="block text-xs text-muted">Facebook</span>
                  <span className="block text-[15px] font-medium group-hover:text-flare-600 transition-colors">
                    {SITE.facebookHandle}
                  </span>
                </span>
              </a>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-line bg-cloud p-7 md:p-10">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
