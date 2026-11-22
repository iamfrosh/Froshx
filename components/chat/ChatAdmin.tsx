"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "../academy/academy.css";

type Log = { id: string; question: string; answer: string; source: "rules" | "ai" | "none"; intent: string; at: string };
type Data = { aiReady: boolean; provider: string; stats: { total: number; today: number; aiToday: number; unanswered: number }; logs: Log[] };

const BADGE: Record<string, string> = { rules: "bg-green-50 text-green-700", ai: "bg-blue-50 text-blue-700", none: "bg-red-50 text-red-700" };
const LABEL: Record<string, string> = { rules: "Answered (free)", ai: "Answered (AI)", none: "Not answered" };

export default function ChatAdmin() {
  const [data, setData] = useState<Data | null>(null);
  const [denied, setDenied] = useState(false);
  const [only, setOnly] = useState(false);

  useEffect(() => {
    fetch("/api/admin/chat", { cache: "no-store" }).then(async (r) => {
      if (r.status === 401) { setDenied(true); return; }
      setData(await r.json());
    }).catch(() => {});
  }, []);

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
      <p className="mt-1 text-sm text-muted">What visitors ask. Questions marked “Not answered” are ideas for new answers or content.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Questions today", data.stats.today], ["All questions (90 days)", data.stats.total], ["AI answers today", data.stats.aiToday], ["Not answered", data.stats.unanswered]].map(([l, v]) => (
          <div key={String(l)} className="rounded-2xl border border-line bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wider text-muted">{l}</p><p className="font-display mt-2 text-3xl font-semibold">{v}</p></div>
        ))}
      </div>

      <p className="mt-5 rounded-2xl border border-line bg-cloud px-4 py-3 text-sm">
        AI mode: <b>{data.aiReady ? `ON (${data.provider})` : "OFF"}</b>. {data.aiReady ? "It only answers questions the free assistant couldn’t, with daily limits." : "Only the free built-in answers are used. Unknown questions are handed to WhatsApp."}
      </p>

      <label className="mt-6 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-[#F97316]" checked={only} onChange={(e) => setOnly(e.target.checked)} /> Show only questions that were not answered</label>

      <ul className="mt-4 space-y-3">
        {logs.length === 0 && <li className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-muted">Nothing here yet.</li>}
        {logs.map((l) => (
          <li key={l.id} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2.5 py-1 font-bold ${BADGE[l.source]}`}>{LABEL[l.source]}</span>
              <span className="text-muted">{new Date(l.at).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
            </div>
            <p className="mt-2 font-semibold">{l.question}</p>
            {l.answer && <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-muted">{l.answer}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
