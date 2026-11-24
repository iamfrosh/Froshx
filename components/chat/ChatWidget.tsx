"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { answer, quickAnswer, FALLBACK, WELCOME, Action, Reply } from "@/lib/chatKnowledge";
import { WhatsAppIcon, CloseIcon } from "../Icons";
import "./chat.css";

type Msg = { id: number; from: "user" | "bot"; text: string; actions?: Action[]; chips?: string[]; form?: { question: string; done?: boolean } };
const STORE = "froshx-chat";
const ASK_TEAM_ACTION: Action = { label: "Chat with the team on WhatsApp", href: "https://wa.me/2347041013001", external: true };
const SID = "froshx-sid";

function sessionId() {
  try {
    let s = sessionStorage.getItem(SID);
    if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem(SID, s); }
    return s;
  } catch { return "anon"; }
}

const ChatIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /><path d="M8.5 11h7M8.5 14h4" />
  </svg>
);

function EnquiryForm({ question, history, sid, onDone }: { question: string; history: { role: string; content: string }[]; sid: string; onDone: (email: string, name: string) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [q, setQ] = useState(question);
  const [hp, setHp] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) { setErr("Please enter a valid email address."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/chat/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sid, email, name, phone, question: q, history, website: hp }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) { setErr(j.error || "Something went wrong. Please try again."); setBusy(false); return; }
      onDone(email.trim(), name.trim());
    } catch { setErr("Couldn't send. Check your connection and try again."); setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="mt-2 space-y-2.5 rounded-2xl border border-flare-100 bg-flare-50 p-3.5">
      <input type="text" tabIndex={-1} autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden="true" />
      <input type="email" inputMode="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email address" aria-label="Your email address" className="fx-chat-input !rounded-xl" />
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Your name (optional)" aria-label="Your name" className="fx-chat-input !rounded-xl" />
      <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} placeholder="WhatsApp number (optional)" aria-label="WhatsApp number" className="fx-chat-input !rounded-xl" />
      <textarea value={q} onChange={(e) => setQ(e.target.value)} maxLength={800} rows={3} aria-label="Your question" className="fx-chat-input !resize-none !rounded-xl" />
      {err && <p role="alert" className="text-xs font-medium text-red-600">{err}</p>}
      <button disabled={busy} className="w-full rounded-full bg-ink py-3 text-[13px] font-semibold text-white transition hover:bg-flare-600 disabled:opacity-60">{busy ? "Sending…" : "Send to the FroshX team"}</button>
    </form>
  );
}

// Shortcut shown to the admin on admin pages: opens the chat inbox and shows how many enquiries are waiting.
function InboxShortcut() {
  const pathname = usePathname();
  const [open, setOpen] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    const load = () => fetch("/api/admin/chat?summary=1", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((j) => live && setOpen(j ? j.open : null)).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => { live = false; clearInterval(t); };
  }, [pathname]);
  if (open === null || pathname.startsWith("/admin/chat")) return null;
  return (
    <Link href="/admin/chat" className="fixed bottom-5 right-4 z-[80] flex items-center gap-2 rounded-full bg-ink px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-8px_rgba(21,19,15,.6)] hover:bg-flare-600">
      <ChatIcon className="h-5 w-5" /> Chat inbox
      {open > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-flare-500 px-1.5 text-xs font-bold">{open}</span>}
    </Link>
  );
}

