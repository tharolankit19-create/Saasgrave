import { NextResponse } from "next/server";
import { fulfilPurchase } from "@/lib/fulfil";
import { retrieveDodoPayment } from "@/lib/dodo";
import { confirmLaunchPayment } from "@/lib/launch-payment";

/** Never trust event metadata or an unsigned success flag. Retrieve the payment
 * with our merchant credential and use only that authoritative response. */
export async function POST(req: Request) {
  const event = await req.json().catch(() => null);
  if (!event) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  if (event.type !== "payment.succeeded") return NextResponse.json({ received: true });
  const payload = event.data?.object || event.data;
  const paymentId = payload?.payment_id;
  if (typeof paymentId !== "string" || paymentId.length > 200) return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
  try {
    const payment = await retrieveDodoPayment(paymentId);
    if (!payment) return NextResponse.json({ error: "Provider verification unavailable" }, { status: 503 });
    if (payment.status !== "succeeded") return NextResponse.json({ received: true });
    const metadata = payment.metadata || {};
    if (metadata.kind === "launch") {
      const order = await confirmLaunchPayment(metadata.order_id, paymentId);
      if (!order) return NextResponse.json({ error: "Order could not be confirmed" }, { status: 503 });
    } else {
      if (!["ad_slot", "featured", "directory", "bundle", "sale_listing"].includes(metadata.kind) || !metadata.reference_id || !metadata.user_id) {
        return NextResponse.json({ received: true });
      }
      const fulfilled = await fulfilPurchase({ kind: metadata.kind, referenceId: metadata.reference_id, buyerId: metadata.user_id, dodoPaymentId: paymentId });
      if (!fulfilled) return NextResponse.json({ error: "Fulfilment needs retry" }, { status: 503 });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Dodo fulfilment:", error);
    return NextResponse.json({ error: "Fulfilment needs retry" }, { status: 503 });
  }
}
