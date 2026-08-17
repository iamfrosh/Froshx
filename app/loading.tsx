export default function Loading() {
  return (
    <div className="wrap py-24">
      <div className="max-w-2xl space-y-4 animate-pulse">
        <div className="h-4 w-32 bg-line rounded-full" />
        <div className="h-10 w-full bg-line rounded-xl" />
        <div className="h-10 w-3/4 bg-line rounded-xl" />
        <div className="h-4 w-full bg-line rounded-full mt-6" />
        <div className="h-4 w-5/6 bg-line rounded-full" />
      </div>
    </div>
  );
}
