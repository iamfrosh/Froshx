"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import SantaHat from "./SantaHat";
import Lights from "./Lights";
import FooterFestive from "./FooterFestive";
import GiftSurprise from "./GiftSurprise";
import ChristmasWelcome from "./ChristmasWelcome";
import { christmasActive, sparkleBurst } from "./christmasConfig";
import { startSnow } from "./snowEngine";
import "./christmas.css";

const SPARKLE_TARGETS = ".ax-shimmer-btn, a.rounded-full.bg-ink, button.rounded-full.bg-ink, [data-sparkle]";

// Mounted once (from the page loader). Adds the Christmas theme on top of the existing site:
// snow, logo hat, header lights, footer message, gift, sparkles and the post-login welcome.
// It only decorates; it never changes how the site's pages, forms or logins work.
export default function ChristmasLayer() {
  const pathname = usePathname();
  const [on, setOn] = useState(false);
  const [hatHost, setHatHost] = useState<HTMLElement | null>(null);
  const [headerHost, setHeaderHost] = useState<HTMLElement | null>(null);
  const [footerHost, setFooterHost] = useState<HTMLElement | null>(null);
  const [atTop, setAtTop] = useState(true);
  const [welcome, setWelcome] = useState<{ name: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isAdmin = pathname.startsWith("/admin");
  const isPrivate = isAdmin || pathname.startsWith("/dashboard");

  // switch the theme on/off
  useEffect(() => {
    const active = christmasActive();
    setOn(active);
    document.documentElement.classList.toggle("xmas", active);
    return () => document.documentElement.classList.remove("xmas");
  }, []);

  // attach the hat, lights and footer strip to the existing header / logo / footer
  useEffect(() => {
    if (!on) return;
    const made: HTMLElement[] = [];
    const attach = (parent: Element | null, tag: string, display?: string) => {
      if (!parent) return null;
      const el = document.createElement(tag);
      if (display) el.style.display = display;
      parent.appendChild(el);
      made.push(el);
      return el;
    };
    setHatHost(attach(document.querySelector('a[aria-label="FroshX home"]'), "span", "contents"));
    setHeaderHost(attach(document.querySelector("header"), "div", "contents"));
    setFooterHost(attach(document.querySelector("footer"), "div"));
    return () => { made.forEach((m) => m.remove()); setHatHost(null); setHeaderHost(null); setFooterHost(null); };
  }, [on, pathname]);

  // ornaments are only shown near the top of the page
  useEffect(() => {
    if (!on) return;
    const onScroll = () => setAtTop(window.scrollY < 160);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [on]);

  // snowfall (not on the admin pages)
  useEffect(() => {
    if (!on || isAdmin || !canvasRef.current) return;
    return startSnow(canvasRef.current);
  }, [on, isAdmin]);

  // sparkles when pressing the main buttons
  useEffect(() => {
    if (!on) return;
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(SPARKLE_TARGETS) as HTMLElement | null;
      if (!el) return;
      let x = e.clientX, y = e.clientY;
      if (!x && !y) { const r = el.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
      sparkleBurst(x, y, 10);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [on]);

  // festive welcome after a successful login (student or admin). Watches the login request; it doesn't change it.
  useEffect(() => {
    if (!on) return;
    const original = window.fetch;
    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const res = await original(...args);
      try {
        const input = args[0];
        const url = typeof input === "string" ? input : input instanceof URL ? input.pathname : (input as Request).url;
        const method = (args[1]?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
        if (res.ok && method === "POST") {
          if (/\/api\/student\/login$/.test(url)) {
            setWelcome({ name: "" });
            original("/api/student/me", { cache: "no-store" })
              .then((r) => r.json())
              .then((j) => setWelcome((w) => (w ? { name: j?.student?.fullName || "" } : w)))
              .catch(() => {});
          } else if (/\/api\/admin\/login$/.test(url)) {
            setWelcome({ name: "Admin" });
          }
        }
      } catch {}
      return res;
    };
    return () => { window.fetch = original; };
  }, [on]);

  if (!on) return null;
  return (
    <>
      {!isAdmin && <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />}
      {hatHost && createPortal(<SantaHat className="xm-hat" />, hatHost)}
      {headerHost && createPortal(<Lights ornaments={atTop && !isPrivate} />, headerHost)}
      {footerHost && createPortal(<FooterFestive />, footerHost)}
      {!isPrivate && <GiftSurprise />}
      {welcome && <ChristmasWelcome name={welcome.name} onDone={() => setWelcome(null)} />}
    </>
  );
}
