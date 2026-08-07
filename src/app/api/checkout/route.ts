import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createDodoCheckout, type CheckoutKind } from "@/lib/dodo";
import { adTier, adProductId } from "@/lib/ad-pricing";

// Creates a Dodo hosted-checkout session. The only paid action is an ad slot,
// priced dynamically ($19 → $29 → $49 as slots sell). Listing (incl. for-sale)
// is free — we take 3% only when a startup actually sells.
// A pending payment row is recorded; the webhook flips it to "paid".
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { kind?: CheckoutKind; referenceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { kind, referenceId } = body;
  if (!kind || !referenceId) {
    return NextResponse.json({ error: "Missing kind or referenceId" }, { status: 400 });
  }

  // Ad slots use dynamic, rising pricing ($19 → $29 → $49 as slots sell).
  let amountCents = 900;
  let productId: string | undefined;
  if (kind === "ad_slot") {
    let sold = 0;
    try {
      const { count } = await supabase
        .from("ad_slots")
        .select("id", { count: "exact", head: true })
        .not("buyer_id", "is", null);
      sold = count ?? 0;
    } catch {
      /* default to the first tier */
    }
    const tier = adTier(sold);
    amountCents = tier.cents;
    productId = adProductId(tier.dollars);
  } else {
    amountCents = 900; // sale_listing (legacy path)
  }

  // Best-effort internal payment record. This must NEVER block checkout: the
  // Dodo webhook is the source of truth for "paid" and reconciles later. If the
  // service-role insert fails (e.g. SUPABASE_SERVICE_ROLE_KEY missing), we log
  // and still send the buyer to Dodo so they can actually pay.
  let paymentId: string | null = null;
  try {
    const admin = createAdminClient();
    const { data: payment, error } = await admin
      .from("payments")
      .insert({ user_id: user.id, kind, reference_id: referenceId, amount_cents: amountCents, status: "pending" })
      .select("id")
      .single();
    if (error) console.error("checkout: payment record insert failed (continuing):", error.message);
    paymentId = payment?.id ?? null;
  } catch (e: any) {
    console.error("checkout: payment record insert threw (continuing):", e?.message || e);
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const successUrl = `${site}/checkout/success${paymentId ? `?p=${paymentId}` : ""}`;
  try {
    const url = await createDodoCheckout({
      kind,
      referenceId,
      userId: user.id,
      email: user.email ?? undefined,
      successUrl,
      productId,
    });
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
