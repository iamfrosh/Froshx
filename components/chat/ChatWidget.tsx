"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { answer, FALLBACK, WELCOME, Action, Reply } from "@/lib/chatKnowledge";
import { WhatsAppIcon, CloseIcon } from "../Icons";
import "./chat.css";

type Msg = { id: number; from: "user" | "bot"; text: string; actions?: Action[]; chips?: string[] };
const STORE = "froshx-chat";
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

// Floating website assistant. Answers from FroshX's own information for free; hands over to WhatsApp when unsure.
export default function ChatWidget() {
  const pathname = usePathname();
  const hidden = pathname.startsWith("/admin");
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [teaser, setTeaser] = useState(false);
  const idRef = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fromReply = useCallback((r: Reply): Msg => ({ id: idRef.current++, from: "bot", text: r.text, actions: r.actions, chips: r.chips }), []);

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

    const local = answer(q);
    if (local) {
      await wait(450 + Math.min(700, local.text.length * 3));
      setMsgs((m) => [...m, fromReply(local)]);
      setTyping(false);
      fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ log: true, sid, message: q, answer: local.text.slice(0, 300), intent: local.intent }) }).catch(() => {});
      return;
    }

    // not covered by the built-in knowledge: the server may use AI, or hands over to the team
    let reply: Reply = FALLBACK;
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sid, message: q, history }) });
      const j = await res.json().catch(() => ({}));
      if (j?.reply) reply = { intent: "ai", text: j.reply, actions: FALLBACK.actions?.slice(0, 1), chips: ["Courses & fees", "How to register"] };
      else if (j?.limited) reply = { ...FALLBACK, text: "You've asked a lot of questions today, so I'll hand you over to the team. They can answer on WhatsApp." };
    } catch {}
    await wait(300);
    setMsgs((m) => [...m, fromReply(reply)]);
    setTyping(false);
  }, [msgs, typing, fromReply]);

  if (hidden) return null;

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
                        a.external ? (
                          <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-[13px] font-semibold text-white hover:brightness-95"><WhatsAppIcon className="h-4 w-4" /> {a.label}</a>
                        ) : (
                          <Link key={a.label} href={a.href} onClick={() => setOpen(false)} className="inline-flex items-center justify-center rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-flare-600">{a.label}</Link>
                        )
                      )}
                    </div>
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
