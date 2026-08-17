"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook up an error-reporting service (e.g. Sentry) here.
    console.error(error);
  }, [error]);

  return (
    <section className="min-h-[70vh] flex items-center">
      <div className="wrap py-24 text-center">
        <p className="font-display text-flare-500 text-sm font-semibold tracking-wider uppercase">
          Something went wrong
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold mt-4 text-balance">
          We hit a snag loading this page.
        </h1>
        <p className="mt-4 text-muted max-w-md mx-auto">
          It’s on us — try again, or head back to the homepage.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center rounded-full bg-ink text-white font-semibold text-base px-7 py-4 hover:bg-flare-600 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center text-base font-semibold text-ink hover:text-flare-600 transition-colors px-2 py-4"
          >
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
