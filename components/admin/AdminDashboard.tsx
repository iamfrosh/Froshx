"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COURSES, naira } from "@/lib/academy";
import "../academy/academy.css";
import { messageEmail } from "@/lib/emailTemplates";
import ProjectsAdmin from "./ProjectsAdmin";
import MusicAdmin from "./MusicAdmin";
import { WhatsAppIcon } from "../Icons";
import { UsersIcon, ChartIcon, ClockIcon, BellIcon, ShieldIcon } from "../academy/AcademyIcons";

type Reg = {
  _id: string; ref: string; courseTitle: string; mode: string; fee: number; fullName: string; email: string; phone: string;
  gender?: string; ageRange?: string; location?: string; education?: string; device?: string; experience?: string;
  preferredStart?: string; goal?: string; source?: string; status: string; createdAt: string; emailStatus?: string; startDate?: string; adminNote?: string;
};
type Draft = { _id: string; fullName?: string; email?: string; phone?: string; course?: string; mode?: string; step?: number; updatedAt: string };
type Count = { _id: string; count: number };
type Student = { email: string; mustChangePassword: boolean; lastLoginAt: string | null };
type Data = {
  registrations: Reg[];
  students: Student[];
  drafts: Draft[];
  stats: {
    totalRegs: number; regsToday: number; regsWeek: number; draftCount: number;
    byCourse: Count[]; byMode: Count[]; byStatus: Count[];
    visits: {
      viewsTotal: number; viewsToday: number; viewsWeek: number; uniqueTotal: number; uniqueToday: number; uniqueWeek: number;
      daily: { _id: string; views: number; visitors: number }[]; topPages: Count[]; sources: Count[];
    };
  };
};

