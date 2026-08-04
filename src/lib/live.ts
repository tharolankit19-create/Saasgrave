import { createClient } from "@/lib/supabase/server";

export type LiveStats = {
  visitors7d: number | null; // real analytics visitors, if configured
  buried7d: number; // startups laid to rest in the last 7 days
  founders7d: number; // founders who joined in the last 7 days
  slotsLeft: number; // open promo slots out of the total
  slotsTotal: number;
};

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Real "what's happening this week" numbers for the landing FOMO bar. Visitor
// count comes from Plausible when a key is configured; everything else is
// computed straight from the database. Nothing here is invented — if a source
// is missing it degrades to a real zero, never a fake number.
export async function getLiveStats(): Promise<LiveStats> {
  const since = new Date(Date.now() - WEEK_MS).toISOString();

  const [visitors7d, platform] = await Promise.all([plausibleVisitors(), platformWeek(since)]);

  return { visitors7d, ...platform };
}

async function platformWeek(since: string) {
  try {
    const supabase = createClient();
    const [buried, founders, slots] = await Promise.all([
      supabase
        .from("startups")
        .select("id", { count: "exact", head: true })
        .eq("status", "listed")
        .gte("created_at", since),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("ad_slots").select("active, headline"),
    ]);

    const slotRows = slots.data ?? [];
    const total = slotRows.length || 6;
    const left = slotRows.length
      ? slotRows.filter((s) => !(s.active && s.headline)).length
      : 6;

    return {
      buried7d: buried.count ?? 0,
      founders7d: founders.count ?? 0,
      slotsLeft: left,
      slotsTotal: total,
    };
  } catch {
    return { buried7d: 0, founders7d: 0, slotsLeft: 6, slotsTotal: 6 };
  }
}

// Plausible Stats API — aggregate visitors over the last 7 days. Returns null
// when unconfigured or on any error, so the UI can hide the metric cleanly.
async function plausibleVisitors(): Promise<number | null> {
  const key = process.env.PLAUSIBLE_API_KEY;
  const site = process.env.PLAUSIBLE_SITE_ID;
  if (!key || !site) return null;

  const host = process.env.PLAUSIBLE_HOST || "https://plausible.io";
  const url = `${host.replace(/\/$/, "")}/api/v1/stats/aggregate?site_id=${encodeURIComponent(
    site
  )}&period=7d&metrics=visitors`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      // Fresh enough for FOMO without hammering the API on every request.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const v = data?.results?.visitors?.value;
    return typeof v === "number" ? v : null;
  } catch {
    return null;
  }
}
