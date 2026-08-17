"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "froshx-cookie-consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function choose(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    setVisible(false);
    window.dispatchEvent(new CustomEvent("froshx-consent", { detail: value }));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[100] p-4 md:p-6 animate-rise"
    >
      <div className="wrap">
        <div className="max-w-3xl mx-auto md:mx-0 rounded-2xl border border-line bg-white shadow-soft p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4">
          <p className="text-sm text-muted leading-relaxed flex-1">
            We use a small number of cookies to keep this site working well and to
            understand how it’s used. Read our{" "}
            <Link href="/privacy" className="text-ink underline underline-offset-2">
              privacy &amp; cookie policy
            </Link>{" "}
            for details.
          </p>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => choose("rejected")}
              className="text-sm font-medium text-muted hover:text-ink px-4 py-2.5 rounded-full transition-colors"
            >
              Decline
            </button>
            <button
              onClick={() => choose("accepted")}
              className="text-sm font-semibold text-white bg-ink hover:bg-flare-600 px-5 py-2.5 rounded-full transition-colors"
            >
              Accept cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
