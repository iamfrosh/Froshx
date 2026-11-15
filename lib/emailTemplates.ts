// Pure functions (no server code), so the admin page can also use them for a live preview.
import { SITE } from "./site";
import { ACADEMY, naira } from "./academy";

const C = { ink: "#15130F", orange: "#F97316", orangeDark: "#EA5B0C", soft: "#FFF6EC", softLine: "#FFE8CE", line: "#E7E2DA", muted: "#6B6459", bg: "#F4F1EC", cloud: "#FAF8F5" };
const FONT = "'Segoe UI',Helvetica,Arial,sans-serif";
const LOGO = `${SITE.url}/images/froshx-logo-email.png`;

export const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export const firstName = (full: string) => (full || "").trim().split(/\s+/)[0] || "there";

function button(label: string, url: string, bg: string = C.orange) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td align="center" bgcolor="${bg}" style="border-radius:999px;"><a href="${esc(url)}" target="_blank" style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(label)}</a></td></tr></table>`;
}

function shell(opts: { preheader: string; inner: string; title: string }) {
  const { preheader, inner, title } = opts;
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">${esc(preheader)}${"&zwnj;&nbsp;".repeat(40)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.bg};"><tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
  <tr><td style="background:#ffffff;border-radius:20px 20px 0 0;padding:26px 32px 22px;border-bottom:4px solid ${C.orange};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="left"><img src="${LOGO}" width="150" alt="FroshX" style="display:block;height:auto;border:0;"></td>
      <td align="right" style="font-family:${FONT};font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.orangeDark};">${esc(ACADEMY.name)}</td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#ffffff;padding:34px 32px 36px;font-family:${FONT};color:${C.ink};">${inner}</td></tr>
  <tr><td style="background:${C.ink};border-radius:0 0 20px 20px;padding:28px 32px;font-family:${FONT};text-align:center;">
    <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;">${esc(SITE.fullName)}</p>
    <p style="margin:4px 0 16px;font-size:12px;color:#B8B0A2;">${esc(SITE.tagline)}</p>
    <p style="margin:0 0 6px;font-size:13px;color:#D9D2C5;"><a href="mailto:${SITE.email}" style="color:#FDB463;text-decoration:none;">${SITE.email}</a> &nbsp;·&nbsp; ${esc(SITE.phoneDisplay)}</p>
    <p style="margin:0 0 16px;font-size:13px;color:#D9D2C5;"><a href="${SITE.instagram}" style="color:#FDB463;text-decoration:none;">Instagram</a> &nbsp;·&nbsp; <a href="${SITE.facebook}" style="color:#FDB463;text-decoration:none;">Facebook</a> &nbsp;·&nbsp; <a href="${SITE.url}" style="color:#FDB463;text-decoration:none;">${SITE.url.replace("https://", "")}</a></p>
    <p style="margin:0;font-size:11px;line-height:1.6;color:#8A8274;">You are receiving this email because you registered for, or enquired about, a ${esc(ACADEMY.name)} course.</p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

const row = (k: string, v: string) =>
  `<tr><td style="padding:10px 0;border-bottom:1px solid ${C.line};font-size:13px;color:${C.muted};width:38%;vertical-align:top;">${esc(k)}</td><td style="padding:10px 0;border-bottom:1px solid ${C.line};font-size:14px;font-weight:600;color:${C.ink};text-align:right;vertical-align:top;">${v}</td></tr>`;

const step = (n: number, t: string, d: string) =>
  `<tr><td width="44" valign="top" style="padding:0 0 16px;"><table role="presentation" cellpadding="0" cellspacing="0"><tr><td width="32" height="32" align="center" bgcolor="${C.orange}" style="border-radius:16px;font-family:${FONT};font-size:14px;font-weight:700;color:#ffffff;">${n}</td></tr></table></td><td valign="top" style="padding:0 0 16px;font-family:${FONT};"><p style="margin:0;font-size:15px;font-weight:700;color:${C.ink};">${esc(t)}</p><p style="margin:3px 0 0;font-size:14px;line-height:1.55;color:${C.muted};">${esc(d)}</p></td></tr>`;

export type DashboardEmailInfo = { url: string; email: string; password: string | null };

export type RegEmailData = {
  fullName: string; ref: string; courseTitle: string; mode: string; fee: number; start: string;
  dashboard?: DashboardEmailInfo;
};

function dashboardBox(d: DashboardEmailInfo) {
  const creds = d.password
    ? `<tr><td style="padding:6px 0;font-size:13px;color:${C.muted};width:36%;">Email</td><td style="padding:6px 0;font-size:14px;font-weight:700;color:${C.ink};">${esc(d.email)}</td></tr>
       <tr><td style="padding:6px 0;font-size:13px;color:${C.muted};">Password</td><td style="padding:6px 0;font-size:16px;font-weight:700;letter-spacing:1px;color:${C.ink};">${esc(d.password)}</td></tr>`
    : `<tr><td colspan="2" style="padding:6px 0;font-size:14px;color:#3a352c;">Log in with <b>${esc(d.email)}</b> and the password you chose earlier.</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 26px;border:1px solid ${C.softLine};border-radius:16px;background:${C.soft};"><tr><td style="padding:20px 22px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.orangeDark};">Your student dashboard</p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3a352c;">Log in any time to see your registration status, start date and messages from the FroshX team.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${creds}</table>
    ${d.password ? `<p style="margin:10px 0 0;font-size:13px;line-height:1.55;color:${C.muted};">This is a starting password. <b>Please change it after you log in.</b></p>` : ""}
    <div style="margin-top:16px;">${button("Open my dashboard", d.url, C.ink)}</div>
  </td></tr></table>`;
}

export function registrationEmail(r: RegEmailData) {
  const name = firstName(r.fullName);
  const modeLabel = r.mode === "physical" ? "Physical (Gombe)" : "Online";
  const wa = `${SITE.whatsapp}?text=${encodeURIComponent(`Hello FroshX Academy, my registration reference is ${r.ref} (${r.courseTitle}).`)}`;
  const inner = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td bgcolor="${C.soft}" style="border:1px solid ${C.softLine};border-radius:999px;padding:6px 14px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.orangeDark};">✓ &nbsp;Registration received</td></tr></table>
    <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;font-weight:700;color:${C.ink};">You’re in, ${esc(name)}! 🎉</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:#3a352c;">Thank you for registering for <b>${esc(r.courseTitle)}</b> at ${esc(ACADEMY.name)}. This is a <b>${ACADEMY.weeks}-week beginner course with a certificate</b> at the end.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cloud};border:1px solid ${C.line};border-radius:16px;margin:0 0 26px;"><tr><td style="padding:22px 22px 14px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.orangeDark};">Your reference</p>
      <p style="margin:0 0 14px;font-size:30px;font-weight:700;letter-spacing:3px;color:${C.ink};">${esc(r.ref)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${row("Course", esc(r.courseTitle))}
        ${row("Training", modeLabel)}
        ${row("Duration", `${ACADEMY.weeks} weeks · ${ACADEMY.level}`)}
        ${row("Certificate", "Included")}
        ${row("Course fee", esc(naira(r.fee)))}
        ${row("Preferred start", esc(r.start))}
      </table>
    </td></tr></table>

    ${r.dashboard ? dashboardBox(r.dashboard) : ""}
    <h2 style="margin:0 0 16px;font-size:18px;font-weight:700;color:${C.ink};">What happens next</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${step(1, "The FroshX team will reach out to you", "We will contact you on the phone or WhatsApp number you gave us about payment and any other necessary documentation.")}
      ${step(2, "We agree your start date", "Start dates can differ from person to person, so we will fix the date that suits you.")}
      ${step(3, "Learn for 6 weeks and get certified", "Hands-on, beginner-friendly training, then your FroshX Academy certificate.")}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 28px;"><tr><td bgcolor="${C.soft}" style="border-left:4px solid ${C.orange};border-radius:8px;padding:14px 16px;font-size:14px;line-height:1.6;color:#3a352c;"><b>Please keep this email.</b> Quote your reference <b>${esc(r.ref)}</b> whenever you contact us. Can’t find our next message? Check your spam or promotions folder.</td></tr></table>

    ${button("Chat with us on WhatsApp", wa, "#25D366")}
    <p style="margin:22px 0 0;text-align:center;font-size:13px;color:${C.muted};">Questions? Reply to this email or message us any time.</p>
  `;
  const text = [
    `You’re in, ${name}!`,
    ``,
    `Thank you for registering for ${r.courseTitle} at ${ACADEMY.name}. It is a ${ACADEMY.weeks}-week beginner course with a certificate.`,
    ``,
    `Reference: ${r.ref}`,
    `Course: ${r.courseTitle}`,
    `Training: ${modeLabel}`,
    `Fee: ${naira(r.fee)}`,
    `Preferred start: ${r.start}`,
    ``,
    `What happens next:`,
    `1. The FroshX team will reach out to you about payment and other necessary documentation.`,
    `2. We agree your start date.`,
    `3. You learn for 6 weeks and get certified.`,
    ``,
    ...(r.dashboard ? [``, `Student dashboard: ${r.dashboard.url}`, `Email: ${r.dashboard.email}`, r.dashboard.password ? `Password: ${r.dashboard.password} (please change it after you log in)` : `Use the password you chose earlier.`] : []),
    ``,
    `WhatsApp: ${wa}`,
    `${SITE.fullName} · ${SITE.email}`,
  ].join("\n");
  return { subject: `Registration received: ${r.courseTitle} (${r.ref})`, html: shell({ title: "Registration received", preheader: `Your reference is ${r.ref}. The FroshX team will reach out to you shortly.`, inner }), text };
}

