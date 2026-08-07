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

  // Not signed in → send them to log in, then straight back to promote.
  if (res.status === 401) {
    const next = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/browse";
    window.location.href = `/login?next=${encodeURIComponent(next)}`;
    return false;
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) {
    toast.error(data.error || "Could not start checkout. Please try again.");
    return false;
  }
  window.location.href = data.url as string;
  return true;
}
