"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import "./academy.css";

// Branded splash shown once per browser session, then fades away.
export default function PageLoader() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("froshx-loaded") === "1"; } catch {}
    if (seen) { setShow(false); return; }
    const done = () => {
      setFade(true);
      try { sessionStorage.setItem("froshx-loaded", "1"); } catch {}
      setTimeout(() => setShow(false), 450);
    };
    const minimum = new Promise((r) => setTimeout(r, 1100));
    const loaded = new Promise<void>((r) => {
      if (document.readyState === "complete") r();
      else window.addEventListener("load", () => r(), { once: true });
    });
    Promise.all([minimum, loaded]).then(done);
    const safety = setTimeout(done, 4000);
    return () => clearTimeout(safety);
  }, []);

  if (!show) return null;
  return (
    <div
      aria-hidden
      className={`fixed inset-0 z-[300] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}
    >
      <div className="ax-loader-logo">
        <Image src="/images/froshx-logo.png" alt="" width={220} height={70} priority className="h-14 w-auto" />
      </div>
      <div className="mt-8 h-1 w-44 overflow-hidden rounded-full bg-[#E7E2DA]">
        <div className="ax-loader-bar h-full rounded-full bg-gradient-to-r from-flare-500 to-flare-300" />
      </div>
      <div className="mt-5 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="ax-loader-dot h-1.5 w-1.5 rounded-full bg-flare-500" style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  );
}
