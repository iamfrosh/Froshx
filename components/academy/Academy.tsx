"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { ACADEMY, COURSES, FEES, MODES, naira, Mode } from "@/lib/academy";
import { WhatsAppIcon, CheckIcon, ArrowUpRightIcon } from "../Icons";
import {
  CertificateIcon, ClockIcon, COURSE_ICONS, MapPinIcon, RocketIcon, TargetIcon, UsersIcon, WifiIcon, CalendarIcon,
} from "./AcademyIcons";
import RegistrationForm from "./RegistrationForm";
import Reveal from "./Reveal";
import "./academy.css";

const PERKS = [
  { icon: TargetIcon, title: "Skills first", text: "Every week ends with something you built, not just something you read." },
  { icon: CertificateIcon, title: "Certificate on completion", text: "A FroshX Academy certificate you can add to your CV and LinkedIn." },
  { icon: ClockIcon, title: "Just 6 weeks", text: "Short, focused and practical. You can finish while studying or working." },
  { icon: CalendarIcon, title: "Flexible start dates", text: "Not everyone starts together. We agree a start date that suits you." },
  { icon: UsersIcon, title: "Learn from practitioners", text: "Taught by the working team behind real FroshX websites and brands." },
  { icon: RocketIcon, title: "Online or physical", text: "Learn from home or join an in-person class in Gombe." },
];

const STEPS = [
  { n: "1", t: "Register in 2 minutes", d: "Choose your course and training type, then tell us a little about you." },
  { n: "2", t: "We confirm your seat", d: "Our team contacts you on WhatsApp or by phone and agrees your start date." },
  { n: "3", t: "Learn, build, get certified", d: `Six weeks of hands-on training, then your FroshX Academy certificate.` },
];

const FAQ = [
  ["Do I need any experience?", "No. Every course starts from the basics. Tell us your level in the form and we will place you properly."],
  ["How much do the courses cost?", `Online training is ${naira(FEES.online)} and physical training is ${naira(FEES.physical)}, per course, per student. You pay after we confirm your seat.`],
  ["When does my course start?", "Start dates can differ from one student to another. After you register, we agree a date that works for you."],
  ["Will I get a certificate?", `Yes. Complete the ${ACADEMY.weeks} weeks and you receive a FroshX Academy certificate.`],
  ["Can I register for more than one course?", "Yes. Each registration is for one course, so simply register again for another."],
  ["Where are the physical classes?", "Physical training holds in Gombe. We confirm the venue with you after registration."],
];

