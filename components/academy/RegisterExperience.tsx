"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SITE } from "@/lib/site";
import { ACADEMY, COURSES, MODES, feeFor, getCourse, naira, Mode } from "@/lib/academy";
import { WhatsAppIcon, CheckIcon } from "../Icons";
import { AlertIcon, CalendarIcon, CertificateIcon, ChevronRightIcon, ClockIcon, COURSE_ICONS, MapPinIcon, WifiIcon } from "./AcademyIcons";
import RegistrationForm from "./RegistrationForm";
import { DRAFT_KEY } from "./SiteEffects";
import "./academy.css";

const FAQ = [
  ["Do I need experience?", "No. These are beginner courses."],
  ["How long is the course?", `${ACADEMY.weeks} weeks. You get a certificate when you complete it.`],
  ["How do I pay?", "After you register, the FroshX team contacts you about payment and any documents needed."],
  ["When does my class start?", "Start dates differ per student. We agree one with you."],
  ["Can I take more than one course?", "Yes. Register again for each course."],
  ["Where are physical classes?", "In Gombe. We confirm the venue after you register."],
];

const scrollToId = (id: string, delay = 60) =>
  setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), delay);

function StepHeading({ n, title, sub }: { n: number; title: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm font-semibold text-white">{n}</span>
      <div>
        <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{title}</h2>
        {sub && <p className="mt-1 text-sm text-muted sm:text-base">{sub}</p>}
      </div>
    </div>
  );
}

// Compact "your selection" card shown beside / above the form
function Summary({ course, mode }: { course: string; mode: Mode }) {
  const c = getCourse(course);
  if (!c) return null;
  const Icon = COURSE_ICONS[c.icon];
  return (
    <div className="rounded-3xl border border-line bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-flare-500 text-white"><Icon className="h-6 w-6" /></span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-flare-600">Your selection</p>
          <p className="font-display text-lg font-semibold leading-tight">{c.title}</p>
        </div>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm">
        <div><dt className="flex items-center gap-1.5 text-xs text-muted">{mode === "online" ? <WifiIcon className="h-3.5 w-3.5" /> : <MapPinIcon className="h-3.5 w-3.5" />} Training</dt><dd className="font-semibold">{mode === "online" ? "Online" : "Physical"}</dd></div>
        <div><dt className="text-xs text-muted">Course fee</dt><dd className="font-display text-lg font-semibold">{naira(feeFor(course, mode))}</dd></div>
        <div><dt className="flex items-center gap-1.5 text-xs text-muted"><ClockIcon className="h-3.5 w-3.5" /> Duration</dt><dd className="font-semibold">{ACADEMY.weeks} weeks</dd></div>
        <div><dt className="flex items-center gap-1.5 text-xs text-muted"><CertificateIcon className="h-3.5 w-3.5" /> Level</dt><dd className="font-semibold">Beginner + certificate</dd></div>
      </dl>
      <button type="button" onClick={() => scrollToId("choose-course", 0)} className="mt-5 text-sm font-semibold text-flare-700 underline">Change course</button>
    </div>
  );
}

