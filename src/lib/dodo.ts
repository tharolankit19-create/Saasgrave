// ─── Dodo Payments helper ───────────────────────────────────
// Thin wrapper over the Dodo Payments REST API. Server-only.
// Docs: https://docs.dodopayments.com
//
// We create a hosted checkout session and let Dodo (a Merchant of
// Record) handle card data, tax and compliance. The webhook is the
// source of truth for "paid" — never trust the redirect alone.

const TEST_BASE = "https://test.dodopayments.com";
const LIVE_BASE = "https://live.dodopayments.com";

// The paid actions. Each resolves to a fixed-price Dodo product:
//   ad_slot   → a promotion placement (sidebar $19 / sponsored $29 / newsletter $49)
//   featured  → Featured Launch ($9), pins a startup to the top of Browse
//   directory → Directory Blast ($99), 100+ hand-made directory submissions
//   bundle    → everything above, discounted ($149)
//   sale_listing → legacy; listing and selling are free (we take 3% on a sale)
export type CheckoutKind = "launch" | "ad_slot" | "featured" | "directory" | "bundle" | "sale_listing";

// NOTE: there is deliberately no "default" product here.
//
// This used to fall back to a shared product whenever a specific one wasn't
// configured, which meant a $99 Directory Blast and a $9 Featured Launch both
// silently charged whatever the fallback product cost. Every price now has to
// come from its own Dodo product, resolved by the caller from the catalogue —
// and if that product isn't configured, checkout fails loudly rather than
// charging the wrong amount.

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
  /** Required. The Dodo product for exactly this price — resolved from the catalogue. */
  productId?: string;
  /** Env var name to quote if productId is missing, so the error is actionable. */
  productEnvName?: string;
  orderId?: string;
}

export async function createDodoCheckout({
  kind,
  referenceId,
  userId,
  email,
  successUrl,
  productId,
  productEnvName,
  orderId,
}: CreateCheckoutArgs) {
  const key = apiKey();
  const resolved = productId?.trim();

  if (!key) {
    throw new Error("Payments aren't set up yet — DODO_API_KEY is missing.");
  }
  if (!resolved) {
    // Never guess: charging the wrong product is worse than not charging at all.
    throw new Error(
      `This isn't set up for payment yet — ${productEnvName || "its Dodo product ID"} is missing. ` +
        `Create a Dodo product at the right price and set that environment variable.`
    );
  }

  const payload = {
    product_cart: [{ product_id: resolved, quantity: 1 }],
    return_url: successUrl,
    customer: email ? { email } : undefined,
    // travels round-trip and comes back on the webhook so we know what was bought
    metadata: { kind, reference_id: referenceId, user_id: userId, ...(orderId ? { order_id: orderId } : {}) },
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

/**
 * Ask Dodo whether a payment actually succeeded.
 *
 * The webhook is still the source of truth, but it can be unconfigured or slow,
 * and a buyer who has just paid must not be left stranded. The success page
 * calls this to confirm the payment itself and unlock the purchase immediately.
 *
 * Returns the authoritative provider object, or null if verification is unavailable.
 */
export async function retrieveDodoPayment(paymentId: string): Promise<any | null> {
  const key = apiKey();
  if (!key || !paymentId) return null;

  const primary = isLiveMode() ? LIVE_BASE : TEST_BASE;
  const fallback = primary === LIVE_BASE ? TEST_BASE : LIVE_BASE;

  for (const base of [primary, fallback]) {
    let res: Response;
    try {
      res = await fetch(`${base}/payments/${encodeURIComponent(paymentId)}`, {
        headers: { Authorization: `Bearer ${key}` },
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      continue; // network hiccup — try the other environment
    }
    if (res.status === 401 || res.status === 404) continue; // wrong env, try the other
    if (!res.ok) return null;

    const data: any = await res.json().catch(() => null);
    if (!data) return null;
    return data;
  }
  return null;
}

function postCheckout(base: string, key: string, payload: unknown) {
  return fetch(`${base}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000),
  });
}

export async function verifyDodoPayment(paymentId: string, expected?: { kind: string; referenceId: string; userId: string }): Promise<boolean | null> {
  const data = await retrieveDodoPayment(paymentId);
  if (!data) return null;
  if (expected && (data.metadata?.kind !== expected.kind || data.metadata?.reference_id !== expected.referenceId || data.metadata?.user_id !== expected.userId)) return false;
  if (data.status === "succeeded") return true;
  if (["failed", "cancelled"].includes(data.status)) return false;
  return null;
}