// Floating website assistant. Answers from FroshX's own information for free; hands over to WhatsApp when unsure.
export default function ChatWidget() {
  const pathname = usePathname();
  const hidden = pathname.startsWith("/admin");
  const [ai, setAi] = useState(false);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const idRef = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fromReply = useCallback((r: Reply): Msg => ({ id: idRef.current++, from: "bot", text: r.text, actions: r.actions, chips: r.chips }), []);

  // is AI answering on this site?
  useEffect(() => { fetch("/api/chat", { cache: "no-store" }).then((r) => r.json()).then((j) => setAi(Boolean(j?.ai))).catch(() => {}); }, []);

  // restore the conversation for this browser session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE);
      if (saved) { const m = JSON.parse(saved) as Msg[]; setMsgs(m); idRef.current = m.length + 1; return; }
    } catch {}
    setMsgs([fromReply(WELCOME)]);
  }, [fromReply]);
  useEffect(() => { try { sessionStorage.setItem(STORE, JSON.stringify(msgs.slice(-40))); } catch {} }, [msgs]);

  // one gentle nudge per visit
  useEffect(() => {
    if (hidden) return;
    let seen = false;
    try { seen = sessionStorage.getItem("froshx-chat-teaser") === "1"; } catch {}
    if (seen) return;
    const t = setTimeout(() => { setTeaser(true); try { sessionStorage.setItem("froshx-chat-teaser", "1"); } catch {} }, 9000);
    return () => clearTimeout(t);
  }, [hidden]);
  useEffect(() => { if (!teaser) return; const t = setTimeout(() => setTeaser(false), 9000); return () => clearTimeout(t); }, [teaser]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing, open]);
  useEffect(() => {
    if (!open) return;
    setTeaser(false);
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const send = useCallback(async (raw: string) => {
    const q = raw.trim().slice(0, 500);
    if (!q || typing) return;
    const history = msgs.slice(-8).map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));
    setMsgs((m) => [...m, { id: idRef.current++, from: "user", text: q }]);
    setText("");
    setTyping(true);
    const sid = sessionId();
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // AI on: only fixed, safe answers are instant; everything else goes to the AI. AI off: full built-in answers.
    const local = ai ? quickAnswer(q) : answer(q);
    if (local) {
      await wait(450 + Math.min(700, local.text.length * 3));
      setMsgs((m) => [...m, fromReply(local)]);
      setTyping(false);
      fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ log: true, sid, message: q, answer: local.text.slice(0, 300), intent: local.intent }) }).catch(() => {});
      return;
    }

    let msg: Msg = { id: 0, from: "bot", text: FALLBACK.text, form: { question: q } };
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sid, message: q, history }) });
      const j = await res.json().catch(() => ({}));
      if (j?.reply && !j.handoff) msg = { id: 0, from: "bot", text: j.reply, chips: Array.isArray(j.chips) && j.chips.length ? j.chips : ["Courses & fees", "How to register"] };
      else if (j?.reply && j.handoff) msg = { id: 0, from: "bot", text: `${j.reply}\n\nLeave your email below and we'll get back to you soon.`, form: { question: q } };
      else if (j?.error) msg = { id: 0, from: "bot", text: "I'm having a little trouble answering right now. Leave your email and the FroshX team will reply to you soon.", form: { question: q } };
      else if (j?.limited) msg = { id: 0, from: "bot", text: "You've asked a lot of questions today. Leave your email and the team will reply to you directly.", form: { question: q } };
    } catch {}
    await wait(300);
    setMsgs((m) => [...m, { ...msg, id: idRef.current++ }]);
    setTyping(false);
  }, [msgs, typing, fromReply, ai]);

  const openEnquiry = (question: string) => {
    setMsgs((m) => [...m, { id: idRef.current++, from: "bot", text: "Share your email and what you need, and the team will get back to you soon.", form: { question } }]);
  };
  const lastUserText = [...msgs].reverse().find((m) => m.from === "user")?.text || "";
  const history = msgs.slice(-8).map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));
  const enquiryDone = (id: number, email: string, name: string) => {
    setMsgs((m) => [
      ...m.map((x) => (x.id === id && x.form ? { ...x, form: { ...x.form, done: true } } : x)),
      { id: idRef.current++, from: "bot", text: `Thank you${name ? ", " + name.split(" ")[0] : ""}! 🙌 We've received your question. The FroshX team will reply to ${email} soon.`, chips: ["Courses & fees", "How to register"] },
    ]);
  };

  if (hidden) return <InboxShortcut />;

  return (
    <>
      {!open && (
        <div className="fx-chat-launch flex flex-col items-end gap-2">
          {teaser && (
            <button onClick={() => setOpen(true)} className="fx-teaser max-w-[220px] rounded-2xl rounded-br-md border border-line bg-white px-4 py-3 text-left text-[13px] font-medium leading-snug shadow-soft">
              Need help choosing a course? Ask me 👋
            </button>
          )}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open FroshX assistant"
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-8px_rgba(21,19,15,.6)] transition hover:bg-flare-600"
          >
            <ChatIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Ask FroshX</span>
          </button>
        </div>
      )}

      {open && (
        <div className="fx-chat-panel" role="dialog" aria-label="FroshX assistant">
          <div className="flex items-center gap-3 bg-ink px-5 py-4 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-flare-500"><ChatIcon className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-semibold leading-tight">FroshX Assistant</p>
              <p className="flex items-center gap-1.5 text-xs text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Replies instantly</p>
            </div>
            <a href="https://wa.me/2347041013001" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"><WhatsAppIcon className="h-4 w-4 text-[#25D366]" /></a>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"><CloseIcon className="h-5 w-5" /></button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-cloud px-4 py-5" aria-live="polite">
            {msgs.map((m, i) => (
              <div key={m.id} className={`fx-msg flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] ${m.from === "user" ? "" : "w-full"}`}>
                  <div className={`whitespace-pre-line rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ${m.from === "user" ? "rounded-br-md bg-flare-500 text-white" : "rounded-bl-md border border-line bg-white text-ink"}`}>{m.text}</div>
                  {m.from === "bot" && m.actions && m.actions.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                      {m.actions.map((a) =>
                        a.kind === "enquiry" ? (
                          <button key={a.label} onClick={() => openEnquiry(lastUserText)} className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-flare-600">{a.label}</button>
                        ) : a.external ? (
                          <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[13px] font-semibold text-white hover:brightness-95"><WhatsAppIcon className="h-4 w-4" /> {a.label}</a>
                        ) : (
                          <Link key={a.label} href={a.href} onClick={() => setOpen(false)} className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-flare-600">{a.label}</Link>
                        )
                      )}
                    </div>
                  )}
                  {m.from === "bot" && m.form && !m.form.done && (
                    <EnquiryForm question={m.form.question} history={history} sid={sessionId()} onDone={(email, name) => enquiryDone(m.id, email, name)} />
                  )}
                  {m.from === "bot" && m.chips && i === msgs.length - 1 && !typing && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.chips.map((c) => (
                        <button key={c} onClick={() => send(c)} className="rounded-full border border-flare-300 bg-white px-3.5 py-2 text-[13px] font-semibold text-flare-700 transition hover:bg-flare-50">{c}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="fx-msg flex justify-start"><div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-line bg-white px-4 py-4"><span className="fx-dot" /><span className="fx-dot" style={{ animationDelay: ".15s" }} /><span className="fx-dot" style={{ animationDelay: ".3s" }} /></div></div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="border-t border-line bg-white p-3">
            <div className="flex items-center gap-2">
              <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Type your question…" aria-label="Your message" className="fx-chat-input" />
              <button disabled={!text.trim() || typing} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition hover:bg-flare-600 disabled:opacity-40">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14-7-5 14-2-6-7-1Z" /></svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted">Answers come from FroshX information. For anything else, use WhatsApp.</p>
          </form>
        </div>
      )}
    </>
  );
}
