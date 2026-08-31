// ─── Firecrawl scrape helper ────────────────────────────────
// Server-only. Fetches a founder's live site and returns its text plus the
// metadata we can map straight onto a listing (title, description, logo).
//
// Set FIRECRAWL_API_KEY. https://firecrawl.dev

const ENDPOINT = "https://api.firecrawl.dev/v1/scrape";

export type ScrapedSite = {
  url: string;
  markdown: string;
  title?: string;
  description?: string;
  image?: string;
};

/** Accepts "acme.com" as readily as a full URL, and rejects anything unusable. */
export function normalizeSiteUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withProto);
    if (!u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function scrapeSite(url: string): Promise<ScrapedSite> {
  const key = process.env.FIRECRAWL_API_KEY?.trim();
  if (!key) {
    throw new Error("Autofill isn't set up yet — FIRECRAWL_API_KEY is missing.");
  }

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    });
  } catch {
    throw new Error("Couldn't reach the page. Check the link and try again.");
  }

  if (res.status === 401 || res.status === 403) {
    throw new Error("Firecrawl rejected the API key — check FIRECRAWL_API_KEY.");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`Firecrawl scrape failed (${res.status}): ${text}`);
    throw new Error("That page couldn't be read. Try another URL, or fill it in by hand.");
  }

  const body: any = await res.json().catch(() => null);
  const data = body?.data ?? body;
  const meta = data?.metadata ?? {};
  const markdown: string = data?.markdown || data?.content || "";

  if (!markdown.trim()) {
    throw new Error("Nothing readable on that page — fill it in by hand.");
  }

  return {
    url,
    // Long pages blow past the model's budget and add nothing; the top of a
    // landing page is where the pitch lives anyway.
    markdown: markdown.slice(0, 6000),
    title: meta.title || meta.ogTitle || undefined,
    description: meta.description || meta.ogDescription || undefined,
    image: meta.ogImage || meta.image || undefined,
  };
}
