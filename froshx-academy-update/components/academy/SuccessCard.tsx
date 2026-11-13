"use client";

import { useState } from "react";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { ACADEMY, naira } from "@/lib/academy";
import { WhatsAppIcon } from "../Icons";
import { CopyIcon, CalendarIcon, CertificateIcon, ClockIcon, ShieldIcon, UsersIcon } from "./AcademyIcons";

export type RegResult = { ref: string; courseTitle: string; mode: "online" | "physical"; fee: number };

const COLORS = ["#F97316", "#FDB463", "#15130F", "#FFD9A8", "#EA5B0C", "#22C55E"];

export default function SuccessCard({ result, name, start, onAnother }: { result: RegResult; name: string; start: string; onAnother: () => void }) {
  const [copied, setCopied] = useState(false);
  const first = name.trim().split(/\s+/)[0] || "there";
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(`Hello FroshX Academy, I just registered for ${result.courseTitle} (${result.mode}). My reference is ${result.ref}.`)}`;

  const copy = async () => {
    try { await navigator.clipboard.writeText(result.ref); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-line bg-white p-6 shadow-soft sm:p-10" role="status" aria-live="polite">
      {/* confetti */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[360px]">
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="ax-confetti"
            style={{
              left: `${(i * 37) % 100}%`,
              background: COLORS[i % COLORS.length],
              animationDelay: `${(i % 9) * 0.12}s`,
              ["--dx" as string]: `${((i % 5) - 2) * 26}px`,
            }}
          />
        ))}
      </div>

      <div className="relative text-center">
        <div className="relative mx-auto h-24 w-24">
          <span className="absolute inset-0 rounded-full bg-green-400/30" style={{ animation: "ax-ring 1.6s ease-out 2" }} />
          <svg viewBox="0 0 52 52" className="relative h-24 w-24" fill="none">
            <circle className="ax-check-circle" cx="26" cy="26" r="25" stroke="#16A34A" strokeWidth="2.5" />
            <path className="ax-check-mark" d="M14 27l8 8 16-17" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h3 className="ax-rise font-display mt-6 text-3xl font-semibold sm:text-4xl" style={{ animationDelay: ".5s" }}>
          You’re in, {first}! 🎉
        </h3>
        <p className="ax-rise mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-muted" style={{ animationDelay: ".65s" }}>
          Your registration for <b className="text-ink">{result.courseTitle}</b> has been received. Our team will contact you on the number you gave us to confirm your seat.
        </p>

        <button
          onClick={copy}
          className="ax-pop mx-auto mt-7 inline-flex items-center gap-3 rounded-2xl border border-dashed border-flare-300 bg-flare-50 px-5 py-3 text-left"
          style={{ animationDelay: ".8s" }}
          aria-label="Copy your reference number"
        >
          <span>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-flare-700">Your reference</span>
            <span className="font-display text-2xl font-semibold tracking-wider text-ink">{result.ref}</span>
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-flare-700">
            <CopyIcon className="h-4 w-4" /> {copied ? "Copied!" : "Copy"}
          </span>
        </button>
        <p className="mt-2 text-xs text-muted">Keep this reference. You will need it when you message us.</p>
      </div>

      <div className="relative mt-9 grid gap-3 sm:grid-cols-2">
        {[
          { icon: CertificateIcon, label: "Course", value: result.courseTitle },
          { icon: UsersIcon, label: "Training", value: result.mode === "online" ? "Online" : "Physical (Gombe)" },
          { icon: ClockIcon, label: "Duration", value: `${ACADEMY.weeks} weeks + certificate` },
          { icon: CalendarIcon, label: "Start date", value: start },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 rounded-2xl bg-cloud px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-flare-600 shadow-sm">
              <row.icon className="h-[18px] w-[18px]" />
            </span>
            <span>
              <span className="block text-[11px] text-muted">{row.label}</span>
              <span className="block text-sm font-semibold">{row.value}</span>
            </span>
          </div>
        ))}
        <div className="rounded-2xl bg-ink px-4 py-3 text-white sm:col-span-2">
          <p className="text-[11px] uppercase tracking-wider text-white/50">Course fee</p>
          <p className="font-display text-xl font-semibold">{naira(result.fee)} <span className="text-sm font-normal text-white/60">per course. Payment details are sent after we confirm your seat.</span></p>
        </div>
      </div>

      <div className="relative mt-9">
        <p className="font-display text-lg font-semibold">What happens next</p>
        <ol className="mt-4 space-y-4">
          {[
            ["We review your registration", "Within one working day, our team will reach out on WhatsApp or by phone."],
            ["We agree your start date", "Start dates can differ from person to person, so we will fix the date that suits you."],
            ["You learn and get certified", `Six weeks of hands-on learning, then your FroshX Academy certificate.`],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-flare-500 text-sm font-bold text-white">{i + 1}</span>
              <span>
                <span className="block text-[15px] font-semibold">{t}</span>
                <span className="block text-sm leading-relaxed text-muted">{d}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative mt-9 flex flex-col gap-3 sm:flex-row">
        <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 font-semibold text-white transition hover:brightness-95">
          <WhatsAppIcon className="h-5 w-5" /> Message us on WhatsApp
        </a>
        <button onClick={onAnother} className="inline-flex flex-1 items-center justify-center rounded-full border border-line px-6 py-4 font-semibold transition hover:border-ink">
          Register someone else
        </button>
      </div>
      <p className="relative mt-5 flex items-center justify-center gap-1.5 text-xs text-muted">
        <ShieldIcon className="h-4 w-4" /> Your details are private. See our <Link href="/privacy" className="underline">privacy policy</Link>.
      </p>
    </div>
  );
}
