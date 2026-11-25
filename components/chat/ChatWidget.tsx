"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { answer, quickAnswer, FALLBACK, WELCOME, Action, Reply } from "@/lib/chatKnowledge";
import { WhatsAppIcon, CloseIcon } from "../Icons";
import "./chat.css";

type Msg = { id: number; from: "user" | "bot"; text: string; actions?: Action[]; chips?: string[]; form?: { question: string; done?: boolean } };
const STORE = "froshx-chat";
const AWAIT = "froshx-chat-await";
const NAME_KEY = "froshx-chat-name";
const SID = "froshx-sid";
const POPUP = "froshx-chat-popup";
const MENU = ["Courses & fees", "How to register", "Get a website quote"];

function sessionId() {
  try {
    let s = sessionStorage.getItem(SID);
    if (!s) { s = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem(SID, s); }
    return s;
  } catch { return "anon"; }
}

const NOT_NAMES = new Set(["hi", "hello", "hey", "yes", "no", "ok", "okay", "help", "skip", "thanks", "thank you", "courses", "fees", "price", "prices", "register", "contact", "start", "what", "who", "why", "how", "when", "where", "please", "test", "interested", "looking", "new", "here", "just", "fine", "good", "ready", "student", "from", "learning", "trying", "wondering", "curious", "planning", "back", "sure", "nothing", "none"]);

// pulls a first name out of replies like "Amina", "my name is Amina", "I'm Amina". Returns null when it looks like a question.
function extractName(raw: string): string | null {
  const t = raw.trim().replace(/[.!]+$/, "").replace(/^(hi|hello|hey|good (morning|afternoon|evening))[,!\s]+/i, "");
  const m = t.match(/^(?:my name is|my name's|name is|i am|i'm|im|this is|call me|it's|its|they call me)\s+([A-Za-zÀ-ÿ'’ -]{2,40})$/i);
  const cand = (m ? m[1] : t).trim();
  if (!/^[A-Za-zÀ-ÿ'’-]+( [A-Za-zÀ-ÿ'’-]+){0,2}$/.test(cand) || cand.length < 2 || cand.length > 30) return null;
  if (NOT_NAMES.has(cand.toLowerCase())) return null;
  if (!m && answer(cand)) return null; // a FroshX question, not a name
  return cand.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const ChatIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /><path d="M8.5 11h7M8.5 14h4" />
  </svg>
);

