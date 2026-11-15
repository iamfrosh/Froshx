// Reads the title, description and preview image that a website publishes for link previews (Open Graph tags).
export type LinkPreview = { title: string; description: string; image: string; url: string };

function blocked(host: string) {
  const h = host.toLowerCase();
  return (
    h === "localhost" || h.endsWith(".local") || h.endsWith(".internal") ||
    /^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) ||
    h === "::1" || h.startsWith("[")
  );
}

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;/g, "'").trim();

export async function fetchLinkPreview(raw: string): Promise<LinkPreview> {
  let u: URL;
  try { u = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`); } catch { throw new Error("That doesn’t look like a valid link."); }
  if (!/^https?:$/.test(u.protocol) || blocked(u.hostname)) throw new Error("That link can’t be previewed.");

  const res = await fetch(u.toString(), {
    redirect: "follow",
    headers: { "user-agent": "Mozilla/5.0 (compatible; FroshXLinkPreview/1.0)", accept: "text/html" },
    signal: AbortSignal.timeout(7000),
  });
  if (!res.ok) throw new Error(`The site answered with status ${res.status}.`);
  const html = (await res.text()).slice(0, 600000);
  const finalUrl = res.url || u.toString();

  const meta: Record<string, string> = {};
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([a-zA-Z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? "";
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (key && attrs.content && !meta[key]) meta[key] = decode(attrs.content);
  }
  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";

  let image = meta["og:image"] || meta["og:image:url"] || meta["twitter:image"] || meta["twitter:image:src"] || "";
  if (image) { try { image = new URL(image, finalUrl).toString(); } catch { image = ""; } }

  return {
    title: (meta["og:title"] || meta["twitter:title"] || decode(titleTag)).slice(0, 120),
    description: (meta["og:description"] || meta["description"] || meta["twitter:description"] || "").slice(0, 300),
    image,
    url: finalUrl,
  };
}
