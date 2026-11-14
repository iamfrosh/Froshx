"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { QUOTES } from "@/lib/quotes";
import { ChevronLeftIcon, ChevronRightIcon } from "./AcademyIcons";
import "./academy.css";

const DELAY = 6500;

export default function QuoteSlider() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const startX = useRef<number | null>(null);
  const n = QUOTES.length;

  const go = useCallback((to: number) => setI((to + n) % n), [n]);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), DELAY);
    return () => clearInterval(t);
  }, [paused, reduced, n]);

  return (
    <div
      className="relative overflow-hidden rounded-[32px] bg-ink px-5 py-12 text-white sm:px-12 sm:py-16"
      role="region"
      aria-roledescription="carousel"
      aria-label="Quotes about learning"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => { startX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        if (startX.current !== null) {
          const dx = e.changedTouches[0].clientX - startX.current;
          if (Math.abs(dx) > 45) go(i + (dx < 0 ? 1 : -1));
        }
        startX.current = null;
        setPaused(false);
      }}
    >
      <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-flare-gradient opacity-25 blur-[90px]" />
      <span aria-hidden className="font-display absolute left-5 top-2 text-[120px] leading-none text-flare-500/30 sm:left-10 sm:text-[160px]">“</span>

      <div className="relative overflow-hidden">
        <div className="flex transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
          {QUOTES.map((q, idx) => (
            <figure key={q.text} className="flex min-h-[210px] w-full shrink-0 flex-col justify-center px-1 sm:min-h-[190px] sm:px-6" aria-hidden={idx !== i} aria-label={`${idx + 1} of ${n}`}>
              <blockquote className="font-display mx-auto max-w-3xl text-balance text-center text-[22px] font-medium leading-snug sm:text-3xl md:text-[34px]">
                {q.text}
              </blockquote>
              <figcaption className="mt-6 text-center text-sm font-semibold text-flare-300">{q.by}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="relative mt-8 flex items-center justify-center gap-4">
        <button onClick={() => go(i - 1)} aria-label="Previous quote" className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10 sm:flex">
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          {QUOTES.map((q, idx) => (
            <button key={q.text} onClick={() => go(idx)} aria-label={`Show quote ${idx + 1}`} aria-current={idx === i}
              className={`h-2 rounded-full transition-all duration-300 ${idx === i ? "w-7 bg-flare-500" : "w-2 bg-white/30 hover:bg-white/50"}`} />
          ))}
        </div>
        <button onClick={() => go(i + 1)} aria-label="Next quote" className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/20 transition hover:bg-white/10 sm:flex">
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
