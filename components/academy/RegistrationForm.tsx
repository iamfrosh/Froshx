"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SITE } from "@/lib/site";
import { ACADEMY, AGE_RANGES, DEVICES, EDUCATION, EXPERIENCE, GENDERS, SOURCES, feeFor, getCourse, naira, Mode } from "@/lib/academy";
import { Errors, RegistrationInput, validateAll, validateStep } from "@/lib/validate";
import { WhatsAppIcon, CheckIcon } from "../Icons";
import { AlertIcon, BellIcon, ChevronLeftIcon, ChevronRightIcon } from "./AcademyIcons";
import SuccessCard, { RegResult } from "./SuccessCard";
import { DRAFT_KEY, REMIND_KEY } from "./SiteEffects";

type Props = {
  course: string;
  mode: Mode;
  onCourse: (id: string) => void;
  onMode: (m: Mode) => void;
  onRestore?: () => void;
  onChangeCourse?: () => void;
};

const EMPTY: RegistrationInput = {
  course: "", mode: "online", fullName: "", email: "", phone: "", gender: "", ageRange: "", location: "", education: "",
  device: "", experience: "", startAsap: false, preferredStart: "", goal: "", source: "", committed: false, consent: false, website: "",
};

const STEPS = ["Your details", "Final step"];

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

