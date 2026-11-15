"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SITE } from "@/lib/site";
import { WhatsAppIcon } from "../Icons";
import { ShieldIcon } from "../academy/AcademyIcons";
import "../academy/academy.css";

export default function StudentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/student/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) { setError(json.error || "Could not log in."); return; }
      router.push("/dashboard");
    } catch {
      setError("We couldn’t reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-cloud">
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-flare-gradient opacity-25 blur-[90px]" />
      <div className="wrap relative flex min-h-[78vh] items-center justify-center py-12">
        <div className="w-full max-w-md">
          <div className="rounded-[28px] border border-line bg-white p-6 shadow-soft sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink text-flare-300"><ShieldIcon className="h-6 w-6" /></span>
            <h1 className="font-display mt-5 text-3xl font-semibold">Student login</h1>
            <p className="mt-1.5 text-sm text-muted">See your registration, start date and messages from the FroshX team.</p>

            <form onSubmit={submit} noValidate className="mt-7 space-y-5">
              <div>
                <label htmlFor="se" className="mb-2 block text-sm font-medium">Email address</label>
                <input id="se" type="email" inputMode="email" autoComplete="email" className="ax-input" placeholder="The email you registered with" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <label htmlFor="sp" className="mb-2 block text-sm font-medium">Password</label>
                <div className="relative">
                  <input id="sp" type={show ? "text" : "password"} autoComplete="current-password" className="ax-input pr-16" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-muted hover:text-ink">{show ? "Hide" : "Show"}</button>
                </div>
                <p className="mt-1.5 text-xs text-muted">First time? Use the starting password from your registration page and email.</p>
              </div>
              {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              <button disabled={loading || !email || !password} className="ax-shimmer-btn w-full rounded-full bg-ink py-4 font-semibold text-white transition hover:bg-flare-600 disabled:opacity-50">
                {loading ? "Signing in…" : "Log in"}
              </button>
            </form>

            <div className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
              <a href={`${SITE.whatsapp}?text=${encodeURIComponent("Hello FroshX Academy, I need help logging in to my student dashboard.")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-semibold text-ink hover:underline">
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Forgot your password? Message us
              </a>
              <p className="text-muted">Not registered yet? <Link href="/register" className="font-semibold text-ink underline">Register for a course</Link></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
