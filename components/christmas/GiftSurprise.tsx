"use client";

import { useEffect, useRef, useState } from "react";
import { sparkleBurst } from "./christmasConfig";

export function GiftSvg({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 190" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="xg-red" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#E63946" /><stop offset="1" stopColor="#A10F25" /></linearGradient>
        <linearGradient id="xg-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE08A" /><stop offset="1" stopColor="#E8B84A" /></linearGradient>
      </defs>
      <rect x="36" y="92" width="128" height="88" rx="8" fill="url(#xg-red)" />
      <rect x="90" y="92" width="20" height="88" fill="url(#xg-gold)" />
      <g className="xm-lid">
        <rect x="28" y="64" width="144" height="34" rx="8" fill="url(#xg-red)" />
        <rect x="90" y="64" width="20" height="34" fill="url(#xg-gold)" />
        <path d="M100 64 C78 40 54 40 60 56 C64 66 88 66 100 64 Z" fill="url(#xg-gold)" />
        <path d="M100 64 C122 40 146 40 140 56 C136 66 112 66 100 64 Z" fill="url(#xg-gold)" />
        <circle cx="100" cy="62" r="9" fill="#F1A91B" />
      </g>
    </svg>
  );
}

export function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#C8102E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v8h14v-8M12 8v12" /><path d="M12 8C10 4.5 6.500 4 7 6.500 7.300 8 10 8 12 8Zm0 0c2-3.500 5.500-4 5-1.500C16.700 8 14 8 12 8Z" stroke="#E8B84A" />
    </svg>
  );
}

export default function GiftSurprise() {
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const openGift = () => {
    setShow(true);
    setOpen(false);
    setTimeout(() => {
      setOpen(true);
      sparkleBurst(window.innerWidth / 2, window.innerHeight / 2 - 60, 26);
    }, 450);
  };
  const close = () => { setShow(false); setOpen(false); };

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    setTimeout(() => closeRef.current?.focus(), 900);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  return (
    <>
      <button onClick={openGift} aria-label="Open a Christmas surprise" className="xm-gift"><GiftIcon /></button>
      {show && (
        <div className="xm-modal" onClick={close} role="dialog" aria-modal="true" aria-label="Christmas greeting">
          <div className={`xm-card ${open ? "xm-open" : ""}`} onClick={(e) => e.stopPropagation()}>
            <div className="xm-rays" aria-hidden="true" />
            <GiftSvg className="relative mx-auto h-44 w-44" />
            <div className="xm-msg relative">
              <h2 className="font-display text-2xl font-semibold leading-tight text-ink">Merry Christmas from the FroshX Team! 🎁</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">Thank you for being part of our journey. May your season be full of joy, creativity and great things to build.</p>
              <button ref={closeRef} onClick={close} className="mt-6 inline-flex rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-flare-600">Thank you!</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