export default function RegistrationForm({ course, mode, onCourse, onMode, onRestore, onChangeCourse }: Props) {
  const [d, setD] = useState<RegistrationInput>(EMPTY);
  const [step, setStep] = useState<1 | 2>(1);
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
  const fee = feeFor(course, mode);

  // step 1 of this form = details (validated as step 2), step 2 = final (validated as step 3)
  const check = (s: 1 | 2) => validateStep((s + 1) as 2 | 3, data);

  // ---- restore an unfinished registration
  useEffect(() => {
    draftId.current = "d" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    try {
      setRemindOn(localStorage.getItem(REMIND_KEY) === "on" && "Notification" in window && Notification.permission === "granted");
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!s?.form || !s.form.course) return;
      draftId.current = s.draftId || draftId.current;
      setD({ ...EMPTY, ...s.form, committed: false, consent: false });
      onCourse(s.form.course);
      if (s.form.mode) onMode(s.form.mode);
      setStep(s.step === 2 ? 2 : 1);
      touched.current = true;
      setRestored(true);
      onRestore?.();
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- save progress locally (for reminders) and to the server (so we can follow up)
  useEffect(() => {
    if (!touched.current || result) return;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ draftId: draftId.current, updatedAt: Date.now(), name: d.fullName, course, step, form: { ...d, course, mode, committed: false, consent: false } })
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

  const scrollTop = () => setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);

  const goto = (s: 1 | 2) => { touched.current = true; setStep(s); scrollTop(); };

  const next = () => {
    const e = check(1);
    setErrors(e);
    if (Object.keys(e).length) return;
    goto(2);
  };

  const enableReminders = async () => {
    setRemindMsg("");
    if (!("Notification" in window)) {
      setRemindMsg("This browser can’t show notifications. We’ll still show a reminder when you return.");
      return;
    }
    const p = await Notification.requestPermission();
    if (p === "granted") {
      try { localStorage.setItem(REMIND_KEY, "on"); } catch {}
      try { if ("serviceWorker" in navigator) await navigator.serviceWorker.register("/fx-sw.js"); } catch {}
      setRemindOn(true);
    } else {
      setRemindMsg("Notifications are blocked. You can allow them in your browser settings.");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const all = validateAll(data);
    setErrors(all);
    if (Object.keys(all).length) {
      if (all.course || all.mode) { onChangeCourse?.(); return; }
      goto(Object.keys(check(1)).length ? 1 : 2);
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
      scrollTop();
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
    onChangeCourse?.();
  };

  const startOver = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setD(EMPTY); setStep(1); setErrors({}); setRestored(false);
    touched.current = false;
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
        <SuccessCard result={result} name={d.fullName} email={d.email} start={start} onAnother={reset} />
      </div>
    );
  }

  return (
    <div ref={topRef} className="scroll-mt-28 rounded-[28px] border border-line bg-white p-5 shadow-soft sm:p-9">
      {/* stepper */}
      <ol className="mb-7 flex items-center gap-2" aria-label="Registration progress">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = step > n;
          const active = step === n;
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ${done ? "bg-flare-500 text-white" : active ? "bg-ink text-white" : "bg-cloud text-muted"}`}>
                {done ? <CheckIcon className="h-4 w-4" /> : n}
              </span>
              <span className={`text-sm font-medium ${active ? "text-ink" : "text-muted"}`}>{label}</span>
              {n < STEPS.length && <span className={`h-0.5 flex-1 rounded-full transition-colors ${done ? "bg-flare-500" : "bg-line"}`} />}
            </li>
          );
        })}
      </ol>

      {restored && (
        <div className="ax-rise mb-6 flex items-start justify-between gap-3 rounded-2xl border border-flare-100 bg-flare-50 p-4 text-sm">
          <p><b>Welcome back{d.fullName ? `, ${d.fullName.split(" ")[0]}` : ""}!</b> Your answers were saved.</p>
          <button onClick={startOver} className="shrink-0 font-semibold text-flare-700 underline">Start over</button>
        </div>
      )}

      <form onSubmit={submit} noValidate>
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>Website<input tabIndex={-1} autoComplete="off" value={d.website || ""} onChange={(e) => set("website", e.target.value)} /></label>
        </div>

        {step === 1 && (
          <div className="ax-rise space-y-5">
            <h3 className="font-display text-xl font-semibold">About you</h3>
            <Field label="Full name" htmlFor="fullName" error={errors.fullName}>
              <input id="fullName" className={cls("fullName")} autoComplete="name" placeholder="e.g. Amina Yusuf" value={d.fullName} onChange={(e) => set("fullName", e.target.value)} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Email address" htmlFor="email" error={errors.email} hint="Your confirmation is sent here.">
                <input id="email" type="email" inputMode="email" autoComplete="email" className={cls("email")} placeholder="you@email.com" value={d.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Phone / WhatsApp" htmlFor="phone" error={errors.phone}>
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
              <Field label="Where do you live?" htmlFor="location" error={errors.location} hint="Town and state">
                <input id="location" className={cls("location")} autoComplete="address-level2" placeholder="Gombe, Gombe State" value={d.location} onChange={(e) => set("location", e.target.value)} />
              </Field>
              <Field label="Education level" htmlFor="education" error={errors.education}>
                <select id="education" className={cls("education")} value={d.education} onChange={(e) => set("education", e.target.value)}>
                  <option value="">Select</option>{EDUCATION.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="ax-rise space-y-5">
            <h3 className="font-display text-xl font-semibold">Almost done</h3>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-cloud p-4 text-sm">
              <span><b>{selected?.title}</b> · {mode === "online" ? "Online" : "Physical"} · <b>{naira(fee)}</b></span>
              <button type="button" onClick={onChangeCourse} className="ml-auto font-semibold text-flare-700 underline">Change</button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="What will you learn on?" htmlFor="device" error={errors.device}>
                <select id="device" className={cls("device")} value={d.device} onChange={(e) => set("device", e.target.value)}>
                  <option value="">Select</option>{DEVICES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Your experience" htmlFor="experience" error={errors.experience}>
                <select id="experience" className={cls("experience")} value={d.experience} onChange={(e) => set("experience", e.target.value)}>
                  <option value="">Select</option>{EXPERIENCE.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Preferred start</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`flex min-h-[50px] cursor-pointer items-center gap-3 rounded-2xl border px-4 transition ${d.startAsap ? "border-flare-500 bg-flare-50" : "border-line"}`}>
                  <input type="checkbox" className="h-4 w-4 accent-[#F97316]" checked={d.startAsap} onChange={(e) => set("startAsap", e.target.checked)} />
                  <span className="text-sm font-medium">As soon as possible</span>
                </label>
                <input type="date" aria-label="Preferred start date" min={tomorrow} disabled={d.startAsap} className={`${cls("preferredStart")} disabled:opacity-50`} value={d.preferredStart} onChange={(e) => set("preferredStart", e.target.value)} />
              </div>
              {errors.preferredStart && <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{errors.preferredStart}</p>}
              <p className="mt-1.5 text-xs text-muted">Start dates differ per student. We will confirm yours.</p>
            </div>

            <Field label="Why do you want to learn this? (optional)" htmlFor="goal">
              <textarea id="goal" rows={3} maxLength={500} className="ax-input resize-none" value={d.goal} onChange={(e) => set("goal", e.target.value)} />
            </Field>
            <Field label="How did you hear about us? (optional)" htmlFor="source">
              <select id="source" className="ax-input" value={d.source} onChange={(e) => set("source", e.target.value)}>
                <option value="">Select</option>{SOURCES.map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>

            <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              <AlertIcon className="mt-0.5 h-5 w-5 shrink-0" />
              <p><b>Please don’t register if you’re not serious about learning.</b> This is a {ACADEMY.weeks}-week course and we want committed students.</p>
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#F97316]" checked={d.committed} onChange={(e) => set("committed", e.target.checked)} />
              <span className="leading-relaxed">I’m serious about learning and ready to commit to the {ACADEMY.weeks} weeks.</span>
            </label>
            {errors.committed && <p role="alert" className="-mt-3 text-xs font-medium text-red-600">{errors.committed}</p>}
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#F97316]" checked={d.consent} onChange={(e) => set("consent", e.target.checked)} />
              <span className="leading-relaxed text-muted">FroshX may contact me about this registration and keep my details to run the course.</span>
            </label>
            {errors.consent && <p role="alert" className="-mt-3 text-xs font-medium text-red-600">{errors.consent}</p>}
          </div>
        )}

        {serverError && <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          {step > 1 ? (
            <button type="button" onClick={() => goto(1)} className="inline-flex items-center justify-center gap-1 rounded-full px-4 py-3 text-sm font-semibold text-muted transition hover:text-ink">
              <ChevronLeftIcon className="h-4 w-4" /> Back
            </button>
          ) : <span className="hidden sm:block" />}
          {step < 2 ? (
            <button type="button" onClick={next} className="ax-shimmer-btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-white transition hover:bg-flare-600 sm:w-auto">
              Continue <ChevronRightIcon className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" disabled={submitting} className="ax-shimmer-btn inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-7 py-4 font-semibold text-white transition hover:bg-flare-600 disabled:opacity-60 sm:w-auto">
              {submitting ? (<><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Submitting…</>) : "Complete registration"}
            </button>
          )}
        </div>
      </form>

      <div className="mt-8 space-y-3 border-t border-line pt-6">
        <a href={waAsk} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 px-4 py-3 transition hover:bg-[#25D366]/15">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white"><WhatsAppIcon className="h-5 w-5" /></span>
          <span><span className="block text-sm font-semibold">Need clarification first?</span><span className="block text-[13px] text-muted">Ask us on WhatsApp.</span></span>
        </a>
        {!remindOn && (
          <button type="button" onClick={enableReminders} className="flex w-full items-center gap-3 rounded-2xl border border-line px-4 py-3 text-left transition hover:border-flare-300">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-flare-50 text-flare-600"><BellIcon className="h-5 w-5" /></span>
            <span><span className="block text-sm font-semibold">Remind me if I don’t finish</span><span className="block text-[13px] text-muted">A nudge every {ACADEMY.reminderMinutes} minutes.</span></span>
          </button>
        )}
        {remindOn && <p className="flex items-center gap-2 text-[13px] text-green-700"><BellIcon className="h-4 w-4" /> Reminders are on.</p>}
        {remindMsg && <p className="text-[13px] text-muted">{remindMsg}</p>}
      </div>
    </div>
  );
}
