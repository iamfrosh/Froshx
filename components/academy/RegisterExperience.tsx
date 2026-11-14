"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SITE } from "@/lib/site";
import { ACADEMY, COURSES, FEES, getCourse, naira, Mode } from "@/lib/academy";
import { WhatsAppIcon, CheckIcon } from "../Icons";
import {
  CalendarIcon, CertificateIcon, ChevronRightIcon, ClockIcon, COURSE_ICONS, TargetIcon, UsersIcon, RocketIcon,
} from "./AcademyIcons";
import RegistrationForm from "./RegistrationForm";
import Reveal from "./Reveal";
import "./academy.css";

const HOW = [
  { icon: TargetIcon, t: "1. Fill the form", d: "Pick a course and tell us about you. About 2 minutes." },
  { icon: UsersIcon, t: "2. We contact you", d: "We confirm your seat and agree your start date on WhatsApp or by phone." },
  { icon: CertificateIcon, t: "3. Learn and get certified", d: `${ACADEMY.weeks} weeks of hands-on training, then your certificate.` },
];

const FAQ = [
  ["Do I need any experience?", "No. Every course starts from the basics. You tell us your level in the form."],
  ["Do I pay on this form?", `No. Registering only reserves your interest. Online is ${naira(FEES.online)} and physical is ${naira(FEES.physical)} per course. We send payment details after we confirm your seat.`],
  ["When does my course start?", "Start dates can differ from one student to another. We agree a date that works for you."],
  ["Will I get a certificate?", `Yes. Complete the ${ACADEMY.weeks} weeks and you receive a FroshX Academy certificate.`],
  ["Can I take more than one course?", "Yes. Each registration is for one course, so register again for another."],
  ["Where are physical classes?", "In Gombe. We confirm the venue after registration."],
];

function Summary({ course, mode }: { course: string; mode: Mode }) {
  const c = getCourse(course);
  const ask = `${SITE.whatsapp}?text=${encodeURIComponent(c ? `Hello FroshX Academy, I want clarification about the ${c.title} course (${mode}).` : "Hello FroshX Academy, I want to ask a question before I register.")}`;
  if (!c) {
    return (
      <div className="rounded-3xl border border-dashed border-flare-300 bg-flare-50 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-flare-600"><RocketIcon className="h-6 w-6" /></span>
        <p className="font-display mt-4 text-lg font-semibold">Choose a course to begin</p>
        <p className="mt-1 text-sm text-muted">When you pick one, you will see exactly what you will learn here.</p>
      </div>
    );
  }
  const Icon = COURSE_ICONS[c.icon];
  return (
    <div className="rounded-3xl border border-line bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-flare-500 text-white"><Icon className="h-6 w-6" /></span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-flare-600">You are registering for</p>
          <p className="font-display text-lg font-semibold leading-tight">{c.title}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">{c.blurb}</p>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-ink/50">Skills you will gain</p>
      <ul className="mt-3 space-y-2.5">
        {c.skills.map((s) => (
          <li key={s} className="flex items-start gap-2.5 text-sm leading-snug">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-flare-100 text-flare-700"><CheckIcon className="h-2.5 w-2.5" /></span>{s}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-xl bg-cloud px-3.5 py-3 text-[13px] leading-snug"><b>By the end:</b> {c.outcome}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-5 text-sm">
        <div><dt className="flex items-center gap-1.5 text-xs text-muted"><ClockIcon className="h-3.5 w-3.5" /> Duration</dt><dd className="font-semibold">{ACADEMY.weeks} weeks</dd></div>
        <div><dt className="flex items-center gap-1.5 text-xs text-muted"><CertificateIcon className="h-3.5 w-3.5" /> Certificate</dt><dd className="font-semibold">Included</dd></div>
        <div><dt className="flex items-center gap-1.5 text-xs text-muted"><CalendarIcon className="h-3.5 w-3.5" /> Start date</dt><dd className="font-semibold">Flexible</dd></div>
        <div><dt className="text-xs text-muted">Fee ({mode})</dt><dd className="font-display text-lg font-semibold">{naira(FEES[mode])}</dd></div>
      </dl>
      <a href={ask} target="_blank" rel="noopener noreferrer" className="mt-5 flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3 text-sm font-semibold transition hover:bg-[#25D366]/15">
        <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Ask about this course
      </a>
    </div>
  );
}

function Inner() {
  const sp = useSearchParams();
  const [course, setCourse] = useState("");
  const [mode, setMode] = useState<Mode>("online");

  // links from the landing page can preselect a course or training type
  useEffect(() => {
    const c = sp.get("course");
    const m = sp.get("mode");
    if (c && COURSES.some((x) => x.id === c)) setCourse(c);
    if (m === "online" || m === "physical") setMode(m);
  }, [sp]);

  const selected = getCourse(course);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-cloud">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-flare-gradient opacity-25 blur-[90px]" />
        <div className="wrap relative py-10 sm:py-14">
          <Link href="/" className="text-sm font-medium text-muted hover:text-ink">← Back to home</Link>
          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider shadow-sm sm:text-xs">
            <span className="ax-live-dot" /> {ACADEMY.name} · Registration is open
          </span>
          <h1 className="font-display mt-5 max-w-2xl text-balance text-[32px] font-semibold leading-[1.1] sm:text-5xl">Register for your course</h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">Three quick steps. It takes about 2 minutes, and you won’t pay anything today.</p>

          <ol className="mt-8 grid gap-3 sm:grid-cols-3">
            {HOW.map((h) => (
              <li key={h.t} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-flare-50 text-flare-600"><h.icon className="h-5 w-5" /></span>
                <span><span className="block text-sm font-semibold">{h.t}</span><span className="block text-[13px] leading-snug text-muted">{h.d}</span></span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="wrap py-8 sm:py-12">
        {/* phones and tablets: collapsible summary above the form */}
        <details className="group mb-6 rounded-2xl border border-line bg-white lg:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
            <span className="min-w-0">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-flare-600">Your selection</span>
              <span className="block truncate text-sm font-semibold">{selected ? `${selected.title} · ${mode === "online" ? "Online" : "Physical"} · ${naira(FEES[mode])}` : "No course chosen yet"}</span>
            </span>
            <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-90" />
          </summary>
          <div className="border-t border-line p-3"><Summary course={course} mode={mode} /></div>
        </details>

        <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <aside className="hidden lg:sticky lg:top-28 lg:block">
            <Summary course={course} mode={mode} />
          </aside>
          <RegistrationForm course={course} mode={mode} onCourse={setCourse} onMode={setMode} />
        </div>
      </section>

      <section className="border-t border-line bg-cloud py-14 sm:py-20">
        <div className="wrap max-w-3xl">
          <Reveal><h2 className="font-display text-center text-3xl font-semibold">Questions people ask</h2></Reveal>
          <div className="mt-8 divide-y divide-line rounded-3xl border border-line bg-white">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group px-5 py-5 sm:px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q}<span className="text-xl text-flare-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Still unsure?{" "}
            <a href={`${SITE.whatsapp}?text=${encodeURIComponent("Hello FroshX Academy, I want to ask a question.")}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">Chat with us on WhatsApp</a>.
          </p>
        </div>
      </section>
    </>
  );
}

export default function RegisterExperience() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-flare-500" /></div>}>
      <Inner />
    </Suspense>
  );
}
