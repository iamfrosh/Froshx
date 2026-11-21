// Lightweight canvas snowfall: pre-drawn sprites, no per-frame filters, pauses when the tab is hidden.
export type SnowOptions = { count?: number; sparkles?: number; trail?: boolean; bursts?: boolean; maxDpr?: number };

type Flake = { x: number; y: number; r: number; vy: number; vx: number; ph: number; a: number };
type Spark = { x: number; y: number; s: number; ph: number; sp: number; vy: number };
type Pt = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number };

function sprite(size: number, draw: (c: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  if (g) draw(g, size);
  return c;
}
// white flake with a soft cool edge, so it shows on white pages and on dark ones
const makeFlake = () =>
  sprite(32, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.55, "rgba(255,255,255,0.97)");
    gr.addColorStop(0.8, "rgba(196,216,238,0.85)");
    gr.addColorStop(1, "rgba(180,205,232,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
  });
// warm gold four-point sparkle with a glow
const makeSpark = () =>
  sprite(64, (g, s) => {
    const gr = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    gr.addColorStop(0, "rgba(255,226,140,0.95)");
    gr.addColorStop(0.35, "rgba(255,200,80,0.35)");
    gr.addColorStop(1, "rgba(255,200,80,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, s, s);
    g.fillStyle = "#FFF6D6";
    g.beginPath();
    g.moveTo(32, 5); g.lineTo(36, 28); g.lineTo(59, 32); g.lineTo(36, 36);
    g.lineTo(32, 59); g.lineTo(28, 36); g.lineTo(5, 32); g.lineTo(28, 28);
    g.closePath(); g.fill();
  });

export function startSnow(canvas: HTMLCanvasElement, o: SnowOptions = {}): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, o.maxDpr ?? 1.5);
  const flakeS = makeFlake();
  const sparkS = makeSpark();
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  let w = 0, h = 0, raf = 0, last = 0, t = 0, trailAt = 0;
  let flakes: Flake[] = [];
  let sparks: Spark[] = [];
  let pts: Pt[] = [];

  const newFlake = (anywhere: boolean): Flake => {
    const big = Math.random() < 0.14;
    const r = big ? rnd(4, 6.5) : rnd(1.4, 3.7);
    return { x: rnd(0, w), y: anywhere ? rnd(0, h) : -10, r, vy: 14 + r * 9 + rnd(0, 12), vx: rnd(-6, 6), ph: rnd(0, 6.28), a: big ? rnd(0.3, 0.5) : rnd(0.55, 0.95) };
  };
  const newSpark = (anywhere: boolean): Spark => ({ x: rnd(0, w), y: anywhere ? rnd(0, h) : -10, s: rnd(9, 17), ph: rnd(0, 6.28), sp: rnd(1.4, 2.6), vy: rnd(4, 9) });

  const resize = () => {
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const target = o.count ?? Math.round(Math.min(70, Math.max(24, w / 18)));
    while (flakes.length < target) flakes.push(newFlake(true));
    flakes.length = Math.min(flakes.length, target);
    const st = o.sparkles ?? (w < 640 ? 4 : 8);
    while (sparks.length < st) sparks.push(newSpark(true));
    sparks.length = Math.min(sparks.length, st);
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      ctx.globalAlpha = f.a;
      ctx.drawImage(flakeS, f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
    }
    for (const s of sparks) {
      ctx.globalAlpha = 0.2 + 0.8 * Math.max(0, Math.sin(t * s.sp + s.ph));
      ctx.drawImage(sparkS, s.x - s.s / 2, s.y - s.s / 2, s.s, s.s);
    }
    for (const p of pts) {
      ctx.globalAlpha = Math.max(0, p.life / p.max);
      ctx.drawImage(sparkS, p.x - p.s / 2, p.y - p.s / 2, p.s, p.s);
    }
    ctx.globalAlpha = 1;
  };

  const frame = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now;
    t += dt;
    for (const f of flakes) {
      f.y += f.vy * dt;
      f.x += (Math.sin(t * 0.6 + f.ph) * 14 + f.vx) * dt;
      if (f.y > h + 8) { f.y = -8; f.x = rnd(0, w); }
      if (f.x > w + 8) f.x = -8; else if (f.x < -8) f.x = w + 8;
    }
    for (const s of sparks) {
      s.y += s.vy * dt;
      if (s.y > h + 10) { s.y = -10; s.x = rnd(0, w); }
    }
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 80 * dt;
      if (p.life <= 0) pts.splice(i, 1);
    }
    draw();
    raf = requestAnimationFrame(frame);
  };

  const burst = (x: number, y: number, n: number) => {
    for (let i = 0; i < n && pts.length < 90; i++) {
      const a = rnd(0, 6.28), v = rnd(40, 130);
      pts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: rnd(0.5, 0.95), max: 0.95, s: rnd(8, 16) });
    }
  };
  const onBurst = (e: Event) => { const d = (e as CustomEvent).detail; burst(d.x, d.y, d.n ?? 12); };
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const now = performance.now();
    if (now - trailAt < 55 || pts.length > 40) return;
    trailAt = now;
    pts.push({ x: e.clientX + rnd(-4, 4), y: e.clientY + rnd(-4, 4), vx: rnd(-14, 14), vy: rnd(6, 26), life: 0.7, max: 0.7, s: rnd(6, 11) });
  };
  const onVis = () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf && !reduced) { last = 0; raf = requestAnimationFrame(frame); }
  };

  resize();
  window.addEventListener("resize", resize);
  if (reduced) {
    draw(); // one still frame, no movement
    return () => window.removeEventListener("resize", resize);
  }
  if (o.bursts !== false) window.addEventListener("xmas-burst", onBurst);
  if (o.trail !== false && window.matchMedia("(hover: hover) and (pointer: fine)").matches) window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    window.removeEventListener("xmas-burst", onBurst);
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("visibilitychange", onVis);
  };
}
