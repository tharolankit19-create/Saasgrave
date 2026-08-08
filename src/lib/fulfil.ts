import { createAdminClient } from "@/lib/supabase/server";
import type { CheckoutKind } from "@/lib/dodo";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Unlock a purchase. Deliberately idempotent and shared by both paths that can
 * confirm a payment — the Dodo webhook and the post-checkout success page — so
 * a buyer is never left having paid with nothing to show for it just because
 * one of the two is unavailable.
 */
export async function fulfilPurchase({
  kind,
  referenceId,
  buyerId,
  dodoPaymentId,
  markPaid = true,
}: {
  kind: CheckoutKind | string;
  referenceId: string;
  buyerId?: string | null;
  dodoPaymentId?: string | null;
  /**
   * Only stamp the payment "paid" when the payment is definitively confirmed.
   * The success page unlocks optimistically while Dodo is still unreachable, and
   * leaving those rows pending keeps them auditable (an active placement whose
   * payment never settled) until the webhook reconciles.
   */
  markPaid?: boolean;
}): Promise<boolean> {
  if (!kind || !referenceId) return false;

  let admin;
  try {
    admin = createAdminClient();
  } catch (e: any) {
    console.error("fulfil: no admin client (SUPABASE_SERVICE_ROLE_KEY missing?):", e?.message || e);
    return false;
  }

  const now = new Date();
  const ends = new Date(now.getTime() + THIRTY_DAYS_MS);

  try {
    if (markPaid) {
      await admin
        .from("payments")
        .update({ status: "paid", ...(dodoPaymentId ? { dodo_payment_id: dodoPaymentId } : {}) })
        .eq("reference_id", referenceId)
        .eq("kind", kind)
        .eq("status", "pending");
    }

    if (kind === "ad_slot") {
      // Claim the slot for the buyer so it shows up on their dashboard and they
      // can add their creative straight away. Never steal a slot someone else
      // already owns.
      const { data: slot } = await admin
        .from("ad_slots")
        .select("id, buyer_id, price_cents")
        .eq("id", referenceId)
        .single();
      if (!slot) return false;
      if (slot.buyer_id && buyerId && slot.buyer_id !== buyerId) return false;

      const { error } = await admin
        .from("ad_slots")
        .update({
          active: true,
          buyer_id: buyerId ?? slot.buyer_id ?? null,
          starts_at: now.toISOString(),
          ends_at: ends.toISOString(),
        })
        .eq("id", referenceId);
      if (error) {
        console.error("fulfil: ad_slot update failed:", error.message);
        return false;
      }
      return true;
    }

    if (kind === "featured") {
      const { error } = await admin
        .from("startups")
        .update({ featured: true, featured_until: ends.toISOString() })
        .eq("id", referenceId);
      if (error) {
        console.error("fulfil: featured update failed:", error.message);
        return false;
      }
      return true;
    }

    if (kind === "sale_listing") {
      await admin
        .from("startups")
        .update({ sale_listing_paid: true, for_sale: true, status: "listed" })
        .eq("id", referenceId);
      return true;
    }
  } catch (e: any) {
    console.error("fulfil: threw:", e?.message || e);
    return false;
  }

  return false;
}
