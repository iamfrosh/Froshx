"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import SantaHat from "./SantaHat";
import ChristmasTree from "./ChristmasTree";
import { reducedMotion } from "./christmasConfig";
import { startSnow } from "./snowEngine";

// Full-screen festive greeting shown once after a successful login, then it fades away on its own.
export default function ChristmasWelcome({ name, onDone }: { name?: string; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [out, setOut] = useState(false);
  const duration = reducedMotion() ? 3500 : 5500;

  const finish = useCallback(() => {
    setOut(true);
    setTimeout(onDone, 450);
  }, [onDone]);

  useEffect(() => {
    const stop = canvasRef.current ? startSnow(canvasRef.current, { count: 64, sparkles: 10, trail: false, bursts: false }) : () => {};
    const timer = setTimeout(finish, duration);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" || e.key === "Enter") finish(); };
    window.addEventListener("keydown", onKey);
    return () => { stop(); clearTimeout(timer); window.removeEventListener("keydown", onKey); };
  }, [finish, duration]);

  const first = (name || "").trim().split(/\s+/)[0];
  const words = ["Welcome", "Back", "to", "FroshX!"];

  return (
    <div className={`xm-welcome ${out ? "xm-out" : ""}`} role="dialog" aria-modal="true" aria-label="Welcome back to FroshX">
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="xm-w-in">
        <div className="xm-w mx-auto" style={{ ["--d" as string]: "0.1s" }}>
          <ChristmasTree className="mx-auto h-28 w-auto sm:h-32" />
        </div>

        <div className="xm-w relative mx-auto mt-5 inline-block rounded-2xl bg-white px-5 py-3 shadow-[0_14px_40px_-12px_rgba(0,0,0,.5)]" style={{ ["--d" as string]: "0.35s" }}>
          <Image src="/images/froshx-logo.png" alt="FroshX" width={160} height={50} className="h-9 w-auto" priority />
          <SantaHat className="absolute -left-2 -top-4 w-[32px]" />
        </div>

        {first && <p className="xm-w mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-[#FFE9A8]" style={{ ["--d" as string]: "0.6s" }}>Hello, {first}</p>}

        <h1 className="mt-3 font-display text-[34px] font-bold leading-[1.08] sm:text-6xl">
          {words.map((w, i) => (
            <span key={w} className="xm-w xm-w-h mr-[0.25em] inline-block" style={{ ["--d" as string]: `${0.8 + i * 0.16}s` }}>{w}</span>
          ))}
          <span className="xm-w inline-block" style={{ ["--d" as string]: "1.5s", color: "#fff", WebkitTextFillColor: "#fff" }}>🎄</span>
        </h1>

        <p className="xm-w mx-auto mt-5 max-w-md text-base leading-relaxed text-white/80 sm:text-lg" style={{ ["--d" as string]: "1.7s" }}>
          The season of giving, creating and building something amazing is here!
        </p>

        <div className="xm-w-bar xm-w" style={{ ["--d" as string]: "0.4s", ["--dur" as string]: `${duration}ms` }}><span /></div>
        <button onClick={finish} className="xm-w mt-6 rounded-full border border-white/30 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10" style={{ ["--d" as string]: "2s" }}>
          Skip
        </button>
      </div>
    </div>
  );
}
