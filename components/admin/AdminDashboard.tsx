"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COURSES, naira } from "@/lib/academy";
import "../academy/academy.css";
import { WhatsAppIcon } from "../Icons";
import { UsersIcon, ChartIcon, ClockIcon, BellIcon, ShieldIcon } from "../academy/AcademyIcons";

type Reg = {
  _id: string; ref: string; courseTitle: string; mode: string; fee: number; fullName: string; email: string; phone: string;
  gender?: string; ageRange?: string; location?: string; education?: string; device?: string; experience?: string;
  preferredStart?: string; goal?: string; source?: string; status: string; createdAt: string;
};
type Draft = { _id: string; fullName?: string; email?: string; phone?: string; course?: string; mode?: string; step?: number; updatedAt: string };
type Count = { _id: string; count: number };
type Data = {
  registrations: Reg[];
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
  const [tab, setTab] = useState<"regs" | "drafts">("regs");
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
          <div className="mt-10 flex gap-2 border-b border-line">
            {([["regs", `Registrations (${data.registrations.length})`], ["drafts", `Unfinished (${data.drafts.length})`]] as const).map(([k, l]) => (
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
                      </div>
                      {open === r._id && (
                        <dl className="grid gap-x-8 gap-y-3 border-t border-line bg-cloud p-5 text-sm sm:grid-cols-2 lg:grid-cols-3">
                          {([["Email", r.email], ["Phone", r.phone], ["Location", r.location], ["Age range", r.ageRange], ["Gender", r.gender], ["Education", r.education], ["Device", r.device], ["Experience", r.experience], ["Preferred start", r.preferredStart], ["Heard about us", r.source], ["Goal", r.goal]] as [string, string | undefined][]).map(([k, v]) => (
                            <div key={k} className={k === "Goal" ? "sm:col-span-2 lg:col-span-3" : ""}>
                              <dt className="text-xs text-muted">{k}</dt>
                              <dd className="font-medium">{v || "-"}</dd>
                            </div>
                          ))}
                        </dl>
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
                        <p className="text-[13px] text-muted">{COURSES.find((c) => c.id === d.course)?.title || "No course picked"} · stopped at step {d.step || 1} of 3</p>
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
        </>
      )}
    </div>
  );
}
