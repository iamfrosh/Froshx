import ChristmasTree from "@/components/christmas/ChristmasTree";
import "@/components/christmas/christmas.css";

// Shown briefly while a page loads: a lighting Christmas tree in the festive season, a simple skeleton otherwise.
export default function Loading() {
  return (
    <>
      <div className="xmas-only wrap py-24 text-center">
        <ChristmasTree className="mx-auto h-28 w-auto" />
        <p className="mt-4 text-sm text-muted">Loading…</p>
      </div>
      <div className="xmas-hide wrap py-24">
        <div className="max-w-2xl space-y-4 animate-pulse">
          <div className="h-4 w-32 bg-line rounded-full" />
          <div className="h-10 w-full bg-line rounded-xl" />
          <div className="h-10 w-3/4 bg-line rounded-xl" />
          <div className="h-4 w-full bg-line rounded-full mt-6" />
          <div className="h-4 w-5/6 bg-line rounded-full" />
        </div>
      </div>
    </>
  );
}
