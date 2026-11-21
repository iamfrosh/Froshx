// Christmas edition settings.
// To switch it off early: set NEXT_PUBLIC_CHRISTMAS=off in Vercel and redeploy.
// To extend or shorten the season: change the date below (the theme turns itself off after it).
export const CHRISTMAS_UNTIL = "2027-01-07";

export function christmasActive(): boolean {
  if (process.env.NEXT_PUBLIC_CHRISTMAS === "off") return false;
  return Date.now() < new Date(`${CHRISTMAS_UNTIL}T00:00:00`).getTime();
}

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// small burst of gold sparkles at a screen position (the snow canvas draws it)
export const sparkleBurst = (x: number, y: number, n = 12) =>
  window.dispatchEvent(new CustomEvent("xmas-burst", { detail: { x, y, n } }));
