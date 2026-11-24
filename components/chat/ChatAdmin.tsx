"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { WhatsAppIcon } from "../Icons";
import "../academy/academy.css";

type Enq = { id: string; email: string; name: string; phone: string; question: string; status: "open" | "answered"; transcript: { from: string; text: string }[]; replies: { subject: string; text: string; at: string }[]; at: string };
type Log = { id: string; question: string; answer: string; source: "rules" | "ai" | "none"; intent: string; at: string };
type Data = { aiReady: boolean; provider: string; lastAiError: { text: string; at: string } | null; stats: { total: number; today: number; aiToday: number; unanswered: number; open: number }; enquiries: Enq[]; logs: Log[] };

const BADGE: Record<string, string> = { rules: "bg-green-50 text-green-700", ai: "bg-blue-50 text-blue-700", none: "bg-red-50 text-red-700" };
const LABEL: Record<string, string> = { rules: "Answered (free)", ai: "Answered (AI)", none: "Not answered" };
const when = (iso: string) => new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const waLink = (phone: string, text: string) => { let n = phone.replace(/\D/g, ""); if (n.startsWith("0")) n = "234" + n.slice(1); return `https://wa.me/${n}?text=${encodeURIComponent(text)}`; };

function EnquiryCard({ e, onChanged }: { e: Enq; onChanged: () => void }) {
  const [open, setOpen] = useState(e.status === "open");
  const [subject, setSubject] = useState("Reply from FroshX");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");

  const send = async () => {
    setBusy(true); setNote("");
    const res = await fetch("/api/admin/chat/reply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: e.id, subject, message }) });
    const j = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setNote(j.error || "Could not send."); return; }
    setMessage(""); setNote("Reply sent by email."); onChanged();
  };
  const mark = async (status: "open" | "answered") => {
    await fetch("/api/admin/chat", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: e.id, status }) });
    onChanged();
  };

  return (
    <li className={`rounded-2xl border bg-white ${e.status === "open" ? "border-flare-300" : "border-line"}`}>
      <button onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-start justify-between gap-3 p-4 text-left sm:p-5">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2 text-xs">
            <span className={`rounded-full px-2.5 py-1 font-bold ${e.status === "open" ? "bg-flare-50 text-flare-700" : "bg-green-50 text-green-700"}`}>{e.status === "open" ? "Waiting for reply" : "Answered"}</span>
            <span className="text-muted">{when(e.at)}</span>
          </span>
          <span className="mt-2 block font-semibold">{e.question}</span>
          <span className="mt-0.5 block text-[13px] text-muted">{e.name ? `${e.name} · ` : ""}{e.email}{e.phone ? ` · ${e.phone}` : ""}</span>
        </span>
        <span className="text-xl text-muted">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="space-y-4 border-t border-line bg-cloud p-4 sm:p-5">
          {e.transcript.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted">Conversation before they asked</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {e.transcript.map((t, i) => <li key={i}><b className={t.from === "bot" ? "text-flare-700" : ""}>{t.from === "bot" ? "Assistant" : "Visitor"}:</b> <span className="text-muted">{t.text}</span></li>)}
              </ul>
            </div>
          )}
          {e.replies.map((r, i) => (
            <div key={i} className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm"><p className="text-xs font-semibold text-green-700">You replied · {when(r.at)}</p><p className="mt-1 whitespace-pre-line">{r.text}</p></div>
          ))}
          <div>
            <label className="mb-2 block text-xs font-semibold text-muted">Your reply (sent by email with the FroshX design)</label>
            <input className="ax-input mb-3" value={subject} onChange={(x) => setSubject(x.target.value)} maxLength={150} aria-label="Subject" />
            <textarea className="ax-input resize-y" rows={5} value={message} onChange={(x) => setMessage(x.target.value)} maxLength={5000} placeholder="Write your answer. The visitor's question is added under it automatically." />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button onClick={send} disabled={busy || !message.trim()} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-flare-600 disabled:opacity-50">{busy ? "Sending…" : "Send reply by email"}</button>
              {e.phone && <a href={waLink(e.phone, `Hello ${e.name.split(" ")[0] || ""}, this is FroshX about your question: "${e.question}"`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>}
              {e.status === "open" ? <button onClick={() => mark("answered")} className="text-sm font-semibold text-muted underline">Mark as answered</button> : <button onClick={() => mark("open")} className="text-sm font-semibold text-muted underline">Reopen</button>}
            </div>
            {note && <p role="status" className="mt-3 rounded-xl bg-white px-4 py-2.5 text-sm">{note}</p>}
          </div>
        </div>
      )}
    </li>
  );
}

