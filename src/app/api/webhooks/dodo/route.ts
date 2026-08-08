import { NextResponse } from "next/server";
import { fulfilPurchase } from "@/lib/fulfil";

// Dodo Payments webhook. On a successful payment we unlock whatever was bought.
// The same fulfilment runs from the post-checkout success page, so a buyer is
// never stranded if this webhook is unconfigured or late — whichever path
// confirms first wins, and fulfilment is idempotent.
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
  const buyerId = metadata.user_id as string | undefined;
  const paymentId = data?.payment_id || data?.id;

  if (!kind || !referenceId) {
    return NextResponse.json({ received: true, note: "no metadata" });
  }

  await fulfilPurchase({ kind, referenceId, buyerId, dodoPaymentId: paymentId });

  return NextResponse.json({ received: true });
}