// Admin messages. Plain text in, safe HTML out. {{name}} {{fullName}} {{course}} {{ref}} are replaced per person.
export type Vars = { name: string; fullName: string; course: string; ref: string };

export function fill(template: string, v: Vars) {
  return template
    .replace(/\{\{\s*name\s*\}\}/gi, v.name)
    .replace(/\{\{\s*fullName\s*\}\}/gi, v.fullName)
    .replace(/\{\{\s*course\s*\}\}/gi, v.course)
    .replace(/\{\{\s*ref\s*\}\}/gi, v.ref);
}

export function messageEmail(opts: { subject: string; message: string; vars: Vars; ctaLabel?: string; ctaUrl?: string }) {
  const { subject, vars } = opts;
  const body = fill(opts.message, vars).trim();
  const paras = body.split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#3a352c;">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");
  const okUrl = opts.ctaUrl && /^https?:\/\//i.test(opts.ctaUrl);
  const cta = opts.ctaLabel && okUrl ? `<div style="margin:26px 0 6px;">${button(opts.ctaLabel, opts.ctaUrl!)}</div>` : "";
  const inner = `
    <h1 style="margin:0 0 20px;font-size:26px;line-height:1.25;font-weight:700;color:${C.ink};">${esc(fill(subject, vars))}</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#3a352c;">Hello ${esc(vars.name)},</p>
    ${paras}
    ${cta}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:26px;border-top:1px solid ${C.line};"><tr><td style="padding-top:18px;font-size:14px;line-height:1.6;color:${C.muted};">Warm regards,<br><b style="color:${C.ink};">The ${esc(ACADEMY.name)} team</b><br>${esc(SITE.fullName)}</td></tr></table>
  `;
  const subjectFilled = fill(subject, vars);
  const text = `Hello ${vars.name},\n\n${body}\n\n${opts.ctaLabel && okUrl ? `${opts.ctaLabel}: ${opts.ctaUrl}\n\n` : ""}Warm regards,\nThe ${ACADEMY.name} team\n${SITE.fullName}`;
  return { subject: subjectFilled, html: shell({ title: subjectFilled, preheader: body.slice(0, 110).replace(/\s+/g, " "), inner }), text };
}

