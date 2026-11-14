"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./academy.css";

// Slim "registration open" strip shown above the menu on every public page except registration/admin.
export default function RecruitBanner() {
  const pathname = usePathname();
  if (pathname.startsWith("/register") || pathname.startsWith("/admin")) return null;
  return (
    <Link href="/register" className="block bg-ink text-white transition hover:bg-[#241F17]">
      <div className="wrap flex items-center justify-center gap-3 py-2.5 text-center text-[13px] sm:text-sm">
        <span className="ax-live-dot shrink-0" />
        <span>
          <b>Registration open</b> <span className="hidden sm:inline">for people who want to start a career in tech.</span>
          <span className="sm:hidden">Start your tech career.</span>
        </span>
        <span className="shrink-0 rounded-full bg-flare-500 px-3 py-1 text-xs font-bold">Register →</span>
      </div>
    </Link>
  );
}
