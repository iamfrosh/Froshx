import nodemailer from "nodemailer";
import { SITE } from "./site";

let transporter: nodemailer.Transporter | null = null;

function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  }
  return transporter;
}

export const mailReady = () => Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
export const brandEmail = () => process.env.GMAIL_USER || SITE.email;

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  const t = getTransport();
  if (!t) throw new Error("Email is not set up yet (GMAIL_USER / GMAIL_APP_PASSWORD missing).");
  await t.sendMail({
    from: `"FroshX Academy" <${brandEmail()}>`,
    replyTo: brandEmail(),
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}

export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("Email timed out")), ms))]);
}
