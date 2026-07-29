import { toast } from "sonner";
import type { CheckoutKind } from "@/lib/dodo";

// Kicks off a Dodo checkout from any client component and redirects the
// browser to the hosted payment page.
export async function startCheckout(kind: CheckoutKind, referenceId: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, referenceId }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) {
    toast.error(data.error || "Could not start checkout.");
    return false;
  }
  window.location.href = data.url as string;
  return true;
}
