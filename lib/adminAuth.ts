import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "fx_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function secret() {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createToken() {
  const exp = String(Date.now() + MAX_AGE_SECONDS * 1000);
  return `${exp}.${sign(exp)}`;
}

export function verifyToken(token?: string) {
  if (!token || !secret()) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  const expected = sign(exp);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return Number(exp) > Date.now();
}

export function isAdmin() {
  return verifyToken(cookies().get(ADMIN_COOKIE)?.value);
}

export function passwordMatches(input: string) {
  const real = process.env.ADMIN_PASSWORD || "";
  if (!real) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(real);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
