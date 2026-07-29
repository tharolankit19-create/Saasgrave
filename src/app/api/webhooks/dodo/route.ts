import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Dodo Payments webhook — the SINGLE source of truth for "paid".
// On a successful payment we mark the payment row paid and unlock whatever
// was purchased (activate ad slot / mark listing paid).
//
// NOTE: Dodo signs webhooks (Standard Webhooks / svix style). For production,
// verify the signature with DODO_WEBHOOK_SECRET before trusting the payload.
// A minimal verification is left as a TODO to keep the MVP dependency-free.
export async function POST(req: Request) {
  const raw = await req.text();

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const type: string = event?.type || event?.event_type || "";
  const isSuccess =
    type.includes("succeeded") || type.includes("completed") || type === "payment.paid";
  if (!isSuccess) return NextResponse.json({ received: true });

  const data = event?.data?.object || event?.data || event;
  const metadata = data?.metadata || {};
  const kind = metadata.kind as string | undefined;
  const referenceId = metadata.reference_id as string | undefined;
  const paymentId = data?.payment_id || data?.id;

  if (!kind || !referenceId) {
    return NextResponse.json({ received: true, note: "no metadata" });
  }

  const admin = createAdminClient();

  // 1) mark the matching pending payment as paid
  await admin
    .from("payments")
    .update({ status: "paid", dodo_payment_id: paymentId })
    .eq("reference_id", referenceId)
    .eq("kind", kind)
    .eq("status", "pending");

  // 2) unlock the purchased thing
  if (kind === "ad_slot") {
    const now = new Date();
    const ends = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30-day run
    await admin
      .from("ad_slots")
      .update({ active: true, starts_at: now.toISOString(), ends_at: ends.toISOString() })
      .eq("id", referenceId);
  } else if (kind === "sale_listing") {
    await admin
      .from("startups")
      .update({ sale_listing_paid: true, for_sale: true, status: "listed" })
      .eq("id", referenceId);
  }

  return NextResponse.json({ received: true });
}