function Avatar({ className = "h-10 w-10" }: { className?: string }) {
  return <span className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-flare-500 to-flare-300 font-display font-bold text-white ${className}`} aria-hidden="true">F</span>;
}

function EnquiryForm({ question, history, sid, initialName, onDone }: { question: string; history: { role: string; content: string }[]; sid: string; initialName: string; onDone: (email: string, name: string) => void }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState(initialName);
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
      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Your name" aria-label="Your name" className="fx-chat-input !rounded-xl" />
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

// Frosh: the floating website assistant. Greets, asks the visitor's name, answers questions and hands over to the team when unsure.
export default function ChatWidget() {
  const pathname = usePathname();
  const hidden = pathname.startsWith("/admin");
  const quiet = hidden || pathname.startsWith("/dashboard");
  const [ai, setAi] = useState(false);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [popup, setPopup] = useState(false);
  const [name, setName] = useState("");
  const [awaitingName, setAwaitingName] = useState(false);
  const idRef = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const bot = useCallback((t: string, chips?: string[]): Msg => ({ id: idRef.current++, from: "bot", text: t, chips }), []);
  const fromReply = useCallback((r: Reply): Msg => ({ id: idRef.current++, from: "bot", text: r.text, actions: r.actions, chips: r.chips }), []);

  // is AI answering on this site?
  useEffect(() => { fetch("/api/chat", { cache: "no-store" }).then((r) => r.json()).then((j) => setAi(Boolean(j?.ai))).catch(() => {}); }, []);

  // restore the conversation, or start: welcome back by name, or introduce Frosh and ask for the name
  useEffect(() => {
    let n = "";
    try { n = localStorage.getItem(NAME_KEY) || ""; } catch {}
    setName(n);
    try {
      const saved = sessionStorage.getItem(STORE);
      if (saved) { const m = JSON.parse(saved) as Msg[]; if (m.length) { setMsgs(m); idRef.current = m.length + 10; setAwaitingName(sessionStorage.getItem(AWAIT) === "1"); return; } }
    } catch {}
    if (n) setMsgs([bot(`Welcome back, ${n.split(" ")[0]}! 👋 I'm Frosh. How can I help you today?`, MENU)]);
    else { setMsgs([bot("Hi! 👋 I'm Frosh, the FroshX assistant. What's your name?", ["Skip"])]); setAwaitingName(true); }
  }, [bot]);
  useEffect(() => { try { sessionStorage.setItem(STORE, JSON.stringify(msgs.slice(-40))); sessionStorage.setItem(AWAIT, awaitingName ? "1" : "0"); } catch {} }, [msgs, awaitingName]);

  // after about two screens of scrolling, offer help once per visit
  useEffect(() => {
    if (quiet) return;
    let seen = false;
    try { seen = sessionStorage.getItem(POPUP) === "1"; } catch {}
    if (seen) return;
    const show = () => {
      setPopup(true);
      try { sessionStorage.setItem(POPUP, "1"); } catch {}
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const goal = Math.min(window.innerHeight * 2, scrollable * 0.6);
      if (scrollable > 200 && window.scrollY >= goal) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const fallback = setTimeout(show, 45000); // short pages that barely scroll
    return () => { window.removeEventListener("scroll", onScroll); clearTimeout(fallback); };
  }, [quiet]);
  useEffect(() => { if (!popup) return; const t = setTimeout(() => setPopup(false), 20000); return () => clearTimeout(t); }, [popup]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, typing, open]);
  useEffect(() => {
    if (!open) return;
    setPopup(false);
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { clearTimeout(t); window.removeEventListener("keydown", onKey); };
  }, [open]);

  const send = useCallback(async (raw: string) => {
    const q = raw.trim().slice(0, 500);
    if (!q || typing) return;
    const history = msgs.slice(-10).map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));
    setMsgs((m) => [...m, { id: idRef.current++, from: "user", text: q }]);
    setText("");
    const sid = sessionId();
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // the very first reply is treated as their name
    if (awaitingName) {
      setAwaitingName(false);
      setTyping(true);
      if (/^skip\b/i.test(q)) {
        await wait(450);
        setMsgs((m) => [...m, bot("No problem! How can I help you today?", MENU)]);
        setTyping(false);
        return;
      }
      const nm = extractName(q);
      if (nm) {
        setName(nm);
        try { localStorage.setItem(NAME_KEY, nm); } catch {}
        await wait(600);
        setMsgs((m) => [...m, bot(`Nice to meet you, ${nm.split(" ")[0]}! 😊 How can I help you today?`, MENU)]);
        setTyping(false);
        return;
      }
      // it was a question, not a name: carry on and answer it
    }

    setTyping(true);
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
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sid, message: q, history, name }) });
      const j = await res.json().catch(() => ({}));
      if (j?.reply && !j.handoff) msg = { id: 0, from: "bot", text: j.reply, chips: Array.isArray(j.chips) && j.chips.length ? j.chips : ["Courses & fees", "How to register"] };
      else if (j?.reply && j.handoff) msg = { id: 0, from: "bot", text: `${j.reply}\n\nLeave your email below and we'll get back to you soon.`, form: { question: q } };
      else if (j?.error) msg = { id: 0, from: "bot", text: "I'm having a little trouble answering right now. Leave your email and the FroshX team will reply to you soon.", form: { question: q } };
      else if (j?.limited) msg = { id: 0, from: "bot", text: "You've asked a lot of questions today. Leave your email and the team will reply to you directly.", form: { question: q } };
    } catch {}
    await wait(300);
    setMsgs((m) => [...m, { ...msg, id: idRef.current++ }]);
    setTyping(false);
  }, [msgs, typing, fromReply, ai, awaitingName, name, bot]);

  const openEnquiry = (question: string) => {
    setMsgs((m) => [...m, { id: idRef.current++, from: "bot", text: "Share your email and what you need, and the team will get back to you soon.", form: { question } }]);
  };
  const lastUserText = [...msgs].reverse().find((m) => m.from === "user")?.text || "";
  const history = msgs.slice(-8).map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));
  const enquiryDone = (id: number, email: string, nm: string) => {
    setMsgs((m) => [
      ...m.map((x) => (x.id === id && x.form ? { ...x, form: { ...x.form, done: true } } : x)),
      { id: idRef.current++, from: "bot", text: `Thank you${nm ? ", " + nm.split(" ")[0] : ""}! 🙌 We've received your question. The FroshX team will reply to ${email} soon.`, chips: ["Courses & fees", "How to register"] },
    ]);
  };

  if (hidden) return <InboxShortcut />;

  return (
    <>
      {!open && (
        <div className="fx-chat-launch flex flex-col items-end gap-2">
          {popup && (
            <div className="fx-teaser w-[min(300px,calc(100vw-32px))] rounded-3xl rounded-br-lg border border-line bg-white p-4 shadow-[0_20px_50px_-15px_rgba(21,19,15,.45)]" role="dialog" aria-label="Chat with Frosh">
              <div className="flex items-start gap-3">
                <Avatar />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-sm font-semibold leading-tight">Frosh <span className="font-normal text-muted">· FroshX Assistant</span></p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink/80">Hi there! 👋 I'm Frosh, the FroshX assistant. How may I help you?</p>
                </div>
                <button onClick={() => setPopup(false)} aria-label="Dismiss" className="-mr-1 -mt-1 p-1 text-muted hover:text-ink"><CloseIcon className="h-4 w-4" /></button>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setOpen(true)} className="flex-1 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-flare-600">Chat with Frosh</button>
                <button onClick={() => setPopup(false)} className="rounded-full border border-line px-4 py-2.5 text-[13px] font-semibold text-muted hover:text-ink">Later</button>
              </div>
            </div>
          )}
          <button
            onClick={() => setOpen(true)}
            aria-label="Chat with Frosh, the FroshX assistant"
            className="flex items-center gap-2 rounded-full bg-ink px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_-8px_rgba(21,19,15,.6)] transition hover:bg-flare-600"
          >
            <ChatIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Ask Frosh</span>
          </button>
        </div>
      )}

      {open && (
        <div className="fx-chat-panel" role="dialog" aria-label="Frosh, the FroshX assistant">
          <div className="flex items-center gap-3 bg-ink px-5 py-4 text-white">
            <Avatar />
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-semibold leading-tight">Frosh</p>
              <p className="flex items-center gap-1.5 text-xs text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-green-400" /> FroshX Assistant · online</p>
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
                    <EnquiryForm question={m.form.question} history={history} sid={sessionId()} initialName={name} onDone={(email, nm) => enquiryDone(m.id, email, nm)} />
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
              <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={awaitingName ? "Type your name…" : "Type your question…"} aria-label="Your message" className="fx-chat-input" />
              <button disabled={!text.trim() || typing} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition hover:bg-flare-600 disabled:opacity-40">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 14-7-5 14-2-6-7-1Z" /></svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted">Frosh answers from FroshX information. For anything else, use WhatsApp.</p>
          </form>
        </div>
      )}
    </>
  );
}