export default function Academy() {
  const [course, setCourse] = useState("");
  const [mode, setMode] = useState<Mode>("online");

  const pick = (id: string) => {
    setCourse(id);
    document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const ask = `${SITE.whatsapp}?text=${encodeURIComponent("Hello FroshX Academy, I want to ask a question about the courses.")}`;

  return (
    <section id="academy" className="relative scroll-mt-20 overflow-hidden border-b border-line bg-cloud">
      <div aria-hidden className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-flare-gradient opacity-20 blur-[90px]" />
      <div aria-hidden className="pointer-events-none absolute -right-24 bottom-40 h-80 w-80 rounded-full bg-flare-gradient opacity-15 blur-[100px]" />

      <div className="wrap relative py-20 md:py-28">
        {/* intro */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-ink shadow-sm">
              <span className="ax-live-dot" /> {ACADEMY.name} · Registration is open
            </span>
            <h2 className="font-display mt-6 text-balance text-4xl font-semibold leading-[1.08] md:text-6xl">
              Learn a skill that pays, <span className="bg-flare-gradient bg-clip-text text-transparent">in just 6 weeks.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted">
              Practical, beginner-friendly courses in tech and design. Learn by building real things, finish with a certificate, and start earning from your new skill.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href="#register" className="ax-shimmer-btn group inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-semibold text-white transition hover:bg-flare-600">
                Register now
                <ArrowUpRightIcon className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a href={ask} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-6 py-4 font-semibold transition hover:border-[#25D366]">
                <WhatsAppIcon className="h-5 w-5 text-[#25D366]" /> Ask a question
              </a>
            </div>
            <ul className="mx-auto mt-9 flex max-w-xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-ink/80">
              <li className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-flare-600" /> {ACADEMY.weeks} weeks</li>
              <li className="flex items-center gap-2"><CertificateIcon className="h-4 w-4 text-flare-600" /> Certificate included</li>
              <li className="flex items-center gap-2"><WifiIcon className="h-4 w-4 text-flare-600" /> Online</li>
              <li className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-flare-600" /> Physical</li>
            </ul>
          </div>
        </Reveal>

        {/* fees */}
        <Reveal delay={80}>
          <div className="mx-auto mt-14 grid max-w-3xl gap-4 sm:grid-cols-2">
            {MODES.map((m) => {
              const on = mode === m.id;
              const Icon = m.id === "online" ? WifiIcon : MapPinIcon;
              return (
                <button key={m.id} onClick={() => setMode(m.id)} aria-pressed={on}
                  className={`relative overflow-hidden rounded-3xl border p-6 text-left transition ${on ? "border-ink bg-ink text-white shadow-soft" : "border-line bg-white hover:border-flare-300"}`}>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${on ? "bg-white/10 text-flare-300" : "bg-flare-50 text-flare-600"}`}><Icon className="h-5 w-5" /></span>
                  <p className={`mt-4 text-xs font-bold uppercase tracking-wider ${on ? "text-flare-300" : "text-flare-600"}`}>{m.label}</p>
                  <p className="font-display mt-1 text-4xl font-semibold">{naira(FEES[m.id])}</p>
                  <p className={`mt-1 text-sm ${on ? "text-white/60" : "text-muted"}`}>Per course, per student</p>
                </button>
              );
            })}
          </div>
        </Reveal>

        {/* courses */}
        <div className="mt-24">
          <Reveal>
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-flare-600">Available courses</p>
              <h3 className="font-display mt-3 text-balance text-3xl font-semibold md:text-4xl">Pick the skill you want to walk away with.</h3>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COURSES.map((c, i) => {
              const Icon = COURSE_ICONS[c.icon];
              return (
                <Reveal key={c.id} delay={(i % 3) * 90}>
                  <article className="group flex h-full flex-col rounded-3xl border border-line bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-flare-300 hover:shadow-soft">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-flare-50 text-flare-600 transition-colors duration-300 group-hover:bg-flare-500 group-hover:text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h4 className="font-display mt-5 text-xl font-semibold">{c.title}</h4>
                    <p className="mt-1.5 text-[15px] text-muted">{c.blurb}</p>
                    <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-ink/50">Skills you will gain</p>
                    <ul className="mt-3 space-y-2.5">
                      {c.skills.map((s) => (
                        <li key={s} className="flex items-start gap-2.5 text-sm leading-snug">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-flare-100 text-flare-700"><CheckIcon className="h-2.5 w-2.5" /></span>
                          {s}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 rounded-xl bg-cloud px-3.5 py-3 text-[13px] leading-snug text-ink/80"><b>By the end:</b> {c.outcome}</p>
                    <button onClick={() => pick(c.id)} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink px-5 py-3 text-sm font-semibold transition hover:bg-ink hover:text-white">
                      Register for this course
                    </button>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* perks */}
        <div className="mt-24 rounded-[32px] bg-ink px-6 py-12 text-white sm:px-12 md:py-16">
          <Reveal>
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-flare-300">What you get</p>
              <h3 className="font-display mt-3 text-balance text-3xl font-semibold md:text-4xl">Built around skills, not just certificates.</h3>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 80}>
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-flare-300"><p.icon className="h-5 w-5" /></span>
                  <div>
                    <p className="font-semibold">{p.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/60">{p.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* how it works + form */}
        <div id="register" className="mt-24 scroll-mt-24 grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:sticky lg:top-28">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-wider text-flare-600">Register</p>
              <h3 className="font-display mt-3 text-balance text-3xl font-semibold md:text-4xl">Secure your seat today.</h3>
              <p className="mt-4 leading-relaxed text-muted">It takes about two minutes. You are only registering your interest right now. There is no payment on this form.</p>
              <ol className="mt-8 space-y-6">
                {STEPS.map((s) => (
                  <li key={s.n} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-flare-500 font-bold text-white">{s.n}</span>
                    <span>
                      <span className="block font-semibold">{s.t}</span>
                      <span className="block text-sm leading-relaxed text-muted">{s.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
          <Reveal delay={100}>
            <RegistrationForm course={course} mode={mode} onCourse={setCourse} onMode={setMode} />
          </Reveal>
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-24 max-w-3xl">
          <Reveal>
            <h3 className="font-display text-center text-3xl font-semibold">Questions people ask</h3>
          </Reveal>
          <div className="mt-8 divide-y divide-line rounded-3xl border border-line bg-white">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                  {q}
                  <span className="text-xl text-flare-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-[15px] leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Still unsure?{" "}
            <a href={ask} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline">Chat with us on WhatsApp</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
