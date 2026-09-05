import { createAdminClient } from "@/lib/supabase/server";
import { retrieveDodoPayment } from "@/lib/dodo";
import { matchesLaunchPayment } from "@/lib/launch-payment-match";

export async function confirmLaunchPayment(
  orderId: string,
  paymentId: string,
  userId?: string,
) {
  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("launch_orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (error || !order || (userId && order.user_id !== userId)) return null;
  if (order.fulfilled_at) return order;
  const payment = await retrieveDodoPayment(paymentId);
  if (!matchesLaunchPayment(order, payment)) return null;
  const { error: fulfilError } = await admin.rpc("fulfil_launch_order", {
    order_id: order.id,
    provider_payment_id: paymentId,
  });
  if (fulfilError)
    throw new Error("Payment confirmed; launch fulfilment needs a retry.");
  const { data } = await admin
    .from("launch_orders")
    .select("*")
    .eq("id", order.id)
    .single();
  return data;
}
