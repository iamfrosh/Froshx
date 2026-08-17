import Link from "next/link";

export default function NotFound() {
  return (
    <section className="min-h-[70vh] flex items-center">
      <div className="wrap py-24 text-center">
        <p className="font-display text-flare-500 text-sm font-semibold tracking-wider uppercase">
          404
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-semibold mt-4 text-balance">
          This page took a wrong turn.
        </h1>
        <p className="mt-4 text-muted max-w-md mx-auto">
          The page you’re looking for doesn’t exist or may have moved. Let’s
          get you back on track.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center rounded-full bg-ink text-white font-semibold text-base px-7 py-4 hover:bg-flare-600 transition-colors"
          >
            Back to home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center text-base font-semibold text-ink hover:text-flare-600 transition-colors px-2 py-4"
          >
            Contact us
          </Link>
        </div>
      </div>
    </section>
  );
}
