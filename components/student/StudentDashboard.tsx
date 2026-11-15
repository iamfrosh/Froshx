"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SITE } from "@/lib/site";
import { ACADEMY, naira } from "@/lib/academy";
import { WhatsAppIcon, CheckIcon } from "../Icons";
import { CalendarIcon, CertificateIcon, ClockIcon, MapPinIcon, ShieldIcon, UsersIcon } from "../academy/AcademyIcons";
import "../academy/academy.css";

type Reg = { id: string; ref: string; courseTitle: string; mode: string; fee: number; status: string; preferredStart: string; startDate: string; adminNote: string; location: string; createdAt: string | null };
type Me = { student: { fullName: string; email: string; phone: string; mustChangePassword: boolean }; registrations: Reg[] };

const STEPS = ["Registered", "FroshX team contacts you", "Seat confirmed", "Class starts"];
// how many steps are complete for each status
const DONE: Record<string, number> = { new: 1, contacted: 2, confirmed: 3 };

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) : "");

function PasswordForm({ forced, onDone }: { forced: boolean; onDone: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);

  const strength = Math.min(4, (next.length >= 8 ? 1 : 0) + (next.length >= 12 ? 1 : 0) + (/[A-Z]/.test(next) && /[a-z]/.test(next) ? 1 : 0) + (/\d/.test(next) && /[^A-Za-z0-9]/.test(next) ? 1 : 0));
  const labels = ["Too short", "Weak", "Okay", "Good", "Strong"];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setOk(false);
    if (next.length < 8) { setError("Use at least 8 characters."); return; }
    if (next !== again) { setError("The two passwords don’t match."); return; }
    setBusy(true);
    const res = await fetch("/api/student/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current, next }) });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(json.error || "Could not change password."); return; }
    setOk(true); setCurrent(""); setNext(""); setAgain("");
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {!forced && (
        <div>
          <label htmlFor="cp" className="mb-2 block text-sm font-medium">Current password</label>
          <input id="cp" type={show ? "text" : "password"} autoComplete="current-password" className="ax-input" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </div>
      )}
      <div>
        <label htmlFor="np" className="mb-2 block text-sm font-medium">New password</label>
        <input id="np" type={show ? "text" : "password"} autoComplete="new-password" className="ax-input" value={next} onChange={(e) => setNext(e.target.value)} />
        {next && (
          <div className="mt-2">
            <div className="flex gap-1.5">{[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength ? (strength <= 1 ? "bg-red-400" : strength === 2 ? "bg-amber-400" : "bg-green-500") : "bg-line"}`} />)}</div>
            <p className="mt-1 text-xs text-muted">{labels[strength]}</p>
          </div>
        )}
      </div>
      <div>
        <label htmlFor="ap" className="mb-2 block text-sm font-medium">Repeat new password</label>
        <input id="ap" type={show ? "text" : "password"} autoComplete="new-password" className="ax-input" value={again} onChange={(e) => setAgain(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" className="accent-[#F97316]" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords</label>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {ok && <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Password updated.</p>}
      <button disabled={busy} className="ax-shimmer-btn w-full rounded-full bg-ink py-3.5 font-semibold text-white transition hover:bg-flare-600 disabled:opacity-60">{busy ? "Saving…" : forced ? "Save and continue" : "Change password"}</button>
    </form>
  );
}

export default function StudentDashboard() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/student/me", { cache: "no-store" });
      if (res.status === 401) { router.replace("/dashboard/login"); return; }
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Could not load your dashboard."); return; }
      setMe(json);
    } catch { setError("Network error. Please refresh."); }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const logout = async () => { await fetch("/api/student/logout", { method: "POST" }); router.replace("/dashboard/login"); };

  if (error) return <div className="wrap py-24 text-center text-muted">{error}</div>;
  if (!me) return <div className="flex min-h-[60vh] items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-flare-500" /></div>;

  const first = (me.student.fullName || "there").trim().split(/\s+/)[0];

  // first login with the default password: choose your own before anything else
  if (me.student.mustChangePassword) {
    return (
      <section className="bg-cloud">
        <div className="wrap flex min-h-[78vh] items-center justify-center py-12">
          <div className="w-full max-w-md rounded-[28px] border border-line bg-white p-6 shadow-soft sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-flare-500 text-white"><ShieldIcon className="h-6 w-6" /></span>
            <h1 className="font-display mt-5 text-3xl font-semibold">Welcome, {first}!</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">For your safety, choose your own password before you continue. The starting password is shared by every student.</p>
            <div className="mt-6"><PasswordForm forced onDone={load} /></div>
          </div>
        </div>
      </section>
    );
  }

  const wa = (text: string) => `${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <div className="bg-cloud">
      <div className="wrap py-10 sm:py-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-flare-600">Student dashboard</p>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">Hello, {first} 👋</h1>
          </div>
          <button onClick={logout} className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold hover:border-ink">Log out</button>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-6">
            {me.registrations.length === 0 && (
              <div className="rounded-3xl border border-dashed border-line bg-white p-8 text-center">
                <p className="font-display text-lg font-semibold">No registrations yet</p>
                <Link href="/register" className="mt-4 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">Register for a course</Link>
              </div>
            )}

            {me.registrations.map((r) => {
              const cancelled = r.status === "cancelled";
              const done = DONE[r.status] ?? 1;
              return (
                <article key={r.id} className="rounded-3xl border border-line bg-white p-5 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-flare-600">{ACADEMY.weeks}-week beginner course</p>
                      <h2 className="font-display mt-1 text-2xl font-semibold">{r.courseTitle}</h2>
                    </div>
                    <span className="rounded-full bg-cloud px-3 py-1.5 text-xs font-bold tracking-wider">{r.ref}</span>
                  </div>

                  {cancelled ? (
                    <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">This registration was cancelled. Message us if you think this is a mistake.</p>
                  ) : (
                    <ol className="mt-6 grid gap-3 sm:grid-cols-4">
                      {STEPS.map((label, i) => {
                        const complete = i < done;
                        const current = i === done;
                        return (
                          <li key={label} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${complete ? "bg-flare-500 text-white" : current ? "bg-ink text-white" : "bg-cloud text-muted"}`}>
                              {complete ? <CheckIcon className="h-4 w-4" /> : i + 1}
                            </span>
                            <span className={`text-sm leading-snug ${complete || current ? "font-semibold" : "text-muted"}`}>{label}</span>
                          </li>
                        );
                      })}
                    </ol>
                  )}

                  <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-line pt-5 text-sm sm:grid-cols-4">
                    <div><dt className="flex items-center gap-1.5 text-xs text-muted"><UsersIcon className="h-3.5 w-3.5" /> Training</dt><dd className="font-semibold">{r.mode === "online" ? "Online" : "Physical"}</dd></div>
                    <div><dt className="text-xs text-muted">Course fee</dt><dd className="font-semibold">{naira(r.fee)}</dd></div>
                    <div><dt className="flex items-center gap-1.5 text-xs text-muted"><CertificateIcon className="h-3.5 w-3.5" /> Certificate</dt><dd className="font-semibold">Included</dd></div>
                    <div><dt className="flex items-center gap-1.5 text-xs text-muted"><ClockIcon className="h-3.5 w-3.5" /> Registered</dt><dd className="font-semibold">{fmtDate(r.createdAt) || "-"}</dd></div>
                  </dl>

                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-flare-50 px-4 py-3.5 text-sm">
                    <CalendarIcon className="h-5 w-5 shrink-0 text-flare-600" />
                    <p>{r.startDate ? <>Your class starts: <b>{r.startDate}</b></> : <>Start date: <b>to be confirmed</b>{r.preferredStart ? <> (you asked for: {r.preferredStart})</> : null}</>}</p>
                  </div>

                  {r.adminNote && (
                    <div className="mt-4 rounded-2xl border border-line bg-cloud px-4 py-3.5 text-sm">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-flare-600">Message from the FroshX team</p>
                      <p className="mt-1 whitespace-pre-line leading-relaxed">{r.adminNote}</p>
                    </div>
                  )}

                  <a href={wa(`Hello FroshX Academy, I have a question about my ${r.courseTitle} registration (${r.ref}).`)} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-2.5 text-sm font-semibold hover:bg-[#25D366]/15">
                    <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Message us about this course
                  </a>
                </article>
              );
            })}

            <Link href="/register" className="flex items-center justify-between rounded-3xl border border-line bg-white p-5 transition hover:border-flare-300 sm:p-6">
              <span><span className="block font-display text-lg font-semibold">Want to learn something else?</span><span className="text-sm text-muted">Register for another course.</span></span>
              <span className="text-xl text-flare-600">→</span>
            </Link>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold">Your details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div><dt className="text-xs text-muted">Name</dt><dd className="font-semibold">{me.student.fullName || "-"}</dd></div>
                <div><dt className="text-xs text-muted">Email</dt><dd className="break-all font-semibold">{me.student.email}</dd></div>
                <div><dt className="text-xs text-muted">Phone / WhatsApp</dt><dd className="font-semibold">{me.student.phone || "-"}</dd></div>
                {me.registrations[0]?.location && <div><dt className="flex items-center gap-1.5 text-xs text-muted"><MapPinIcon className="h-3.5 w-3.5" /> Location</dt><dd className="font-semibold">{me.registrations[0].location}</dd></div>}
              </dl>
              <p className="mt-4 text-xs text-muted">Need to correct something? Message us on WhatsApp.</p>
            </div>

            <div className="rounded-3xl border border-line bg-white p-5 sm:p-6">
              <h2 className="font-display text-lg font-semibold">Change password</h2>
              <div className="mt-4"><PasswordForm forced={false} onDone={() => {}} /></div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
