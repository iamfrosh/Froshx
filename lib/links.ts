// Safe to import from browser code (no database access here).
export const screenshotUrl = (url: string) =>
  url ? `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=750` : "";
