"use client";

import { useState, FormEvent } from "react";
import { SITE } from "@/lib/site";
import { CheckIcon } from "./Icons";

type Status = "idle" | "sent" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const projectType = String(data.get("projectType") || "");
    const message = String(data.get("message") || "").trim();

    if (!name || !email || !message) {
      setStatus("error");
      setLoading(false);
      return;
    }

    // No backend is wired up yet — this hands the enquiry to email as a
    // reliable default. Swap this block for a POST to /api/contact once
    // an email provider (e.g. Resend) is connected.
    const subject = encodeURIComponent(`New project enquiry — ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nProject type: ${projectType || "Not specified"}\n\n${message}`
    );
    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;

    setStatus("sent");
    setLoading(false);
    form.reset();
  }

  if (status === "sent") {
    return (
      <div className="rounded-2xl border border-flare-100 bg-flare-50 p-8 text-center">
        <span className="w-11 h-11 rounded-full bg-flare-500 flex items-center justify-center mx-auto">
          <CheckIcon className="w-5 h-5 text-white" />
        </span>
        <p className="font-display text-lg font-semibold mt-4">
          Your email app should now be open
        </p>
        <p className="text-sm text-muted mt-2 max-w-sm mx-auto leading-relaxed">
          If it didn't open automatically, email us directly at{" "}
          <a href={`mailto:${SITE.email}`} className="text-ink underline underline-offset-2">
            {SITE.email}
          </a>
          .
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="text-sm font-semibold text-flare-600 mt-5 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink mb-2">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] focus:border-flare-500 outline-none transition-colors"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink mb-2">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] focus:border-flare-500 outline-none transition-colors"
            placeholder="you@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="projectType" className="block text-sm font-medium text-ink mb-2">
          Project type
        </label>
        <select
          id="projectType"
          name="projectType"
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] focus:border-flare-500 outline-none transition-colors"
          defaultValue=""
        >
          <option value="" disabled>
            Select an option
          </option>
          <option>Website design & development</option>
          <option>Software or platform build</option>
          <option>UI/UX design</option>
          <option>Branding & graphics</option>
          <option>Social media management</option>
          <option>Something else</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink mb-2">
          Tell us about your project
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] focus:border-flare-500 outline-none transition-colors resize-none"
          placeholder="What are you building, and what timeline are you working with?"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-flare-700 bg-flare-50 border border-flare-100 rounded-xl px-4 py-3">
          Please fill in your name, email and a short message before sending.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-ink text-white font-semibold text-base px-8 py-4 hover:bg-flare-600 transition-colors disabled:opacity-60"
      >
        {loading ? "Sending…" : "Send message"}
      </button>
      <p className="text-xs text-muted">
        By sending this form you agree to be contacted about your enquiry. We
        never share your details — see our{" "}
        <a href="/privacy" className="underline underline-offset-2">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