export function newRegistrationAlert(r: RegEmailData & { email: string; phone: string; location: string }) {
  const inner = `
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;color:${C.ink};">New registration</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row("Name", esc(r.fullName))}${row("Email", esc(r.email))}${row("Phone", esc(r.phone))}${row("Location", esc(r.location))}
      ${row("Course", esc(r.courseTitle))}${row("Training", esc(r.mode))}${row("Fee", esc(naira(r.fee)))}${row("Preferred start", esc(r.start))}${row("Reference", esc(r.ref))}
    </table>
    <div style="margin-top:24px;">${button("Open admin dashboard", `${SITE.url}/admin`)}</div>`;
  return { subject: `New registration: ${r.fullName} (${r.courseTitle})`, html: shell({ title: "New registration", preheader: `${r.fullName} registered for ${r.courseTitle}`, inner }), text: `New registration\n${r.fullName}\n${r.email}\n${r.phone}\n${r.courseTitle} (${r.mode}) ${naira(r.fee)}\nRef ${r.ref}` };
}

export function dashboardInviteEmail(opts: { fullName: string; info: DashboardEmailInfo }) {
  const name = firstName(opts.fullName);
  const { info } = opts;
  const inner = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr><td bgcolor="${C.soft}" style="border:1px solid ${C.softLine};border-radius:999px;padding:6px 14px;font-family:${FONT};font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${C.orangeDark};">New · Student dashboard</td></tr></table>
    <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;font-weight:700;color:${C.ink};">Hello ${esc(name)}, your dashboard is ready</h1>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#3a352c;">You can now log in to your ${esc(ACADEMY.name)} student dashboard to see your registration status, your start date and any message from the FroshX team.</p>
    ${dashboardBox(info)}
    <h2 style="margin:0 0 14px;font-size:17px;font-weight:700;color:${C.ink};">How to log in</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${step(1, "Open the dashboard", "Tap the button above or go to " + info.url.replace("https://", "") + ".")}
      ${step(2, "Enter your email and password", info.password ? "Use the email and starting password shown above." : "Use your email and the password you set.")}
      ${step(3, info.password ? "Choose your own password" : "Check your registration", info.password ? "You will be asked to set a new password the first time you log in." : "See your status, start date and notes from our team.")}
    </table>
    <p style="margin:6px 0 0;text-align:center;font-size:13px;color:${C.muted};">Need help? Reply to this email or message us on WhatsApp.</p>`;
  const text = `Hello ${name}, your ${ACADEMY.name} student dashboard is ready.\n\nLog in: ${info.url}\nEmail: ${info.email}\n${info.password ? `Password: ${info.password} (please change it after you log in)` : "Use the password you chose earlier."}\n\n${SITE.fullName}`;
  return { subject: "Your FroshX Academy student dashboard is ready", html: shell({ title: "Your student dashboard", preheader: "Log in to see your registration status and start date.", inner }), text };
}
