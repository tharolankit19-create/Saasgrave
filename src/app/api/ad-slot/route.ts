import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Lets a buyer edit the creative of an ad slot they own. Writes to ad_slots go
// through the service role (public RLS is read-only), so we verify ownership
// here before touching anything.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: {
    slotId?: string;
    headline?: string;
    body?: string;
    cta_label?: string;
    cta_url?: string;
    image_url?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.slotId) return NextResponse.json({ error: "Missing slotId" }, { status: 400 });

  const admin = createAdminClient();

  // Ownership check — only the buyer of this slot may edit it.
  const { data: slot } = await admin
    .from("ad_slots")
    .select("id, buyer_id")
    .eq("id", body.slotId)
    .single();

  if (!slot || slot.buyer_id !== user.id) {
    return NextResponse.json({ error: "Not your slot" }, { status: 403 });
  }

  const clip = (v: string | undefined, n: number) => (v ?? "").toString().slice(0, n).trim() || null;

  const { error } = await admin
    .from("ad_slots")
    .update({
      headline: clip(body.headline, 60),
      body: clip(body.body, 140),
      cta_label: clip(body.cta_label, 24),
      cta_url: clip(body.cta_url, 300),
      image_url: clip(body.image_url, 500),
    })
    .eq("id", body.slotId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