function Inner() {
  const sp = useSearchParams();
  const [course, setCourse] = useState("");
  const [mode, setMode] = useState<Mode>("online");
  const [proceeded, setProceeded] = useState(false);

  // links from the landing page can preselect a course or training type
  useEffect(() => {
    const c = sp.get("course");
    const m = sp.get("mode");
    if (m === "online" || m === "physical") setMode(m);
    if (c && COURSES.some((x) => x.id === c)) {
      setCourse(c);
      scrollToId("course-details", 450);
    }
  }, [sp]);

  // coming back with an unfinished registration: reopen the form where they stopped
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw || new URLSearchParams(window.location.search).get("course")) return;
      const s = JSON.parse(raw);
      if (s?.form?.course && COURSES.some((x) => x.id === s.form.course)) {
        setCourse(s.form.course);
        if (s.form.mode === "online" || s.form.mode === "physical") setMode(s.form.mode);
        setProceeded(true);
        scrollToId("register-form", 600);
      }
    } catch {}
  }, []);

  const pick = (id: string) => {
    setCourse(id);
    scrollToId("course-details", 80);
  };
  const proceed = () => {
    setProceeded(true);
    scrollToId("register-form", 80);
  };
  const onRestore = useCallback(() => setProceeded(true), []);
  const toChoose = useCallback(() => scrollToId("choose-course", 0), []);

  const selected = getCourse(course);
  const Icon = selected ? COURSE_ICONS[selected.icon] : null;

  return (
    <>
      {/* header */}
      <section className="relative overflow-hidden border-b border-line bg-cloud">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-flare-gradient opacity-25 blur-[90px]" />
        <div className="wrap relative py-9 sm:py-14">
          <Link href="/" className="text-sm font-medium text-muted hover:text-ink">← Back to home</Link>
          <span className="mt-5 flex w-fit items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-wider shadow-sm sm:text-xs">
            <span className="ax-live-dot" /> Registration open
          </span>
          <h1 className="font-display mt-5 max-w-2xl text-balance text-[32px] font-semibold leading-[1.1] sm:text-5xl">Register for FroshX Academy</h1>
          <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">{ACADEMY.weeks}-week beginner courses. Certificate included.</p>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm font-medium">
            <li className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2"><ClockIcon className="h-4 w-4 text-flare-600" /> {ACADEMY.weeks} weeks</li>
            <li className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2"><CheckIcon className="h-4 w-4 text-flare-600" /> Beginner friendly</li>
            <li className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2"><CertificateIcon className="h-4 w-4 text-flare-600" /> Certificate</li>
          </ul>
          <div className="mt-6 flex max-w-xl gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
            <p><b>Please don’t register if you’re not serious about learning.</b></p>
          </div>
        </div>
      </section>

      <div className="wrap py-10 sm:py-14">
        {/* 1. choose */}
        <section id="choose-course" className="scroll-mt-24">
          <StepHeading n={1} title="Choose your course" sub="Tap a course to see what you will learn." />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COURSES.map((c) => {
              const I = COURSE_ICONS[c.icon];
              const on = course === c.id;
              return (
                <button key={c.id} type="button" onClick={() => pick(c.id)} aria-pressed={on}
                  className={`flex flex-col items-start rounded-2xl border p-4 text-left transition ${on ? "border-flare-500 bg-flare-50 shadow-[0_0_0_3px_rgba(249,115,22,.15)]" : "border-line bg-white hover:-translate-y-0.5 hover:border-flare-300 hover:shadow-soft"}`}>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${on ? "bg-flare-500 text-white" : "bg-cloud text-flare-600"}`}><I className="h-5 w-5" /></span>
                  <span className="font-display mt-3 text-[15px] font-semibold leading-snug">{c.title}</span>
                  <span className="mt-2 text-xs text-muted">Online {naira(c.fees.online)}<br />Physical {naira(c.fees.physical)}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. details */}
        {selected && Icon && (
          <section id="course-details" className="ax-rise mt-14 scroll-mt-24">
            <StepHeading n={2} title="About this course" />
            <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-flare-500 text-white"><Icon className="h-7 w-7" /></span>
                  <div>
                    <h3 className="font-display text-2xl font-semibold leading-tight">{selected.title}</h3>
                    <p className="mt-1 text-sm text-muted">{selected.blurb}</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs font-semibold sm:text-sm">
                  <span className="rounded-xl bg-cloud px-2 py-3"><ClockIcon className="mx-auto mb-1 h-5 w-5 text-flare-600" />{ACADEMY.weeks} weeks</span>
                  <span className="rounded-xl bg-cloud px-2 py-3"><CheckIcon className="mx-auto mb-1 h-5 w-5 text-flare-600" />Beginner</span>
                  <span className="rounded-xl bg-cloud px-2 py-3"><CertificateIcon className="mx-auto mb-1 h-5 w-5 text-flare-600" />Certificate</span>
                </div>
                <p className="mt-6 text-[11px] font-bold uppercase tracking-wider text-ink/50">Skills you will gain</p>
                <ul className="mt-3 space-y-3">
                  {selected.skills.map((s) => (
                    <li key={s} className="flex items-start gap-3 text-[15px] leading-snug">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-flare-100 text-flare-700"><CheckIcon className="h-3 w-3" /></span>{s}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 rounded-2xl bg-flare-50 px-4 py-3.5 text-sm leading-snug"><b>By the end:</b> {selected.outcome}</p>
              </div>

              <div className="rounded-3xl border border-line bg-white p-6 sm:p-8 lg:self-start">
                <p className="font-display text-lg font-semibold">How do you want to learn?</p>
                <div className="mt-4 space-y-3" role="radiogroup" aria-label="Training type">
                  {MODES.map((m) => {
                    const on = mode === m.id;
                    const I = m.id === "online" ? WifiIcon : MapPinIcon;
                    return (
                      <button key={m.id} type="button" role="radio" aria-checked={on} onClick={() => setMode(m.id)}
                        className={`w-full rounded-2xl border p-4 text-left transition ${on ? "border-flare-500 bg-flare-50 shadow-[0_0_0_3px_rgba(249,115,22,.15)]" : "border-line hover:border-flare-300"}`}>
                        <span className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 font-semibold"><I className="h-5 w-5 text-flare-600" />{m.id === "online" ? "Online" : "Physical"}</span>
                          <span className="font-display text-xl font-semibold">{naira(selected.fees[m.id])}</span>
                        </span>
                        <span className="mt-1.5 block text-[13px] leading-snug text-muted">{m.note}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 flex items-center gap-2 text-xs text-muted"><CalendarIcon className="h-4 w-4" /> Start dates are flexible.</p>
                <button type="button" onClick={proceed} className="ax-shimmer-btn mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-white transition hover:bg-flare-600">
                  Continue to registration <ChevronRightIcon className="h-4 w-4" />
                </button>
                <a href={`${SITE.whatsapp}?text=${encodeURIComponent(`Hello FroshX Academy, I want clarification about the ${selected.title} course (${mode}).`)}`} target="_blank" rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-3 text-sm font-semibold transition hover:bg-[#25D366]/15">
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Ask a question first
                </a>
              </div>
            </div>
          </section>
        )}

        {/* 3. register */}
        {selected && proceeded && (
          <section id="register-form" className="ax-rise mt-14 scroll-mt-24">
            <StepHeading n={3} title="Your details" sub="Takes about 2 minutes." />
            <details className="group mt-6 rounded-2xl border border-line bg-white lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                <span className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-flare-600">Your selection</span>
                  <span className="block truncate text-sm font-semibold">{selected.title} · {mode === "online" ? "Online" : "Physical"} · {naira(feeFor(course, mode))}</span>
                </span>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-90" />
              </summary>
              <div className="border-t border-line p-3"><Summary course={course} mode={mode} /></div>
            </details>

            <div className="mt-6 grid items-start gap-8 lg:grid-cols-[0.7fr_1.3fr]">
              <aside className="hidden lg:sticky lg:top-28 lg:block"><Summary course={course} mode={mode} /></aside>
              <RegistrationForm course={course} mode={mode} onCourse={setCourse} onMode={setMode} onRestore={onRestore} onChangeCourse={toChoose} />
            </div>
          </section>
        )}
      </div>

      <section className="border-t border-line bg-cloud py-14 sm:py-16">
        <div className="wrap max-w-3xl">
          <h2 className="font-display text-center text-3xl font-semibold">Quick answers</h2>
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
            Still unsure? <a href={`${SITE.whatsapp}?text=${encodeURIComponent("Hello FroshX Academy, I want to ask a question.")}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">Chat on WhatsApp</a>
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
