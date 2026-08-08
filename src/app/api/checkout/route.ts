import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createDodoCheckout, type CheckoutKind } from "@/lib/dodo";
import { isPlacement, productCents, productDodoId, type Placement } from "@/lib/ad-pricing";

// Creates a Dodo hosted-checkout session for a promotion:
//   ad_slot  → sidebar $19 / sponsored $29 / newsletter $49 (price comes from
//              the slot's own placement, never from the client)
//   featured → Featured Launch $9, pins a startup to the top of Browse
// Listing and selling are free — we take 3% only when a startup actually sells.
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

  // Price is always derived server-side from the thing being bought.
  let amountCents: number;
  let productId: string | undefined;

  if (kind === "ad_slot") {
    const { data: slot } = await supabase
      .from("ad_slots")
      .select("id, placement, buyer_id")
      .eq("id", referenceId)
      .single();
    if (!slot) return NextResponse.json({ error: "That slot doesn't exist." }, { status: 404 });
    if (slot.buyer_id && slot.buyer_id !== user.id) {
      return NextResponse.json({ error: "That slot has just been taken." }, { status: 409 });
    }
    const placement: Placement = isPlacement(slot.placement) ? slot.placement : "sidebar";
    amountCents = productCents(placement);
    productId = productDodoId(placement);
  } else if (kind === "featured" || kind === "directory" || kind === "bundle") {
    // referenceId is a startup — only its owner may buy promotion for it.
    const { data: startup } = await supabase
      .from("startups")
      .select("id, founder_id")
      .eq("id", referenceId)
      .single();
    if (!startup) return NextResponse.json({ error: "That startup doesn't exist." }, { status: 404 });
    if (startup.founder_id !== user.id) {
      return NextResponse.json({ error: "That isn't your startup." }, { status: 403 });
    }
    amountCents = productCents(kind);
    productId = productDodoId(kind);
  } else {
    amountCents = 900; // sale_listing (legacy path)
  }

  // Best-effort internal payment record. This must NEVER block checkout: the
  // buyer is sent to Dodo either way, and both the webhook and the success page
  // reconcile afterwards. If the service-role insert fails (e.g. a missing
  // SUPABASE_SERVICE_ROLE_KEY), we log it and carry on.
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

  // Carry the purchase on the return URL so the success page can unlock it and
  // show the creative form even if the payment row or webhook is unavailable.
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const params = new URLSearchParams({ kind, ref: referenceId });
  if (paymentId) params.set("p", paymentId);
  const successUrl = `${site}/checkout/success?${params.toString()}`;

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
