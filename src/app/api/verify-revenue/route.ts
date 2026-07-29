import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Verifies real revenue with a read-only Stripe key, computes MRR from active
// subscriptions, writes verified_mrr — and NEVER stores the key.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { startupId, apiKey } = (await req.json()) as { startupId?: string; apiKey?: string };
  if (!startupId || !apiKey) {
    return NextResponse.json({ error: "Missing startupId or apiKey" }, { status: 400 });
  }

  // Ownership check — only the founder can verify their own startup.
  const { data: startup } = await supabase
    .from("startups")
    .select("id, founder_id")
    .eq("id", startupId)
    .single();
  if (!startup || startup.founder_id !== user.id) {
    return NextResponse.json({ error: "Not your startup" }, { status: 403 });
  }

  // Pull active subscriptions from Stripe and sum monthly-normalized amounts.
  let mrrCents = 0;
  let customers = new Set<string>();
  try {
    let startingAfter: string | undefined;
    for (let page = 0; page < 10; page++) {
      const url = new URL("https://api.stripe.com/v1/subscriptions");
      url.searchParams.set("status", "active");
      url.searchParams.set("limit", "100");
      if (startingAfter) url.searchParams.set("starting_after", startingAfter);

      const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: err?.error?.message || "Stripe rejected the key" },
          { status: 400 }
        );
      }
      const body = await res.json();
      for (const sub of body.data || []) {
        if (sub.customer) customers.add(sub.customer);
        for (const item of sub.items?.data || []) {
          const price = item.price;
          const qty = item.quantity || 1;
          if (!price?.unit_amount) continue;
          const interval = price.recurring?.interval;
          const count = price.recurring?.interval_count || 1;
          let monthly = price.unit_amount * qty;
          if (interval === "year") monthly = monthly / (12 * count);
          else if (interval === "week") monthly = (monthly * 52) / 12 / count;
          else if (interval === "day") monthly = (monthly * 365) / 12 / count;
          else if (interval === "month") monthly = monthly / count;
          mrrCents += monthly;
        }
      }
      if (!body.has_more) break;
      startingAfter = body.data[body.data.length - 1]?.id;
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Stripe request failed" }, { status: 500 });
  }

  const mrr = Math.round(mrrCents / 100);

  const admin = createAdminClient();
  await admin
    .from("startups")
    .update({
      verified_mrr: mrr,
      revenue_verified: true,
      verified_provider: "stripe",
    })
    .eq("id", startupId);

  // Key goes out of scope here — never persisted.
  return NextResponse.json({ mrr, customers: customers.size });
}
