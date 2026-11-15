"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { startBeat, Beat } from "@/lib/beat";
import "../academy/academy.css";

type Cfg = { enabled: boolean; volume: number; source: "builtin" | "upload" | "url"; url: string; hasUpload: boolean; audioName: string };

export default function MusicAdmin() {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const beat = useRef<Beat | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const ctx = useRef<AudioContext | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/music", { cache: "no-store" });
    if (res.ok) setCfg(await res.json()); else setErr("Could not load music settings.");
  }, []);
  useEffect(() => { load(); }, [load]);

  const stopPreview = useCallback(() => {
    beat.current?.stop(); beat.current = null;
    audio.current?.pause(); audio.current = null;
    setPreviewing(false);
  }, []);
  useEffect(() => () => stopPreview(), [stopPreview]);

  const set = <K extends keyof Cfg>(k: K, v: Cfg[K]) => setCfg((p) => (p ? { ...p, [k]: v } : p));

  const save = async (override?: Partial<Cfg>) => {
    if (!cfg) return;
    const c = { ...cfg, ...override };
    setBusy(true); setErr(""); setNote("");
    const fd = new FormData();
    fd.set("enabled", String(c.enabled)); fd.set("volume", String(c.volume)); fd.set("source", c.source); fd.set("url", c.url);
    if (file && c.source === "upload") fd.set("file", file);
    const res = await fetch("/api/admin/music", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setErr(json.error || "Could not save."); return; }
    setCfg(json); setFile(null);
    setNote(c.enabled ? "Saved. Music is ON. Visitors get it within about a minute." : "Saved. Music is PAUSED for all visitors (within about a minute).");
  };

  const preview = async () => {
    if (!cfg) return;
    if (previewing) { stopPreview(); return; }
    try {
      if (cfg.source === "builtin") {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const c = ctx.current || (ctx.current = new AC());
        await c.resume();
        beat.current = startBeat(c, cfg.volume);
      } else {
        const src = file ? URL.createObjectURL(file) : cfg.source === "url" ? cfg.url : "/api/music/file";
        const a = new Audio(src); a.loop = true; a.volume = cfg.volume;
        await a.play();
        audio.current = a;
      }
      setPreviewing(true);
    } catch { setErr("Could not play a preview. Check the file or link."); }
  };

  useEffect(() => {
    if (!cfg) return;
    beat.current?.setVolume(cfg.volume);
    if (audio.current) audio.current.volume = cfg.volume;
  }, [cfg?.volume]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!cfg) return <p className="mt-8 text-sm text-muted">{err || "Loading…"}</p>;

  return (
    <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold">Website music</h2>
            <p className="mt-1 text-sm text-muted">Currently <b className={cfg.enabled ? "text-green-700" : "text-red-600"}>{cfg.enabled ? "ON" : "PAUSED"}</b> for all visitors.</p>
          </div>
          <button onClick={() => save({ enabled: !cfg.enabled })} disabled={busy} className={`rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-60 ${cfg.enabled ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}>
            {cfg.enabled ? "Pause music" : "Turn music on"}
          </button>
        </div>

        <div>
          <label htmlFor="vol" className="mb-2 flex justify-between text-sm font-medium"><span>Volume</span><span>{Math.round(cfg.volume * 100)}%</span></label>
          <input id="vol" type="range" min={0} max={100} value={Math.round(cfg.volume * 100)} onChange={(e) => set("volume", Number(e.target.value) / 100)} className="w-full accent-[#F97316]" />
          <p className="mt-1.5 text-xs text-muted">Very loud music makes many visitors leave. 50–70% is a safe party-but-pleasant level.</p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Which music?</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {([["builtin", "Built-in beat"], ["upload", "Upload my MP3"], ["url", "Use a link"]] as const).map(([m, l]) => (
              <button key={m} type="button" onClick={() => { stopPreview(); set("source", m); }} aria-pressed={cfg.source === m} className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${cfg.source === m ? "border-flare-500 bg-flare-50" : "border-line hover:border-flare-300"}`}>{l}</button>
            ))}
          </div>
          {cfg.source === "builtin" && <p className="mt-3 text-sm text-muted">A smooth, original beat generated live by the browser. No file needed and no copyright worries.</p>}
          {cfg.source === "upload" && (
            <div className="mt-3">
              <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
              <p className="mt-1.5 text-xs text-muted">{file ? `Selected: ${file.name}` : cfg.hasUpload ? `Current file: ${cfg.audioName || "uploaded track"}` : "No file uploaded yet."} Max 4 MB. Only use music you own or have a licence for.</p>
            </div>
          )}
          {cfg.source === "url" && (
            <div className="mt-3">
              <input className="ax-input" inputMode="url" placeholder="https://…/your-track.mp3" value={cfg.url} onChange={(e) => set("url", e.target.value)} />
              <p className="mt-1.5 text-xs text-muted">Must be a direct link to an audio file you have the right to use.</p>
            </div>
          )}
        </div>

        {err && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</p>}
        {note && <p role="status" className="rounded-xl bg-cloud px-4 py-3 text-sm">{note}</p>}

        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={preview} type="button" className="rounded-full border border-line px-6 py-3.5 text-sm font-semibold hover:border-ink">{previewing ? "Stop preview" : "Preview here"}</button>
          <button onClick={() => save()} disabled={busy} className="flex-1 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white hover:bg-flare-600 disabled:opacity-60">{busy ? "Saving…" : "Save settings"}</button>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-5 text-sm leading-relaxed sm:p-6">
        <h3 className="font-display text-lg font-semibold">How it behaves</h3>
        <ul className="mt-3 space-y-2.5 text-muted">
          <li>Browsers don’t allow sound before a visitor taps or clicks. So the music starts on the <b className="text-ink">first tap or click</b> on the site.</li>
          <li>Visitors see a small speaker button (bottom left) to mute it. If they mute, it stays muted on their device.</li>
          <li>Music is off on /admin and on the student dashboard.</li>
          <li>Pausing here stops it for everyone within about a minute.</li>
        </ul>
      </div>
    </div>
  );
}
