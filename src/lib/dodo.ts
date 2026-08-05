// ─── Dodo Payments helper ───────────────────────────────────
// Thin wrapper over the Dodo Payments REST API. Server-only.
// Docs: https://docs.dodopayments.com
//
// We create a hosted checkout session and let Dodo (a Merchant of
// Record) handle card data, tax and compliance. The webhook is the
// source of truth for "paid" — never trust the redirect alone.

const TEST_BASE = "https://test.dodopayments.com";
const LIVE_BASE = "https://live.dodopayments.com";

// Only two paid actions exist, each with its OWN Dodo product:
//   ad_slot      → DODO_PRODUCT_ID_ADS   ($49 / 30 days)
//   sale_listing → DODO_PRODUCT_ID_SALE  ($9 one-time)
// Listing a startup is free — it has no product.
export type CheckoutKind = "ad_slot" | "sale_listing";

// Resolve product IDs at call time (not import time) and trim, so a stray
// newline or space pasted into the env — a very common cause of failures —
// doesn't break checkout. New names first, old names kept as a fallback.
function productFor(kind: CheckoutKind): string | undefined {
  const raw =
    kind === "ad_slot"
      ? process.env.DODO_PRODUCT_ID_ADS || process.env.DODO_PRODUCT_AD_SLOT
      : process.env.DODO_PRODUCT_ID_SALE || process.env.DODO_PRODUCT_SALE_LISTING;
  return raw?.trim() || undefined;
}

// Strip whitespace and an accidental "Bearer " prefix from the key.
function apiKey(): string | undefined {
  return process.env.DODO_API_KEY?.trim().replace(/^Bearer\s+/i, "") || undefined;
}

function isLiveMode(): boolean {
  const m = (process.env.DODO_ENV || "").toLowerCase();
  return m.includes("live") || m.includes("prod");
}

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
  const key = apiKey();
  const productId = productFor(kind);

  if (!key) {
    throw new Error("Payments aren't set up yet — DODO_API_KEY is missing.");
  }
  if (!productId) {
    const envName = kind === "ad_slot" ? "DODO_PRODUCT_ID_ADS" : "DODO_PRODUCT_ID_SALE";
    throw new Error(`Payments aren't set up for this action — set ${envName} to the Dodo product ID.`);
  }

  const payload = {
    product_cart: [{ product_id: productId, quantity: 1 }],
    return_url: successUrl,
    customer: email ? { email } : undefined,
    // travels round-trip and comes back on the webhook so we know what was bought
    metadata: { kind, reference_id: referenceId, user_id: userId },
  };

  // Try the configured environment first; on a 401 (the classic "test key on
  // live endpoint" or vice-versa mistake) automatically try the other one, so a
  // mismatched DODO_ENV doesn't block a real, valid key.
  const primary = isLiveMode() ? LIVE_BASE : TEST_BASE;
  const fallback = primary === LIVE_BASE ? TEST_BASE : LIVE_BASE;

  let res = await postCheckout(primary, key, payload);
  if (res.status === 401) {
    res = await postCheckout(fallback, key, payload);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 401) {
      throw new Error(
        "Dodo rejected the API key (401). Copy the key again from Dodo → Developer → API Keys, and make sure DODO_ENV matches it (test key → test_mode, live key → live_mode)."
      );
    }
    console.error(`Dodo checkout failed (${res.status}): ${text}`);
    throw new Error(`Checkout couldn't start (Dodo ${res.status}). Please try again.`);
  }

  const data = (await res.json()) as { checkout_url?: string; payment_link?: string; url?: string };
  const url = data.checkout_url || data.payment_link || data.url;
  if (!url) throw new Error("Dodo returned no checkout URL");
  return url;
}

function postCheckout(base: string, key: string, payload: unknown) {
  return fetch(`${base}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
