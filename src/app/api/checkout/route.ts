import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { createDodoCheckout, type CheckoutKind } from "@/lib/dodo";

// Creates a Dodo hosted-checkout session for one of our three paid actions:
//   ad_slot ($49) · listing ($9) · sale_listing ($90)
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

  const amounts: Record<CheckoutKind, number> = {
    ad_slot: 4900,
    listing: 900,
    sale_listing: 9000,
  };

  const admin = createAdminClient();
  const { data: payment, error } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      kind,
      reference_id: referenceId,
      amount_cents: amounts[kind],
      status: "pending",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  try {
    const url = await createDodoCheckout({
      kind,
      referenceId,
      userId: user.id,
      email: user.email ?? undefined,
      successUrl: `${site}/checkout/success?p=${payment.id}`,
    });
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
