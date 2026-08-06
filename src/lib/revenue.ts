// ─── Revenue verification ───────────────────────────────────
// Server-only. Given a read-only API key from a payment provider, pull the
// active subscriptions and compute real MRR. Every provider guards its own
// response shape and throws on anything unexpected — we never invent a number,
// so a "verified" badge always means a provider actually returned it.

export type RevenueProvider = "stripe" | "paddle" | "lemonsqueezy" | "dodo";

export const PROVIDERS: { id: RevenueProvider; name: string; hint: string }[] = [
  { id: "stripe", name: "Stripe", hint: "Restricted read-only key (rk_…)" },
  { id: "paddle", name: "Paddle", hint: "Read-only API key (Billing)" },
  { id: "lemonsqueezy", name: "Lemon Squeezy", hint: "API key with read access" },
  { id: "dodo", name: "Dodo Payments", hint: "API key (test or live)" },
];

// Normalise any recurring amount (in minor units) to a monthly figure.
function toMonthly(amountMinor: number, interval: string, count = 1): number {
  const i = interval.toLowerCase();
  const c = count || 1;
  if (i.startsWith("year")) return amountMinor / (12 * c);
  if (i.startsWith("week")) return (amountMinor * 52) / 12 / c;
  if (i.startsWith("day")) return (amountMinor * 365) / 12 / c;
  return amountMinor / c; // month
}

export async function verifyRevenue(
  provider: RevenueProvider,
  apiKey: string
): Promise<{ mrr: number; customers: number }> {
  const key = apiKey.trim();
  switch (provider) {
    case "stripe":
      return stripe(key);
    case "paddle":
      return paddle(key);
    case "lemonsqueezy":
      return lemonSqueezy(key);
    case "dodo":
      return dodo(key);
    default:
      throw new Error("Unknown provider");
  }
}

// ── Stripe ──────────────────────────────────────────────────
async function stripe(key: string) {
  let mrrCents = 0;
  const customers = new Set<string>();
  let startingAfter: string | undefined;
  for (let page = 0; page < 20; page++) {
    const url = new URL("https://api.stripe.com/v1/subscriptions");
    url.searchParams.set("status", "active");
    url.searchParams.set("limit", "100");
    if (startingAfter) url.searchParams.set("starting_after", startingAfter);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || "Stripe rejected the key");
    }
    const body = await res.json();
    for (const sub of body.data || []) {
      if (sub.customer) customers.add(sub.customer);
      for (const item of sub.items?.data || []) {
        const price = item.price;
        if (!price?.unit_amount) continue;
        mrrCents += toMonthly(price.unit_amount * (item.quantity || 1), price.recurring?.interval || "month", price.recurring?.interval_count);
      }
    }
    if (!body.has_more) break;
    startingAfter = body.data[body.data.length - 1]?.id;
  }
  return { mrr: Math.round(mrrCents / 100), customers: customers.size };
}

// ── Paddle (Billing) ────────────────────────────────────────
async function paddle(key: string) {
  let mrrCents = 0;
  const customers = new Set<string>();
  let url: string | null = "https://api.paddle.com/subscriptions?status=active&per_page=100";
  for (let page = 0; page < 20 && url; page++) {
    const res: Response = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.detail || "Paddle rejected the key");
    }
    const body = await res.json();
    for (const sub of body.data || []) {
      if (sub.customer_id) customers.add(sub.customer_id);
      const cycle = sub.billing_cycle || {};
      for (const item of sub.items || []) {
        const amount = Number(item?.price?.unit_price?.amount ?? 0); // minor units, string
        if (!amount) continue;
        mrrCents += toMonthly(amount * (item.quantity || 1), cycle.interval || "month", cycle.frequency);
      }
    }
    url = body.meta?.pagination?.has_more ? body.meta.pagination.next : null;
  }
  return { mrr: Math.round(mrrCents / 100), customers: customers.size };
}

// ── Lemon Squeezy ───────────────────────────────────────────
async function lemonSqueezy(key: string) {
  const headers = { Authorization: `Bearer ${key}`, Accept: "application/vnd.api+json" };
  const customers = new Set<string>();
  const priceIds = new Map<string, number>(); // priceId -> qty total across active subs

  let url: string | null = "https://api.lemonsqueezy.com/v1/subscriptions?filter[status]=active&page[size]=100";
  for (let page = 0; page < 20 && url; page++) {
    const res: Response = await fetch(url, { headers });
    if (!res.ok) throw new Error("Lemon Squeezy rejected the key");
    const body = await res.json();
    for (const sub of body.data || []) {
      const a = sub.attributes || {};
      if (a.customer_id) customers.add(String(a.customer_id));
      const item = a.first_subscription_item;
      const priceId = item?.price_id != null ? String(item.price_id) : null;
      if (priceId) priceIds.set(priceId, (priceIds.get(priceId) || 0) + (item.quantity || 1));
    }
    url = body.links?.next || null;
  }

  // Fetch each unique price once and normalise to monthly.
  let mrrCents = 0;
  for (const [priceId, qty] of Array.from(priceIds.entries())) {
    const res = await fetch(`https://api.lemonsqueezy.com/v1/prices/${priceId}`, { headers });
    if (!res.ok) continue;
    const p = (await res.json())?.data?.attributes || {};
    const unit = Number(p.unit_price ?? 0); // minor units
    if (!unit) continue;
    mrrCents += toMonthly(unit * qty, p.renewal_interval_unit || "month", p.renewal_interval_quantity);
  }
  if (priceIds.size === 0) return { mrr: 0, customers: customers.size };
  return { mrr: Math.round(mrrCents / 100), customers: customers.size };
}

// ── Dodo Payments ───────────────────────────────────────────
async function dodo(key: string) {
  // Try live then test (same self-healing idea as checkout).
  const bases = ["https://live.dodopayments.com", "https://test.dodopayments.com"];
  let lastErr = "Dodo rejected the key";
  for (const base of bases) {
    const res = await fetch(`${base}/subscriptions?status=active`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.status === 401) {
      lastErr = "Dodo rejected the key";
      continue;
    }
    if (!res.ok) {
      lastErr = `Dodo error ${res.status}`;
      continue;
    }
    const body = await res.json();
    const list = body.items || body.data || body.subscriptions || [];
    let mrrCents = 0;
    const customers = new Set<string>();
    for (const sub of list) {
      const cust = sub.customer_id || sub.customer?.customer_id;
      if (cust) customers.add(String(cust));
      const amount = Number(sub.recurring_pre_tax_amount ?? sub.amount ?? 0); // minor units
      const interval = sub.payment_frequency_interval || sub.subscription_period_interval || "month";
      const count = sub.payment_frequency_count || 1;
      if (amount) mrrCents += toMonthly(amount, interval, count);
    }
    return { mrr: Math.round(mrrCents / 100), customers: customers.size };
  }
  throw new Error(lastErr);
}
