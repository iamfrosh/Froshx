"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ChristmasLayer from "../christmas/ChristmasLayer";
import ChristmasTree from "../christmas/ChristmasTree";
import SantaHat from "../christmas/SantaHat";
import { christmasActive } from "../christmas/christmasConfig";
import { startSnow } from "../christmas/snowEngine";
import "./academy.css";
import "../christmas/christmas.css";

// Branded splash shown once per browser session, then it fades away.
// In the Christmas season it is a tree that lights up under falling snow. It also mounts the Christmas layer.
export default function PageLoader() {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);
  const [xmas, setXmas] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const season = christmasActive();
    setXmas(season);
    let seen = false;
    try { seen = sessionStorage.getItem("froshx-loaded") === "1"; } catch {}
    if (seen) { setShow(false); return; }
    const done = () => {
      setFade(true);
      try { sessionStorage.setItem("froshx-loaded", "1"); } catch {}
      setTimeout(() => setShow(false), 500);
    };
    const minimum = new Promise((r) => setTimeout(r, season ? 1800 : 1100));
    const loaded = new Promise<void>((r) => {
      if (document.readyState === "complete") r();
      else window.addEventListener("load", () => r(), { once: true });
    });
    Promise.all([minimum, loaded]).then(done);
    const safety = setTimeout(done, 4500);
    return () => clearTimeout(safety);
  }, []);

  useEffect(() => {
    if (!show || !xmas || !canvasRef.current) return;
    return startSnow(canvasRef.current, { count: 46, sparkles: 6, trail: false, bursts: false });
  }, [show, xmas]);

  return (
    <>
      <ChristmasLayer />
      {show && (
        <div aria-hidden className={xmas ? `xm-loader ${fade ? "opacity-0" : "opacity-100"}` : `fixed inset-0 z-[300] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${fade ? "opacity-0" : "opacity-100"}`}>
          {xmas ? (
            <>
              <canvas ref={canvasRef} />
              <div className="relative">
                <ChristmasTree className="mx-auto h-36 w-auto" />
              </div>
              <div className="relative mt-3">
                <Image src="/images/froshx-logo.png" alt="" width={220} height={70} priority className="h-12 w-auto" />
                <SantaHat className="absolute -left-2 -top-4 w-[30px]" />
              </div>
              <div className="xm-bar relative"><span /></div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </>
  );
}
