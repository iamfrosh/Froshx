"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import {
  ACADEMY, AGE_RANGES, COURSES, DEVICES, EDUCATION, EXPERIENCE, FEES, GENDERS, MODES, SOURCES, getCourse, naira, Mode,
} from "@/lib/academy";
import { Errors, RegistrationInput, validateAll, validateStep } from "@/lib/validate";
import { WhatsAppIcon, CheckIcon } from "../Icons";
import { BellIcon, ChevronLeftIcon, ChevronRightIcon, COURSE_ICONS, MapPinIcon, WifiIcon } from "./AcademyIcons";
import SuccessCard, { RegResult } from "./SuccessCard";
import { DRAFT_KEY, REMIND_KEY } from "./SiteEffects";

type Props = { course: string; mode: Mode; onCourse: (id: string) => void; onMode: (m: Mode) => void };

const EMPTY: RegistrationInput = {
  course: "", mode: "online", fullName: "", email: "", phone: "", gender: "", ageRange: "", location: "", education: "",
  device: "", experience: "", startAsap: false, preferredStart: "", goal: "", source: "", consent: false, website: "",
};

const STEPS = ["Course", "Your details", "Your goals"];

function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: React.ReactNode; htmlFor: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}

export default function RegistrationForm({ course, mode, onCourse, onMode }: Props) {
  const [d, setD] = useState<RegistrationInput>(EMPTY);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [result, setResult] = useState<RegResult | null>(null);
  const [restored, setRestored] = useState(false);
  const [remindOn, setRemindOn] = useState(false);
  const [remindMsg, setRemindMsg] = useState("");
  const draftId = useRef("");
  const touched = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout>>();

  const data: RegistrationInput = { ...d, course, mode };
  const selected = getCourse(course);

  // ---- restore an unfinished registration
  useEffect(() => {
    draftId.current = "d" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    try {
      setRemindOn(localStorage.getItem(REMIND_KEY) === "on" && "Notification" in window && Notification.permission === "granted");
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!s?.form) return;
      draftId.current = s.draftId || draftId.current;
      setD({ ...EMPTY, ...s.form });
      if (s.form.course) onCourse(s.form.course);
      if (s.form.mode) onMode(s.form.mode);
      setStep(([1, 2, 3].includes(s.step) ? s.step : 1) as 1 | 2 | 3);
      touched.current = true;
      setRestored(true);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- save progress locally (for reminders) and to the server (so we can follow up)
  useEffect(() => {
    if (!touched.current || result) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ draftId: draftId.current, updatedAt: Date.now(), name: d.fullName, course, step, form: { ...d, course, mode, consent: false } })
      );
    } catch {}
    clearTimeout(syncTimer.current);
    const digits = d.phone.replace(/\D/g, "");
    if (/^\S+@\S+\.\S+$/.test(d.email) || digits.length >= 10) {
      syncTimer.current = setTimeout(() => {
        fetch("/api/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ draftId: draftId.current, course, mode, fullName: d.fullName, email: d.email, phone: d.phone, step }),
        }).catch(() => {});
      }, 1500);
    }
    return () => clearTimeout(syncTimer.current);
  }, [d, course, mode, step, result]);

  const set = useCallback(<K extends keyof RegistrationInput>(key: K, value: RegistrationInput[K]) => {
    touched.current = true;
    setD((p) => ({ ...p, [key]: value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  }, []);

  const goto = (s: 1 | 2 | 3) => {
    touched.current = true;
    setStep(s);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const next = () => {
    const e = validateStep(step, data);
    setErrors(e);
    if (Object.keys(e).length) return;
    goto((step + 1) as 2 | 3);
  };

  const enableReminders = async () => {
    setRemindMsg("");
    if (!("Notification" in window)) {
      setRemindMsg("This browser can’t show notifications. We’ll still show a reminder banner when you return.");
      return;
    }
    const p = await Notification.requestPermission();
    if (p === "granted") {
      try { localStorage.setItem(REMIND_KEY, "on"); } catch {}
      try { if ("serviceWorker" in navigator) await navigator.serviceWorker.register("/fx-sw.js"); } catch {}
      setRemindOn(true);
    } else {
      setRemindMsg("Notifications are blocked. You can turn them on in your browser settings.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const all = validateAll(data);
    setErrors(all);
    if (Object.keys(all).length) {
      goto(Object.keys(validateStep(1, data)).length ? 1 : Object.keys(validateStep(2, data)).length ? 2 : 3);
      return;
    }
    setSubmitting(true);
    setServerError("");
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, draftId: draftId.current }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (json.errors) setErrors(json.errors);
        setServerError(json.error || "Something went wrong. Please try again.");
        return;
      }
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      touched.current = false;
      setResult(json as RegResult);
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      setServerError("We couldn’t reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setD(EMPTY); setStep(1); setResult(null); setErrors({}); setRestored(false);
    touched.current = false;
    draftId.current = "d" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  };

  const startOver = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    reset();
  };

  const waAsk = `${SITE.whatsapp}?text=${encodeURIComponent(
    selected ? `Hello FroshX Academy, I want clarification about the ${selected.title} course (${mode}).` : "Hello FroshX Academy, I want to ask a question before I register."
  )}`;

  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  const cls = (k: keyof RegistrationInput) => `ax-input ${errors[k] ? "ax-bad" : ""}`;

  if (result) {
    const start = data.startAsap ? "As soon as possible" : data.preferredStart ? new Date(data.preferredStart + "T00:00:00").toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "To be agreed";
    return (
      <div ref={topRef} className="scroll-mt-28">
        <SuccessCard result={result} name={d.fullName} start={start} onAnother={reset} />
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-28 rounded-[28px] border border-line bg-white p-5 shadow-soft sm:p-9">
      {/* stepper */}
      <ol className="mb-8 flex items-center gap-2" aria-label="Registration progress">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${done ? "bg-flare-500 text-white" : active ? "bg-ink text-white" : "bg-cloud text-muted"}`}>
                {done ? <CheckIcon className="h-4 w-4" /> : n}
              </span>
              <span className={`hidden text-sm font-medium sm:block ${active ? "text-ink" : "text-muted"}`}>{label}</span>
              {n < 3 && <span className={`h-0.5 flex-1 rounded-full transition-colors ${done ? "bg-flare-500" : "bg-line"}`} />}
            </li>
          );
        })}
      </ol>

      {restored && (
        <div className="ax-rise mb-6 flex items-start justify-between gap-3 rounded-2xl border border-flare-100 bg-flare-50 p-4 text-sm">
          <p><b>Welcome back{d.fullName ? `, ${d.fullName.split(" ")[0]}` : ""}!</b> We saved your answers. Continue where you stopped.</p>
          <button onClick={startOver} className="shrink-0 font-semibold text-flare-700 underline">Start over</button>
        </div>
      )}

      <form onSubmit={submit} noValidate>
        {/* honeypot */}
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website<input tabIndex={-1} autoComplete="off" value={d.website || ""} onChange={(e) => set("website", e.target.value)} /></label>
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="ax-rise space-y-7">
            <div>
              <h3 className="font-display text-xl font-semibold">Which course do you want to take?</h3>
              <p className="mt-1 text-sm text-muted">One course per registration. You can register again for another.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Course">
                {COURSES.map((c) => {
                  const Icon = COURSE_ICONS[c.icon];
                  const on = course === c.id;
                  return (
                    <button key={c.id} type="button" role="radio" aria-checked={on}
                      onClick={() => { touched.current = true; onCourse(c.id); setErrors((p) => ({ ...p, course: undefined })); }}
                      className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${on ? "border-flare-500 bg-flare-50 shadow-[0_0_0_3px_rgba(249,115,22,.15)]" : "border-line hover:border-flare-300"}`}>
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${on ? "bg-flare-500 text-white" : "bg-cloud text-flare-600"}`}><Icon className="h-5 w-5" /></span>
                      <span className="text-sm font-semibold leading-snug">{c.title}</span>
                    </button>
                  );
                })}
              </div>
              {errors.course && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{errors.course}</p>}
            </div>

            <div>
              <h3 className="font-display text-xl font-semibold">How do you want to learn?</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Training type">
                {MODES.map((m) => {
                  const on = mode === m.id;
                  const Icon = m.id === "online" ? WifiIcon : MapPinIcon;
                  return (
                    <button key={m.id} type="button" role="radio" aria-checked={on}
                      onClick={() => { touched.current = true; onMode(m.id); }}
                      className={`rounded-2xl border p-4 text-left transition ${on ? "border-flare-500 bg-flare-50 shadow-[0_0_0_3px_rgba(249,115,22,.15)]" : "border-line hover:border-flare-300"}`}>
                      <span className="flex items-center justify-between">
                        <span className="flex items-center gap-2 font-semibold"><Icon className="h-5 w-5 text-flare-600" />{m.label}</span>
                        <span className="font-display text-lg font-semibold">{naira(FEES[m.id])}</span>
                      </span>
                      <span className="mt-1.5 block text-[13px] leading-relaxed text-muted">{m.note}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-muted">Fee is per course, per student. No payment is taken on this form.</p>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="ax-rise space-y-5">
            <div>
              <h3 className="font-display text-xl font-semibold">Tell us about you</h3>
              <p className="mt-1 text-sm text-muted">We use this to reach you and place you in the right class.</p>
            </div>
            <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
              <input id="fullName" className={cls("fullName")} autoComplete="name" placeholder="e.g. Amina Yusuf" value={d.fullName} onChange={(e) => set("fullName", e.target.value)} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email address" htmlFor="email" error={errors.email}>
                <input id="email" type="email" inputMode="email" autoComplete="email" className={cls("email")} placeholder="you@email.com" value={d.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Phone / WhatsApp number" htmlFor="phone" error={errors.phone} hint="We will contact you on this number.">
                <input id="phone" type="tel" inputMode="tel" autoComplete="tel" className={cls("phone")} placeholder="0704 000 0000" value={d.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Age range" htmlFor="ageRange" error={errors.ageRange}>
                <select id="ageRange" className={cls("ageRange")} value={d.ageRange} onChange={(e) => set("ageRange", e.target.value)}>
                  <option value="">Select</option>{AGE_RANGES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Gender (optional)" htmlFor="gender">
                <select id="gender" className="ax-input" value={d.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Select</option>{GENDERS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Where do you live?" htmlFor="location" error={errors.location} hint="Town and state, e.g. Gombe, Gombe State">
                <input id="location" className={cls("location")} autoComplete="address-level2" placeholder="Town, State" value={d.location} onChange={(e) => set("location", e.target.value)} />
              </Field>
              <Field label="Education level" htmlFor="education" error={errors.education}>
                <select id="education" className={cls("education")} value={d.education} onChange={(e) => set("education", e.target.value)}>
                  <option value="">Select</option>{EDUCATION.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="ax-rise space-y-5">
            <div>
              <h3 className="font-display text-xl font-semibold">Last step: your goals</h3>
              <p className="mt-1 text-sm text-muted">Start dates are flexible. Tell us what suits you and we will confirm it.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-cloud p-4">
              <span className="text-sm"><b>{selected?.title}</b> · {mode === "online" ? "Online" : "Physical"} · <b>{naira(FEES[mode])}</b> · {ACADEMY.weeks} weeks</span>
              <button type="button" onClick={() => goto(1)} className="ml-auto text-sm font-semibold text-flare-700 underline">Change</button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="What will you learn on?" htmlFor="device" error={errors.device}>
                <select id="device" className={cls("device")} value={d.device} onChange={(e) => set("device", e.target.value)}>
                  <option value="">Select</option>{DEVICES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Your experience level" htmlFor="experience" error={errors.experience}>
                <select id="experience" className={cls("experience")} value={d.experience} onChange={(e) => set("experience", e.target.value)}>
                  <option value="">Select</option>{EXPERIENCE.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">When would you like to start?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${d.startAsap ? "border-flare-500 bg-flare-50" : "border-line"}`}>
                  <input type="checkbox" className="h-4 w-4 accent-[#F97316]" checked={d.startAsap} onChange={(e) => set("startAsap", e.target.checked)} />
                  <span className="text-sm font-medium">As soon as possible</span>
                </label>
                <input type="date" aria-label="Preferred start date" min={tomorrow} disabled={d.startAsap} className={`${cls("preferredStart")} disabled:opacity-50`} value={d.preferredStart} onChange={(e) => set("preferredStart", e.target.value)} />
              </div>
              {errors.preferredStart && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{errors.preferredStart}</p>}
            </div>

            <Field label="What do you want to achieve? (optional)" htmlFor="goal" hint="A job, a side income, a business, school work…">
              <textarea id="goal" rows={3} maxLength={500} className="ax-input resize-none" value={d.goal} onChange={(e) => set("goal", e.target.value)} />
            </Field>
            <Field label="How did you hear about us? (optional)" htmlFor="source">
              <select id="source" className="ax-input" value={d.source} onChange={(e) => set("source", e.target.value)}>
                <option value="">Select</option>{SOURCES.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>

            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 h-4 w-4 accent-[#F97316]" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} />
              <span className="leading-relaxed text-muted">I agree that FroshX Academy may contact me about this registration and keep my details to run the course.</span>
            </label>
            {errors.consent && <p role="alert" className="-mt-3 text-xs font-medium text-red-600">{errors.consent}</p>}
          </div>
        )}

        {serverError && (
          <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>
        )}

        {/* nav */}
        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button type="button" onClick={() => goto((step - 1) as 1 | 2)} className="inline-flex items-center gap-1 rounded-full px-4 py-3 text-sm font-semibold text-muted transition hover:text-ink">
              <ChevronLeftIcon className="h-4 w-4" /> Back
            </button>
          ) : <span />}
          {step < 3 ? (
            <button type="button" onClick={next} className="ax-shimmer-btn inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-white transition hover:bg-flare-600">
              Continue <ChevronRightIcon className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="ax-shimmer-btn inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-white transition hover:bg-flare-600 disabled:opacity-60">
              {submitting ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Submitting…</>) : "Complete registration"}
            </button>
          )}
        </div>
      </form>

      {/* help + reminders */}
      <div className="mt-8 space-y-3 border-t border-line pt-6">
        <a href={waAsk} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-3 transition hover:bg-[#25D366]/15">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon className="h-5 w-5" /></span>
          <span>
            <span className="block text-sm font-semibold">Need clarification first?</span>
            <span className="block text-[13px] text-muted">Ask us on WhatsApp before you register.</span>
          </span>
        </a>
        {step > 1 && !remindOn && (
          <button type="button" onClick={enableReminders} className="flex w-full items-center gap-3 rounded-2xl border border-line px-4 py-3 text-left transition hover:border-flare-300">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-flare-50 text-flare-600"><BellIcon className="h-5 w-5" /></span>
            <span>
              <span className="block text-sm font-semibold">Remind me if I don’t finish</span>
              <span className="block text-[13px] text-muted">We will nudge you every {ACADEMY.reminderMinutes} minutes until you complete it.</span>
            </span>
          </button>
        )}
        {remindOn && <p className="flex items-center gap-2 text-[13px] text-green-700"><BellIcon className="h-4 w-4" /> Reminders are on. We will nudge you every {ACADEMY.reminderMinutes} minutes if you don’t finish.</p>}
        {remindMsg && <p className="text-[13px] text-muted">{remindMsg}</p>}
      </div>
    </div>
  );
}
