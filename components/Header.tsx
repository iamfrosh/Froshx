"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { MenuIcon, CloseIcon, PhoneIcon, WhatsAppIcon } from "./Icons";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-white/90 backdrop-blur border-b border-line" : "bg-transparent"
      }`}
    >
      <div className="wrap flex items-center justify-between h-20">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="FroshX home">
          <Image
            src="/images/froshx-logo.png"
            alt="FroshX logo"
            width={140}
            height={44}
            priority
            className="h-8 w-auto md:h-9"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-9" aria-label="Primary">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[15px] font-medium transition-colors relative py-1 ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-[3px] left-0 right-0 h-[2px] bg-flare-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <a
            href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
            className="flex items-center gap-2 text-sm font-medium text-muted hover:text-ink transition-colors"
          >
            <PhoneIcon className="w-4 h-4 text-flare-500" />
            {SITE.phoneDisplay}
          </a>
          <a
            href={SITE.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className="flex items-center justify-center w-9 h-9 rounded-full text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
          >
            <WhatsAppIcon className="w-5 h-5" />
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-full bg-ink text-white text-sm font-semibold px-5 py-2.5 hover:bg-flare-600 transition-colors"
          >
            Start a project
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 -mr-2 text-ink"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-line bg-white">
          <nav className="wrap py-4 flex flex-col gap-1" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-3 text-base font-medium border-b border-line/70 last:border-0 ${
                  pathname === link.href ? "text-flare-600" : "text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
              className="flex items-center gap-2 py-3 text-base font-medium text-ink"
            >
              <PhoneIcon className="w-4 h-4 text-flare-500" /> {SITE.phoneDisplay}
            </a>
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-3 text-base font-medium text-ink"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" /> Chat on WhatsApp
            </a>
            <Link
              href="/contact"
              className="mt-2 inline-flex justify-center items-center rounded-full bg-ink text-white text-sm font-semibold px-5 py-3"
            >
              Start a project
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
