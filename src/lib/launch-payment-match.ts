/** A successful unrelated/cheaper payment must never unlock this order. */
export function matchesLaunchPayment(
  order: {
    id: string;
    startup_id: string;
    user_id: string;
    product_id: string;
  },
  payment: any,
): boolean {
  return (
    payment?.status === "succeeded" &&
    payment.metadata?.kind === "launch" &&
    payment.metadata.order_id === order.id &&
    payment.metadata.reference_id === order.startup_id &&
    payment.metadata.user_id === order.user_id &&
    Array.isArray(payment.product_cart) &&
    payment.product_cart.length === 1 &&
    payment.product_cart[0].product_id === order.product_id &&
    payment.product_cart[0].quantity === 1
  );
}
