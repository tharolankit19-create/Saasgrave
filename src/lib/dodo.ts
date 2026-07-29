// ─── Dodo Payments helper ───────────────────────────────────
// Thin wrapper over the Dodo Payments REST API. Server-only.
// Docs: https://docs.dodopayments.com
//
// We create a hosted checkout session and let Dodo (a Merchant of
// Record) handle card data, tax and compliance. The webhook is the
// source of truth for "paid" — never trust the redirect alone.

const BASE =
  process.env.DODO_ENV === "live_mode"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";

// Only two paid actions exist, each with its OWN Dodo product:
//   ad_slot      → DODO_PRODUCT_AD_SLOT       ($49 / 30 days)
//   sale_listing → DODO_PRODUCT_SALE_LISTING  ($9 one-time)
// Listing a startup is free — it has no product.
export type CheckoutKind = "ad_slot" | "sale_listing";

const PRODUCTS: Record<CheckoutKind, string | undefined> = {
  ad_slot: process.env.DODO_PRODUCT_AD_SLOT,
  sale_listing: process.env.DODO_PRODUCT_SALE_LISTING,
};

interface CreateCheckoutArgs {
  kind: CheckoutKind;
  referenceId: string; // startup id or ad-slot id
  userId: string;
  email?: string;
  successUrl: string;
}

export async function createDodoCheckout({
  kind,
  referenceId,
  userId,
  email,
  successUrl,
}: CreateCheckoutArgs) {
  const productId = PRODUCTS[kind];
  if (!process.env.DODO_API_KEY || !productId) {
    throw new Error(
      `Dodo not configured for "${kind}". Set DODO_API_KEY and the matching DODO_PRODUCT_* env var.`
    );
  }

  const res = await fetch(`${BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DODO_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: successUrl,
      customer: email ? { email } : undefined,
      // travels round-trip and comes back on the webhook so we know what was bought
      metadata: { kind, reference_id: referenceId, user_id: userId },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Dodo checkout failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { checkout_url?: string; payment_link?: string; url?: string };
  const url = data.checkout_url || data.payment_link || data.url;
  if (!url) throw new Error("Dodo returned no checkout URL");
  return url;
}
