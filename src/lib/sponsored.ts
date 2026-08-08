import { createClient } from "@/lib/supabase/server";

export type Sponsored = {
  name: string;
  tagline: string;
  href: string;
  logo: string | null;
};

// KryxAI holds the sponsored row until someone buys it, so the placement is
// never an empty box — and buyers can see exactly what they're paying for.
const HOUSE: Sponsored = {
  name: "KryxAI",
  tagline: "Grow on LinkedIn & X in your own voice",
  href: "https://x.getkryxai.com",
  logo: "/kryx.jpg",
};

/**
 * The live $29 sponsored row shown inside the listing tables. Falls back to the
 * house ad when no one has bought the placement.
 */
export async function loadSponsored(): Promise<Sponsored> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("ad_slots")
      .select("name, headline, body, cta_url, image_url, active, ends_at")
      .eq("placement", "sponsored")
      .eq("active", true)
      .order("position")
      .limit(4);

    const now = Date.now();
    const live = (data || []).find(
      (s) => s.cta_url && (s.name || s.headline) && (!s.ends_at || new Date(s.ends_at).getTime() > now)
    );
    if (!live) return HOUSE;

    return {
      name: live.name || live.headline || "Sponsored",
      tagline: live.body || live.headline || "",
      href: live.cta_url as string,
      logo: live.image_url || null,
    };
  } catch {
    return HOUSE;
  }
}
