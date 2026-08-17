import Link from "next/link";
import Image from "next/image";
import { NAV_LINKS, SITE } from "@/lib/site";
import { MailIcon, PhoneIcon, WhatsAppIcon, InstagramIcon, FacebookIcon } from "./Icons";

export default function Footer() {
  return (
    <footer className="bg-ink text-white/90">
      <div className="wrap py-16">
        <div className="grid gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/images/froshx-logo.png"
              alt="FroshX logo"
              width={150}
              height={48}
              className="h-8 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              {SITE.description}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-white/40 mb-4">
              Navigate
            </p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/70 hover:text-flare-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-white/40 mb-4">
              Contact
            </p>
            <ul className="space-y-3">
              <li>
                <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 text-sm text-white/70 hover:text-flare-300 transition-colors">
                  <MailIcon className="w-4 h-4 shrink-0" /> {SITE.email}
                </a>
              </li>
              <li>
                <a href={`tel:${SITE.phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 text-sm text-white/70 hover:text-flare-300 transition-colors">
                  <PhoneIcon className="w-4 h-4 shrink-0" /> {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/70 hover:text-flare-300 transition-colors">
                  <WhatsAppIcon className="w-4 h-4 shrink-0" /> WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-white/40 mb-4">
              Follow
            </p>
            <ul className="space-y-3">
              <li>
                <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/70 hover:text-flare-300 transition-colors">
                  <InstagramIcon className="w-4 h-4 shrink-0" /> {SITE.instagramHandle}
                </a>
              </li>
              <li>
                <a href={SITE.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-white/70 hover:text-flare-300 transition-colors">
                  <FacebookIcon className="w-4 h-4 shrink-0" /> {SITE.facebookHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} {SITE.fullName}. All rights reserved.
          </p>
          <p className="text-xs text-white/40">Built by FroshX — {SITE.tagline}.</p>
        </div>
      </div>
    </footer>
  );
}