export default function ChatAdmin() {
  const [data, setData] = useState<Data | null>(null);
  const [denied, setDenied] = useState(false);
  const [tab, setTab] = useState<"inbox" | "all">("inbox");
  const [only, setOnly] = useState(false);
  const [testing, setTesting] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; model?: string; reply?: string; error?: string } | null>(null);
  const runTest = async () => {
    setTesting(true); setTest(null);
    const r = await fetch("/api/admin/chat/test", { method: "POST" });
    setTest(await r.json().catch(() => ({ ok: false, error: "No response from the server." })));
    setTesting(false);
    load();
  };

  const load = useCallback(() => {
    fetch("/api/admin/chat", { cache: "no-store" }).then(async (r) => {
      if (r.status === 401) { setDenied(true); return; }
      setData(await r.json());
    }).catch(() => {});
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 45000); return () => clearInterval(t); }, [load]);

  if (denied) return (
    <div className="wrap py-24 text-center">
      <p className="font-display text-xl font-semibold">Please sign in first</p>
      <Link href="/admin" className="mt-4 inline-block rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">Go to admin sign in</Link>
    </div>
  );
  if (!data) return <div className="flex min-h-[50vh] items-center justify-center text-muted">Loading…</div>;

  const logs = data.logs.filter((l) => !only || l.source === "none");
  return (
    <div className="wrap py-10 sm:py-14">
      <Link href="/admin" className="text-sm font-medium text-muted hover:text-ink">← Back to dashboard</Link>
      <h1 className="font-display mt-3 text-3xl font-semibold">Chat assistant</h1>
      <p className="mt-1 text-sm text-muted">Questions the assistant couldn’t answer land in your inbox with the visitor’s email. Reply from here.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Waiting for reply", data.stats.open], ["Questions today", data.stats.today], ["AI answers today", data.stats.aiToday], ["Not answered (90 days)", data.stats.unanswered]].map(([l, v]) => (
          <div key={String(l)} className={`rounded-2xl border bg-white p-5 ${l === "Waiting for reply" && Number(v) > 0 ? "border-flare-300" : "border-line"}`}><p className="text-xs font-semibold uppercase tracking-wider text-muted">{l}</p><p className="font-display mt-2 text-3xl font-semibold">{v}</p></div>
        ))}
      </div>

      <p className="mt-5 rounded-2xl border border-line bg-cloud px-4 py-3 text-sm">
        AI answers: <b className={data.aiReady ? "text-green-700" : "text-red-600"}>{data.aiReady ? `ON (${data.provider})` : "OFF"}</b>.{" "}
        {data.aiReady ? "The assistant answers most questions and hands the rest to you." : "Only the built-in answers work. Turn AI on (see CHATBOT-README) so the assistant can answer almost any question."}
      </p>

      <div className="mt-3 rounded-2xl border border-line bg-white p-4 text-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={runTest} disabled={testing} className="rounded-full bg-ink px-5 py-2.5 font-semibold text-white hover:bg-flare-600 disabled:opacity-60">{testing ? "Testing…" : "Test AI connection"}</button>
          <span className="text-muted">Asks the AI a real question and shows exactly what happens.</span>
        </div>
        {test && (test.ok ? (
          <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3"><p className="font-semibold text-green-700">Working ✓ (model: {test.model})</p><p className="mt-1 whitespace-pre-line text-ink/80">{test.reply}</p></div>
        ) : (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700"><p className="font-semibold">Not working</p><p className="mt-1 break-words">{test.error}</p></div>
        ))}
        {!test && data.lastAiError && <p className="mt-3 break-words rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">Last AI error: {data.lastAiError.text}</p>}
      </div>

      <div className="mt-8 flex gap-2 border-b border-line">
        {([["inbox", `Enquiries (${data.enquiries.length})`], ["all", "All chats"]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`-mb-px border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === k ? "border-flare-500 text-ink" : "border-transparent text-muted hover:text-ink"}`}>{l}{k === "inbox" && data.stats.open > 0 ? ` · ${data.stats.open} new` : ""}</button>
        ))}
      </div>

      {tab === "inbox" && (
        <ul className="mt-6 space-y-3">
          {data.enquiries.length === 0 && <li className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">No enquiries yet. When the assistant can’t answer, the visitor leaves their email and it appears here.</li>}
          {data.enquiries.map((e) => <EnquiryCard key={e.id} e={e} onChanged={load} />)}
        </ul>
      )}

      {tab === "all" && (
        <>
          <label className="mt-6 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#F97316]" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Show only questions that were not answered</label>
          <ul className="mt-4 space-y-3">
            {logs.length === 0 && <li className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">Nothing here yet.</li>}
            {logs.map((l) => (
              <li key={l.id} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 text-xs"><span className={`rounded-full px-2.5 py-1 font-bold ${BADGE[l.source]}`}>{LABEL[l.source]}</span><span className="text-muted">{when(l.at)}</span></div>
                <p className="mt-2 font-semibold">{l.question}</p>
                {l.answer && <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-muted">{l.answer}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
