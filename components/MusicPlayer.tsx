"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { startBeat, Beat } from "@/lib/beat";
import "./academy/academy.css";

type Cfg = { enabled: boolean; volume: number; source: "builtin" | "upload" | "url"; src: string };
const KEY = "froshx-music";
const CACHE = "froshx-music-cfg";

// Plays the site music (set in /admin). Browsers only allow sound after a real tap, click or key press
// (scrolling does not count), so the music starts on the first one and a clear "Tap to play" button is shown.
export default function MusicPlayer() {
  const pathname = usePathname();
  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const beatRef = useRef<Beat | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const runKey = useRef("");
  const cfgRef = useRef<Cfg | null>(null);
  const wantRef = useRef(false);
  const playingRef = useRef(false);
  cfgRef.current = cfg;
  playingRef.current = playing;

  const shouldPlay = Boolean(cfg && cfg.enabled && !muted && !hidden);
  wantRef.current = shouldPlay;

  // saved choice + last known settings (so we don't wait for the network)
  useEffect(() => {
    try {
      setMuted(localStorage.getItem(KEY) === "off");
      const cached = localStorage.getItem(CACHE);
      if (cached) setCfg(JSON.parse(cached));
    } catch {}
  }, []);

  // read the settings now and every minute (so "pause" in admin reaches visitors)
  useEffect(() => {
    let live = true;
    const load = () =>
      fetch("/api/music", { cache: "no-store" })
        .then((r) => r.json())
        .then((j: Cfg) => {
          if (!live) return;
          setCfg(j);
          try { localStorage.setItem(CACHE, JSON.stringify(j)); } catch {}
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => { live = false; clearInterval(t); };
  }, []);

  const stop = useCallback(() => {
    beatRef.current?.stop(); beatRef.current = null;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    runKey.current = "";
    setPlaying(false);
  }, []);

  // note: the first await must come AFTER resume()/play() so the browser still sees the tap
  const start = useCallback(async () => {
    const c = cfgRef.current;
    if (!c) return;
    const key = `${c.source}|${c.src}`;
    if (runKey.current === key && playingRef.current) return;
    stop();
    try {
      if (c.source === "builtin") {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AC) return;
        const ctx = ctxRef.current || (ctxRef.current = new AC());
        const resumed = ctx.resume();
        await resumed.catch(() => {});
        if (ctx.state !== "running") return; // still blocked: wait for a tap
        beatRef.current = startBeat(ctx, c.volume);
      } else {
        const a = new Audio(c.src);
        a.loop = true; a.volume = c.volume; a.preload = "auto";
        await a.play();
        audioRef.current = a;
      }
      runKey.current = key;
      setPlaying(true);
    } catch {
      /* blocked until the visitor taps; listeners below are already waiting */
    }
  }, [stop]);

  // start / stop depending on settings, page and the visitor's choice
  useEffect(() => {
    if (!cfg) return;
    if (!shouldPlay) { stop(); return; }
    start();
  }, [cfg, shouldPlay, start, stop]);

  // always listening for the first real interaction, from the moment the page opens
  useEffect(() => {
    const go = () => { if (wantRef.current && !playingRef.current) start(); };
    const evs = ["pointerup", "touchend", "mousedown", "keydown", "click"] as const;
    evs.forEach((e) => window.addEventListener(e, go, { capture: true, passive: true }));
    return () => evs.forEach((e) => window.removeEventListener(e, go, { capture: true }));
  }, [start]);

  // live volume changes
  useEffect(() => {
    if (!cfg) return;
    beatRef.current?.setVolume(cfg.volume);
    if (audioRef.current) audioRef.current.volume = cfg.volume;
  }, [cfg]);

  // pause while the tab is in the background
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) { ctxRef.current?.suspend().catch(() => {}); audioRef.current?.pause(); }
      else { ctxRef.current?.resume().catch(() => {}); if (playingRef.current) audioRef.current?.play().catch(() => {}); }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    try { localStorage.setItem(KEY, next ? "off" : "on"); } catch {}
  };

  if (!cfg || !cfg.enabled || hidden) return null;

  const on = playing && !muted;
  return (
    <>
      {/* clear call to action while the browser is still waiting for a tap */}
      {shouldPlay && !playing && (
        <button
          onClick={() => start()}
          className="ax-rise fixed bottom-24 left-1/2 z-[81] flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-10px_rgba(0,0,0,.6)]"
          style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <span aria-hidden className="flex h-4 items-end gap-[3px]">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-[3px] rounded-full bg-flare-500" style={{ height: "100%", transformOrigin: "bottom", animation: `ax-eq ${0.6 + i * 0.15}s ease-in-out ${i * 0.1}s infinite alternate` }} />
            ))}
          </span>
          Tap to play music
        </button>
      )}

      <div className="fixed bottom-5 left-4 z-[79] sm:bottom-6 sm:left-6" style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <button
          onClick={toggle}
          aria-label={muted ? "Play background music" : "Mute background music"}
          aria-pressed={!muted}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-ink shadow-soft transition hover:scale-105"
        >
          {on ? (
            <span aria-hidden className="flex h-5 items-end gap-[3px]">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className="w-[3px] rounded-full bg-flare-500" style={{ height: "100%", transformOrigin: "bottom", animation: `ax-eq ${0.7 + i * 0.13}s ease-in-out ${i * 0.08}s infinite alternate` }} />
              ))}
            </span>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M11 5 6 9H3v6h3l5 4V5Z" />
              {muted ? <path d="m16 9 5 6M21 9l-5 6" /> : <path d="M16 9a4 4 0 0 1 0 6" />}
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
