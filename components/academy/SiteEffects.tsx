"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ACADEMY } from "@/lib/academy";
import { BellIcon } from "./AcademyIcons";
import { CloseIcon } from "../Icons";

export const DRAFT_KEY = "froshx-academy-draft";
export const REMIND_KEY = "froshx-remind";
const INTERVAL_MS = ACADEMY.reminderMinutes * 60 * 1000;

type Draft = { draftId: string; updatedAt: number; lastReminderAt?: number; name?: string; course?: string };

function readDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

function sessionId() {
  try {
    let sid = sessionStorage.getItem("froshx-sid");
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("froshx-sid", sid);
    }
    return sid;
  } catch {
    return "";
  }
}

async function notify(title: string, body: string) {
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    if ("serviceWorker" in navigator) {
      const reg = (await navigator.serviceWorker.getRegistration("/fx-sw.js")) || (await navigator.serviceWorker.register("/fx-sw.js"));
      await reg.showNotification(title, { body, icon: "/images/froshx-logo.png", tag: "froshx-draft" });
      return;
    }
    new Notification(title, { body, icon: "/images/froshx-logo.png", tag: "froshx-draft" });
  } catch {}
}

// Site-wide: counts anonymous page views and reminds people to finish an unfinished registration.
export default function SiteEffects() {
  const pathname = usePathname();
  const [toast, setToast] = useState(false);

  // 1) Anonymous visit tracking (no cookies, no IP stored)
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const sid = sessionId();
    if (!sid) return;
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sid, path: pathname, referrer: document.referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  // 2) Reminder every 20 minutes while the site is open in any tab
  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const check = () => {
      const d = readDraft();
      if (!d) { setToast(false); return; }
      const last = Math.max(d.updatedAt || 0, d.lastReminderAt || 0);
      if (Date.now() - last < INTERVAL_MS) return;
      d.lastReminderAt = Date.now();
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
      setToast(true);
      if (localStorage.getItem(REMIND_KEY) === "on") {
        notify("Finish your FroshX Academy registration", `${d.name ? d.name.split(" ")[0] + ", y" : "Y"}ou’re almost done. It only takes a minute to complete.`);
      }
    };
    check();
    const t = setInterval(check, 30 * 1000);
    const onVisible = () => { if (document.visibilityState === "visible") check(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(t); document.removeEventListener("visibilitychange", onVisible); };
  }, [pathname]);

  if (!toast) return null;
  return (
    <div role="status" className="ax-rise fixed bottom-4 left-4 right-4 z-[90] sm:right-auto sm:max-w-sm">
      <div className="flex items-start gap-3 rounded-2xl border border-flare-100 bg-white p-4 shadow-soft">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-flare-50 text-flare-600">
          <BellIcon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">You’re almost registered</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted">Finish your FroshX Academy registration. Your answers are saved.</p>
          <Link href="/register" onClick={() => setToast(false)} className="mt-2 inline-block text-sm font-semibold text-flare-600 hover:underline">
            Continue registration →
          </Link>
        </div>
        <button onClick={() => setToast(false)} aria-label="Dismiss" className="p-1 text-muted hover:text-ink">
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
