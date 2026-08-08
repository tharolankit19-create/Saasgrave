import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createDodoCheckout, type CheckoutKind } from "@/lib/dodo";
import {
  PRODUCTS,
  isPlacement,
  productCents,
  productDodoId,
  productEnvName,
  type ProductKey,
} from "@/lib/ad-pricing";

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; code: "no_startup" | "sold_out" | "already" | "failed"; error: string };

/** Which checkout kind each product settles into. */
export function kindFor(product: ProductKey): CheckoutKind {
  if (isPlacement(product)) return "ad_slot";
  return product as CheckoutKind; // featured | directory | bundle
}

/**
 * Turn "the visitor clicked Buy on this product" into a Dodo checkout URL.
 *
 * Everything that decides the price — the product, its amount, its Dodo product
 * id — is resolved here from the catalogue, and the thing being bought (a free
 * slot, or the buyer's own listing) is looked up server-side. Nothing about the
 * price or the target comes from the client.
 */
export async function createPromotionCheckout({
  product,
  userId,
  email,
  origin,
}: {
  product: ProductKey;
  userId: string;
  email?: string;
  origin: string;
}): Promise<CheckoutResult> {
  const supabase = createClient();
  const spec = PRODUCTS[product];
  const kind = kindFor(product);

  // ── What exactly are we selling them? ───────────────────
  let referenceId: string | null = null;

  if (kind === "ad_slot") {
    const { data } = await supabase
      .from("ad_slots")
      .select("id, active, headline, buyer_id")
      .eq("placement", product)
      .is("buyer_id", null)
      .order("position");
    const free = (data || []).find((s) => !(s.active && s.headline));
    if (!free) {
      return { ok: false, code: "sold_out", error: `Every ${spec.name} is booked right now.` };
    }
    referenceId = free.id;
  } else {
    const { data } = await supabase
      .from("startups")
      .select("id, featured, featured_until")
      .eq("founder_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);
    const startup = data?.[0];
    if (!startup) {
      return {
        ok: false,
        code: "no_startup",
        error: "List a startup first — that's what the promotion points at.",
      };
    }
    if (
      product === "featured" &&
      startup.featured &&
      (!startup.featured_until || new Date(startup.featured_until) > new Date())
    ) {
      return { ok: false, code: "already", error: "That listing is already featured." };
    }
    referenceId = startup.id;
  }

  const amountCents = productCents(product);

  // Best-effort payment record — never blocks checkout; the webhook and the
  // success page both reconcile afterwards.
  let paymentId: string | null = null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("payments")
      .insert({ user_id: userId, kind, reference_id: referenceId, amount_cents: amountCents, status: "pending" })
      .select("id")
      .single();
    if (error) console.error("checkout: payment record insert failed (continuing):", error.message);
    paymentId = data?.id ?? null;
  } catch (e: any) {
    console.error("checkout: payment record insert threw (continuing):", e?.message || e);
  }

  const params = new URLSearchParams({ kind, ref: referenceId! });
  if (paymentId) params.set("p", paymentId);

  try {
    const url = await createDodoCheckout({
      kind,
      referenceId: referenceId!,
      userId,
      email,
      successUrl: `${origin}/checkout/success?${params.toString()}`,
      productId: productDodoId(product),
      productEnvName: productEnvName(product),
    });
    return { ok: true, url };
  } catch (e: any) {
    return { ok: false, code: "failed", error: e?.message || "Checkout couldn't start." };
  }
}
