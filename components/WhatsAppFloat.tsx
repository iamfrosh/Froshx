"use client";

import { usePathname } from "next/navigation";
import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "./Icons";
import "./academy/academy.css";

// Floating "chat with us" button on every public page.
export default function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  const href = `${SITE.whatsapp}?text=${encodeURIComponent("Hello FroshX, I’d like to ask about your services or the Academy.")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with FroshX on WhatsApp"
      className="group fixed bottom-5 right-4 z-[80] flex items-center gap-3 sm:bottom-6 sm:right-6"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <span className="pointer-events-none hidden translate-x-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
        Chat with us
      </span>
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,.7)] transition-transform duration-300 group-hover:scale-110">
        <span aria-hidden className="absolute inset-0 rounded-full bg-[#25D366]" style={{ animation: "ax-ring 2.4s ease-out infinite" }} />
        <WhatsAppIcon className="relative h-7 w-7" />
      </span>
    </a>
  );
}