const STATUSES = ["new", "contacted", "confirmed", "cancelled"];
const STATUS_STYLE: Record<string, string> = {
  new: "bg-flare-50 text-flare-700",
  contacted: "bg-blue-50 text-blue-700",
  confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const waLink = (phone: string, text: string) => {
  let n = phone.replace(/\D/g, "");
  if (n.startsWith("0")) n = "234" + n.slice(1);
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
};
const fmt = (iso: string) => new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const ago = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m} min ago`;
  if (m < 1440) return `${Math.round(m / 60)} hr ago`;
  return `${Math.round(m / 1440)} d ago`;
};

function Stat({ icon: Icon, label, value, sub }: { icon: (p: React.SVGProps<SVGSVGElement>) => JSX.Element; label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-flare-50 text-flare-600"><Icon className="h-[18px] w-[18px]" /></span>
      </div>
      <p className="font-display mt-3 text-3xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

function Bars({ items, total }: { items: Count[]; total: number }) {
  if (!items.length) return <p className="text-sm text-muted">No data yet.</p>;
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i._id}>
          <div className="flex justify-between text-sm"><span className="truncate pr-3">{i._id || "(direct)"}</span><b>{i.count}</b></div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-cloud">
            <div className="h-full rounded-full bg-gradient-to-r from-flare-500 to-flare-300" style={{ width: `${Math.max(4, (i.count / Math.max(total, 1)) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RegExtras({ r, student, onSaved }: { r: Reg; student?: Student; onSaved: () => void }) {
  const [startDate, setStartDate] = useState(r.startDate || "");
  const [note, setNote] = useState(r.adminNote || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    setBusy(true); setMsg("");
    const res = await fetch("/api/admin/data", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r._id, startDate, adminNote: note }) });
    setBusy(false);
    setMsg(res.ok ? "Saved. The student sees this on their dashboard." : "Could not save.");
    onSaved();
  };
  const reset = async () => {
    if (!window.confirm(`Reset ${r.fullName}'s dashboard password to the default? They will have to choose a new one.`)) return;
    const res = await fetch("/api/admin/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "reset", email: r.email }) });
    const json = await res.json().catch(() => ({}));
    setMsg(res.ok ? "Password reset to the default." : json.error || "Could not reset.");
    onSaved();
  };

  return (
    <div className="grid gap-4 border-t border-line px-5 py-5 sm:grid-cols-2">
      <div>
        <label className="mb-2 block text-xs font-semibold text-muted">Confirmed start date (shown to the student)</label>
        <input className="ax-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="e.g. Monday 3 March 2026" maxLength={80} />
        <label className="mb-2 mt-4 block text-xs font-semibold text-muted">Message to the student (optional)</label>
        <textarea className="ax-input resize-none" rows={3} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} placeholder="e.g. Please bring a laptop on the first day." />
        <button onClick={save} disabled={busy} className="mt-3 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-flare-600 disabled:opacity-60">{busy ? "Saving…" : "Save for dashboard"}</button>
      </div>
      <div className="text-sm">
        <p className="text-xs font-semibold text-muted">Student dashboard</p>
        {student ? (
          <p className="mt-2 leading-relaxed">Account created. {student.lastLoginAt ? <>Last login: <b>{new Date(student.lastLoginAt).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</b>.</> : <>Has <b>not logged in</b> yet.</>} {student.mustChangePassword ? "Still on the default password." : "Has chosen their own password."}</p>
        ) : (
          <p className="mt-2 text-muted">No dashboard account yet. Use “Create accounts” in the Send email tab.</p>
        )}
        {student && <button onClick={reset} className="mt-3 rounded-full border border-line px-4 py-2 font-semibold hover:border-ink">Reset password to default</button>}
        {msg && <p className="mt-3 rounded-xl bg-white px-3 py-2 text-[13px]">{msg}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [courseF, setCourseF] = useState("");
  const [statusF, setStatusF] = useState("");
  const [tab, setTab] = useState<"regs" | "drafts" | "email" | "projects" | "music">("regs");
  const [open, setOpen] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/data", { cache: "no-store" });
      if (res.status === 401) { setAuthed(false); return; }
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Could not load data."); setAuthed(true); return; }
      setError(""); setData(json); setAuthed(true); setUpdatedAt(new Date());
    } catch {
      setError("Network error. Retrying…");
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!authed) return;
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [authed, load]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true); setLoginErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const json = await res.json().catch(() => ({}));
    setLoggingIn(false);
    if (!res.ok) { setLoginErr(json.error || "Login failed."); return; }
    setPassword(""); setAuthed(true); load();
  };
  const logout = async () => { await fetch("/api/admin/login", { method: "DELETE" }); setAuthed(false); setData(null); };

  const setStatus = async (id: string, status: string) => {
    setData((d) => d && { ...d, registrations: d.registrations.map((r) => (r._id === id ? { ...r, status } : r)) });
    await fetch("/api/admin/data", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    load();
  };

  const rows = useMemo(() => {
    if (!data) return [];
    const s = q.trim().toLowerCase();
    return data.registrations.filter((r) =>
      (!courseF || r.courseTitle === courseF) &&
      (!statusF || r.status === statusF) &&
      (!s || [r.fullName, r.email, r.phone, r.ref, r.location].some((v) => (v || "").toLowerCase().includes(s)))
    );
  }, [data, q, courseF, statusF]);

  // ---- email composer
  const studentByEmail = useMemo(() => Object.fromEntries((data?.students || []).map((x) => [x.email.toLowerCase(), x])), [data]);
  const [aud, setAud] = useState<"all" | "course" | "status" | "drafts" | "one">("all");
  const [audCourse, setAudCourse] = useState("");
  const [audStatus, setAudStatus] = useState("new");
  const [oneId, setOneId] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [mailNote, setMailNote] = useState("");
  const [mailFailed, setMailFailed] = useState<{ email: string; error: string }[]>([]);

  const recipients = useMemo(() => {
    const none = { target: "registrations" as "registrations" | "drafts", items: [] as { id: string; name: string; email: string }[] };
    if (!data) return none;
    if (aud === "drafts") {
      return { target: "drafts" as const, items: data.drafts.filter((d) => d.email).map((d) => ({ id: d._id, name: d.fullName || "(no name)", email: d.email as string })) };
    }
    let list = data.registrations;
    if (aud === "all") list = list.filter((r) => r.status !== "cancelled");
    if (aud === "course") list = list.filter((r) => r.courseTitle === audCourse && r.status !== "cancelled");
    if (aud === "status") list = list.filter((r) => r.status === audStatus);
    if (aud === "one") list = list.filter((r) => r._id === oneId);
    return { target: "registrations" as const, items: list.map((r) => ({ id: r._id, name: r.fullName, email: r.email })) };
  }, [data, aud, audCourse, audStatus, oneId]);

  const preview = useMemo(
    () =>
      messageEmail({
        subject: subject || "Your subject goes here",
        message: message || "Your message appears here.\n\nWrite in plain text. Blank lines make new paragraphs.",
        ctaLabel, ctaUrl,
        vars: { name: "Amina", fullName: "Amina Yusuf", course: "Web Development", ref: "FXA-7K3M9P" },
      }).html,
    [subject, message, ctaLabel, ctaUrl]
  );

  const PRESETS: { label: string; subject: string; message: string }[] = [
    { label: "Welcome", subject: "Welcome to FroshX Academy, {{name}}!", message: "Thank you for registering for {{course}}. We are excited to have you.\n\nOur team will be in touch with the next steps. Keep your reference number {{ref}} handy." },
    { label: "Payment & documents", subject: "Your {{course}} registration: next steps", message: "We are following up on your {{course}} registration ({{ref}}).\n\nPlease reply to this email or message us on WhatsApp so we can share the payment details and the documents we need from you." },
    { label: "Start date", subject: "Your {{course}} start date", message: "Good news, {{name}}! Your start date for {{course}} is [add date here].\n\nPlease reply to confirm you can make it." },
    { label: "Finish registering", subject: "Finish your FroshX Academy registration", message: "We noticed you started registering for {{course}} but did not finish.\n\nIt only takes a minute to complete, and we would love to have you in class." },
  ];

  const mailCall = async (body: Record<string, unknown>) => {
    const res = await fetch("/api/admin/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Could not send.");
    return json as { sent: number; failed: { email: string; error: string }[]; to?: string };
  };

  const sendTest = async () => {
    setMailNote(""); setMailFailed([]);
    try {
      const r = await mailCall({ mode: "test", subject, message, ctaLabel, ctaUrl });
      setMailNote(`Test email sent to ${r.to}. Check that inbox.`);
    } catch (e) { setMailNote(e instanceof Error ? e.message : "Could not send."); }
  };

  const sendBulk = async () => {
    const n = recipients.items.length;
    if (!n || !subject.trim() || !message.trim()) return;
    if (!window.confirm(`Send this email to ${n} ${n === 1 ? "person" : "people"}?`)) return;
    setSending(true); setMailNote(""); setMailFailed([]); setProgress({ done: 0, total: n });
    let sent = 0; const failed: { email: string; error: string }[] = [];
    try {
      for (let i = 0; i < n; i += 20) {
        const ids = recipients.items.slice(i, i + 20).map((x) => x.id);
        const r = await mailCall({ mode: "bulk", target: recipients.target, ids, subject, message, ctaLabel, ctaUrl });
        sent += r.sent; failed.push(...r.failed);
        setProgress({ done: Math.min(i + 20, n), total: n });
      }
      setMailNote(`Done. ${sent} sent${failed.length ? `, ${failed.length} failed` : ""}.`);
    } catch (e) {
      setMailNote(`Stopped after ${sent} sent. ${e instanceof Error ? e.message : ""}`);
    }
    setMailFailed(failed); setSending(false);
  };

  const createAccounts = async () => {
    const res = await fetch("/api/admin/students", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create-missing" }) });
    const json = await res.json().catch(() => ({}));
    setMailNote(res.ok ? `Dashboard accounts ready. ${json.created} new, ${json.total} people in total.` : json.error || "Could not create accounts.");
    load();
  };

  const sendInvites = async () => {
    const n = recipients.items.length;
    if (!n || recipients.target !== "registrations") return;
    if (!window.confirm(`Send the dashboard invitation to ${n} ${n === 1 ? "person" : "people"}?`)) return;
    setSending(true); setMailNote(""); setMailFailed([]); setProgress({ done: 0, total: n });
    let sent = 0; const failed: { email: string; error: string }[] = [];
    try {
      for (let i = 0; i < n; i += 15) {
        const ids = recipients.items.slice(i, i + 15).map((x) => x.id);
        const r = await mailCall({ mode: "dashboard", ids });
        sent += r.sent; failed.push(...r.failed);
        setProgress({ done: Math.min(i + 15, n), total: n });
      }
      setMailNote(`Done. ${sent} invitation${sent === 1 ? "" : "s"} sent${failed.length ? `, ${failed.length} failed` : ""}.`);
    } catch (e) { setMailNote(`Stopped after ${sent} sent. ${e instanceof Error ? e.message : ""}`); }
    setMailFailed(failed); setSending(false); load();
  };

  const resend = async (id: string) => {
    try { await mailCall({ mode: "resend", id }); setError(""); load(); alert("Confirmation email sent."); }
    catch (e) { alert(e instanceof Error ? e.message : "Could not send."); }
  };

  // ------- loading / login
  if (authed === null) {
    return <div className="flex min-h-[70vh] items-center justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-flare-500" /></div>;
  }
  if (!authed) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center px-5 py-16">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl border border-line bg-white p-8 shadow-soft">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-flare-300"><ShieldIcon className="h-6 w-6" /></span>
          <h1 className="font-display mt-5 text-2xl font-semibold">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">FroshX Academy dashboard</p>
          <label htmlFor="pw" className="mb-2 mt-6 block text-sm font-medium">Password</label>
          <input id="pw" type="password" autoComplete="current-password" className={`ax-input ${loginErr ? "ax-bad" : ""}`} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          {loginErr && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{loginErr}</p>}
          <button disabled={loggingIn || !password} className="mt-6 w-full rounded-full bg-ink py-3.5 font-semibold text-white transition hover:bg-flare-600 disabled:opacity-50">
            {loggingIn ? "Checking…" : "Sign in"}
          </button>
        </form>
      </div>
    );
  }

  const st = data?.stats;
  const maxDaily = Math.max(1, ...(st?.visits.daily.map((d) => d.views) || [1]));

  return (
    <div className="wrap py-10 md:py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-flare-600">Admin</p>
          <h1 className="font-display text-3xl font-semibold">FroshX Academy dashboard</h1>
          {updatedAt && <p className="mt-1 text-xs text-muted">Updated {updatedAt.toLocaleTimeString("en-NG")} · refreshes every minute</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold hover:border-ink">Refresh</button>
          <a href="/api/admin/export" className="rounded-full border border-line px-4 py-2.5 text-sm font-semibold hover:border-ink">Export CSV</a>
          <button onClick={logout} className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-flare-600">Sign out</button>
        </div>
      </div>

      {error && <p role="alert" className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!data && !error && <div className="mt-16 flex justify-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-flare-500" /></div>}

      {data && st && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={UsersIcon} label="Registrations" value={st.totalRegs} sub={`${st.regsToday} today · ${st.regsWeek} this week`} />
            <Stat icon={ChartIcon} label="Visitors today" value={st.visits.uniqueToday} sub={`${st.visits.viewsToday} page views`} />
            <Stat icon={ClockIcon} label="Visitors, 7 days" value={st.visits.uniqueWeek} sub={`${st.visits.viewsWeek} page views`} />
            <Stat icon={BellIcon} label="Unfinished" value={st.draftCount} sub="Started but did not submit" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-line bg-white p-6 lg:col-span-2">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold">Visits, last 14 days</h2>
                <p className="text-xs text-muted">All time: {st.visits.uniqueTotal} visitors · {st.visits.viewsTotal} views</p>
              </div>
              {st.visits.daily.length ? (
                <div className="mt-6 flex h-40 items-end gap-1.5 sm:gap-2">
                  {st.visits.daily.map((d) => (
                    <div key={d._id} className="group relative flex flex-1 flex-col items-center justify-end">
                      <span className="pointer-events-none absolute -top-8 hidden whitespace-nowrap rounded-lg bg-ink px-2 py-1 text-[11px] text-white group-hover:block">{d._id.slice(5)}: {d.visitors} visitors · {d.views} views</span>
                      <div className="w-full rounded-t-md bg-gradient-to-t from-flare-500 to-flare-300" style={{ height: `${Math.max(4, (d.views / maxDaily) * 100)}%` }} />
                      <span className="mt-1.5 text-[10px] text-muted">{d._id.slice(8)}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="mt-6 text-sm text-muted">No visits recorded yet.</p>}
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-lg font-semibold">Top pages</h2>
              <div className="mt-4"><Bars items={st.visits.topPages} total={st.visits.viewsTotal} /></div>
              <h2 className="font-display mt-6 text-lg font-semibold">Where visitors come from</h2>
              <div className="mt-4"><Bars items={st.visits.sources} total={st.visits.viewsTotal} /></div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-lg font-semibold">By course</h2>
              <div className="mt-4"><Bars items={st.byCourse} total={st.totalRegs} /></div>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-lg font-semibold">Online vs physical</h2>
              <div className="mt-4"><Bars items={st.byMode} total={st.totalRegs} /></div>
              <p className="mt-4 text-xs text-muted">
                Expected fees: {naira(data.registrations.filter((r) => r.status !== "cancelled").reduce((a, r) => a + r.fee, 0))}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-lg font-semibold">By status</h2>
              <div className="mt-4"><Bars items={st.byStatus} total={st.totalRegs} /></div>
            </div>
          </div>

          {/* tabs */}
          <div className="mt-10 flex gap-2 overflow-x-auto whitespace-nowrap border-b border-line">
            {([["regs", `Registrations (${data.registrations.length})`], ["drafts", `Unfinished (${data.drafts.length})`], ["email", "Send email"], ["projects", "Projects"], ["music", "Music"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === k ? "border-flare-500 text-ink" : "border-transparent text-muted hover:text-ink"}`}>{l}</button>
            ))}
          </div>

          {tab === "regs" && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-3">
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone, reference…" className="ax-input max-w-xs" />
                <select value={courseF} onChange={(e) => setCourseF(e.target.value)} className="ax-input max-w-[220px]">
                  <option value="">All courses</option>{COURSES.map((c) => <option key={c.id}>{c.title}</option>)}
                </select>
                <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className="ax-input max-w-[160px]">
                  <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              {rows.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
                  {data.registrations.length ? "No registrations match your filters." : "No registrations yet. They will appear here as soon as someone registers."}
                </div>
              ) : (
                <ul className="mt-6 space-y-3">
                  {rows.map((r) => (
                    <li key={r._id} className="rounded-2xl border border-line bg-white">
                      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 p-4 sm:p-5">
                        <button onClick={() => setOpen(open === r._id ? null : r._id)} className="min-w-[200px] flex-1 text-left">
                          <p className="font-semibold">{r.fullName}</p>
                          <p className="text-[13px] text-muted">{r.courseTitle} · {r.mode} · {naira(r.fee)}</p>
                        </button>
                        <p className="text-[13px] text-muted">{r.ref}<br />{fmt(r.createdAt)}</p>
                        <select value={r.status} onChange={(e) => setStatus(r._id, e.target.value)} className={`rounded-full border-0 px-3 py-2 text-xs font-bold uppercase tracking-wide ${STATUS_STYLE[r.status] || ""}`} aria-label="Status">
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <a href={waLink(r.phone, `Hello ${r.fullName.split(" ")[0]}, this is FroshX Academy about your ${r.courseTitle} registration (${r.ref}).`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white">
                          <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                        </a>
                        <button onClick={() => { setAud("one"); setOneId(r._id); setTab("email"); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-ink">Email</button>
                      </div>
                      {open === r._id && (
                        <div className="border-t border-line bg-cloud"><dl className="grid gap-x-8 gap-y-3 p-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
                          {([["Email", r.email], ["Phone", r.phone], ["Location", r.location], ["Age range", r.ageRange], ["Gender", r.gender], ["Education", r.education], ["Device", r.device], ["Experience", r.experience], ["Preferred start", r.preferredStart], ["Heard about us", r.source], ["Goal", r.goal]] as [string, string | undefined][]).map(([k, v]) => (
                            <div key={k} className={k === "Goal" ? "sm:col-span-2 lg:col-span-3" : ""}>
                              <dt className="text-xs text-muted">{k}</dt>
                              <dd className="font-medium">{v || "-"}</dd>
                            </div>
                          ))}
                        </dl>
                        <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4 text-sm">
                          <span className="text-muted">Confirmation email: <b className={r.emailStatus === "sent" ? "text-green-700" : "text-red-600"}>{r.emailStatus === "sent" ? "sent" : r.emailStatus === "failed" ? "failed" : "pending"}</b></span>
                          <button onClick={() => resend(r._id)} className="rounded-full border border-line px-4 py-2 font-semibold hover:border-ink">Resend confirmation</button>
                        </div>
                        <RegExtras r={r} student={studentByEmail[r.email.toLowerCase()]} onSaved={load} /></div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "drafts" && (
            <div className="mt-6">
              <p className="text-sm text-muted">People who started registering but did not finish. Follow them up on WhatsApp.</p>
              {data.drafts.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">No unfinished registrations right now.</div>
              ) : (
                <ul className="mt-5 space-y-3">
                  {data.drafts.map((d) => (
                    <li key={d._id} className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-2xl border border-line bg-white p-4 sm:p-5">
                      <div className="min-w-[200px] flex-1">
                        <p className="font-semibold">{d.fullName || "(no name yet)"}</p>
                        <p className="text-[13px] text-muted">{[d.email, d.phone].filter(Boolean).join(" · ")}</p>
                        <p className="text-[13px] text-muted">{COURSES.find((c) => c.id === d.course)?.title || "No course picked"} · stopped at step {d.step || 1} of 2</p>
                      </div>
                      <p className="text-[13px] text-muted">{ago(d.updatedAt)}</p>
                      {d.phone && (
                        <a href={waLink(d.phone, `Hello${d.fullName ? " " + d.fullName.split(" ")[0] : ""}, this is FroshX Academy. We noticed you started registering and wanted to help you finish. Do you have any questions?`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white">
                          <WhatsAppIcon className="h-4 w-4" /> Follow up
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "projects" && <ProjectsAdmin />}
          {tab === "music" && <MusicAdmin />}

          {tab === "email" && (
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-5 rounded-2xl border border-line bg-white p-5 sm:p-6">
                <div>
                  <h2 className="font-display text-lg font-semibold">Send a professional email</h2>
                  <p className="mt-1 text-sm text-muted">Sent from froshxtechnologies@gmail.com with the FroshX design.</p>
                </div>

                <div>
                  <label htmlFor="aud" className="mb-2 block text-sm font-medium">Who should receive it?</label>
                  <select id="aud" className="ax-input" value={aud} onChange={(e) => setAud(e.target.value as typeof aud)}>
                    <option value="all">All registrants</option>
                    <option value="course">One course</option>
                    <option value="status">By status</option>
                    <option value="drafts">Unfinished registrations</option>
                    <option value="one">One person</option>
                  </select>
                  {aud === "course" && (
                    <select className="ax-input mt-3" value={audCourse} onChange={(e) => setAudCourse(e.target.value)}>
                      <option value="">Choose a course</option>{COURSES.map((c) => <option key={c.id}>{c.title}</option>)}
                    </select>
                  )}
                  {aud === "status" && (
                    <select className="ax-input mt-3" value={audStatus} onChange={(e) => setAudStatus(e.target.value)}>
                      {STATUSES.map((x) => <option key={x}>{x}</option>)}
                    </select>
                  )}
                  {aud === "one" && (
                    <select className="ax-input mt-3" value={oneId} onChange={(e) => setOneId(e.target.value)}>
                      <option value="">Choose a person</option>
                      {data.registrations.map((r) => <option key={r._id} value={r._id}>{r.fullName} ({r.courseTitle})</option>)}
                    </select>
                  )}
                  <p className="mt-2 text-sm"><b>{recipients.items.length}</b> {recipients.items.length === 1 ? "recipient" : "recipients"}{recipients.items.length > 0 && recipients.items.length <= 4 ? `: ${recipients.items.map((x) => x.email).join(", ")}` : ""}</p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium">Quick start</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button key={p.label} type="button" onClick={() => { setSubject(p.subject); setMessage(p.message); }} className="rounded-full border border-line px-3.5 py-2 text-xs font-semibold hover:border-flare-500">{p.label}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="subj" className="mb-2 block text-sm font-medium">Subject</label>
                  <input id="subj" className="ax-input" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={150} placeholder="e.g. Your class starts soon" />
                </div>
                <div>
                  <label htmlFor="msg" className="mb-2 block text-sm font-medium">Message</label>
                  <textarea id="msg" rows={8} className="ax-input resize-y" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={6000} placeholder="Write in plain text. Leave a blank line between paragraphs." />
                  <p className="mt-1.5 text-xs text-muted">Personalise with <code>{"{{name}}"}</code> <code>{"{{course}}"}</code> <code>{"{{ref}}"}</code> <code>{"{{fullName}}"}</code></p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="cl" className="mb-2 block text-sm font-medium">Button text (optional)</label>
                    <input id="cl" className="ax-input" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="e.g. Chat on WhatsApp" />
                  </div>
                  <div>
                    <label htmlFor="cu" className="mb-2 block text-sm font-medium">Button link</label>
                    <input id="cu" className="ax-input" value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://…" inputMode="url" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="button" onClick={sendTest} disabled={sending || !subject.trim() || !message.trim()} className="rounded-full border border-line px-5 py-3.5 text-sm font-semibold hover:border-ink disabled:opacity-50">Send test to myself</button>
                  <button type="button" onClick={sendBulk} disabled={sending || !recipients.items.length || !subject.trim() || !message.trim()} className="flex-1 rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-white hover:bg-flare-600 disabled:opacity-50">
                    {sending ? `Sending ${progress.done}/${progress.total}…` : `Send to ${recipients.items.length} ${recipients.items.length === 1 ? "person" : "people"}`}
                  </button>
                </div>
                {sending && <div className="h-2 overflow-hidden rounded-full bg-cloud"><div className="h-full rounded-full bg-flare-500 transition-all" style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }} /></div>}
                {mailNote && <p role="status" className="rounded-xl bg-cloud px-4 py-3 text-sm">{mailNote}</p>}
                {mailFailed.length > 0 && (
                  <ul className="space-y-1 text-xs text-red-600">{mailFailed.map((f) => <li key={f.email}>{f.email}: {f.error}</li>)}</ul>
                )}
                <p className="text-xs text-muted">Gmail allows about 500 emails per day. Emails are sent one per person.</p>

                {aud !== "drafts" && (
                  <div className="rounded-2xl border border-flare-100 bg-flare-50 p-4">
                    <p className="font-display font-semibold">Student dashboard invitation</p>
                    <p className="mt-1 text-sm text-muted">Tells the selected people they can log in, with their email and the starting password. Each person gets one email, even if they registered twice.</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={createAccounts} disabled={sending} className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold hover:border-ink disabled:opacity-50">Create accounts for everyone registered</button>
                      <button type="button" onClick={sendInvites} disabled={sending || !recipients.items.length} className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-flare-600 disabled:opacity-50">Send dashboard invitation to {recipients.items.length}</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:sticky lg:top-24">
                <p className="mb-2 text-sm font-medium">Live preview</p>
                <iframe title="Email preview" sandbox="" srcDoc={preview} className="h-[640px] w-full rounded-2xl border border-line bg-white" />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
