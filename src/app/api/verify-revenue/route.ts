import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { verifyRevenue, type RevenueProvider } from "@/lib/revenue";

const VALID: RevenueProvider[] = ["stripe", "paddle", "lemonsqueezy", "dodo"];

// Verifies real revenue with a read-only key from a payment provider, computes
// MRR from active subscriptions, writes verified_mrr — and NEVER stores the key.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { startupId, apiKey, provider } = (await req.json()) as {
    startupId?: string;
    apiKey?: string;
    provider?: RevenueProvider;
  };
  if (!startupId || !apiKey) {
    return NextResponse.json({ error: "Missing startupId or apiKey" }, { status: 400 });
  }
  const prov: RevenueProvider = VALID.includes(provider as RevenueProvider) ? (provider as RevenueProvider) : "stripe";

  // Ownership check — only the founder can verify their own startup.
  const { data: startup } = await supabase
    .from("startups")
    .select("id, founder_id")
    .eq("id", startupId)
    .single();
  if (!startup || startup.founder_id !== user.id) {
    return NextResponse.json({ error: "Not your startup" }, { status: 403 });
  }

  let mrr: number;
  let customers: number;
  try {
    ({ mrr, customers } = await verifyRevenue(prov, apiKey));
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Verification failed" }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin
    .from("startups")
    .update({ verified_mrr: mrr, revenue_verified: true, verified_provider: prov })
    .eq("id", startupId);

  // Key goes out of scope here — never persisted.
  return NextResponse.json({ mrr, customers });
}
