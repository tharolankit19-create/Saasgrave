import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { isPlacement, runEndsAt } from "@/lib/ad-pricing";
import { normalizeUrl } from "@/lib/utils";

/**
 * Admin: put any startup into any ad slot, or clear one.
 *
 * Used to fill unsold inventory with real listings rather than leaving empty
 * "your product here" boxes, and to place a slot for someone who paid outside
 * the normal checkout. The creative is copied from the startup, so a placement
 * always points at a real page.
 */
export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  let body: { slotId?: string; startupId?: string; clear?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.slotId) return NextResponse.json({ error: "Missing slotId" }, { status: 400 });

  const admin = createAdminClient();

  if (body.clear) {
    const { error } = await admin
      .from("ad_slots")
      .update({
        active: false,
        buyer_id: null,
        name: null,
        headline: null,
        body: null,
        cta_label: null,
        cta_url: null,
        image_url: null,
        starts_at: null,
        ends_at: null,
      })
      .eq("id", body.slotId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, cleared: true });
  }

  if (!body.startupId) return NextResponse.json({ error: "Missing startupId" }, { status: 400 });

  const [{ data: slot }, { data: startup }] = await Promise.all([
    admin.from("ad_slots").select("id, placement").eq("id", body.slotId).single(),
    admin
      .from("startups")
      .select("id, name, slug, tagline, logo_url, website_url")
      .eq("id", body.startupId)
      .single(),
  ]);
  if (!slot) return NextResponse.json({ error: "No such slot" }, { status: 404 });
  if (!startup) return NextResponse.json({ error: "No such startup" }, { status: 404 });

  const placement = isPlacement(slot.placement) ? slot.placement : "sidebar";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";
  const now = new Date();

  const { error } = await admin
    .from("ad_slots")
    .update({
      active: true,
      // House placement: no buyer, so it never looks like a paid slot on
      // someone's dashboard and stays free to sell later.
      buyer_id: null,
      name: startup.name,
      headline: startup.tagline || startup.name,
      body: null,
      cta_label: "Visit",
      // Prefer their own site (that's the value); fall back to the listing.
      cta_url: normalizeUrl(startup.website_url) || `${site}/startup/${startup.slug}`,
      image_url: startup.logo_url,
      starts_at: now.toISOString(),
      ends_at: runEndsAt(placement, now)?.toISOString() ?? null,
    })
    .eq("id", body.slotId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
