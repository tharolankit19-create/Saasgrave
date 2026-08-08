import { createAdminClient } from "@/lib/supabase/server";
import type { CheckoutKind } from "@/lib/dodo";
import { isPlacement, runEndsAt, type ProductKey } from "@/lib/ad-pricing";

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

  // Each product runs for its own length — a Featured Launch is a week, the
  // slots are a month — so the end date is always derived from the catalogue.
  const now = new Date();
  const endsFor = (key: ProductKey) => runEndsAt(key, now)?.toISOString() ?? null;

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
        .select("id, buyer_id, placement")
        .eq("id", referenceId)
        .single();
      if (!slot) return false;
      if (slot.buyer_id && buyerId && slot.buyer_id !== buyerId) return false;

      const placement = isPlacement(slot.placement) ? slot.placement : "sidebar";
      const { error } = await admin
        .from("ad_slots")
        .update({
          active: true,
          buyer_id: buyerId ?? slot.buyer_id ?? null,
          starts_at: now.toISOString(),
          ends_at: endsFor(placement),
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
        .update({ featured: true, featured_until: endsFor("featured") })
        .eq("id", referenceId);
      if (error) {
        console.error("fulfil: featured update failed:", error.message);
        return false;
      }
      return true;
    }

    if (kind === "directory") {
      const { error } = await admin
        .from("startups")
        .update({ directory_status: "paid" })
        .eq("id", referenceId);
      if (error) {
        console.error("fulfil: directory update failed:", error.message);
        return false;
      }
      return true;
    }

    if (kind === "bundle") {
      // Everything at once: feature the startup, queue the directory blast, and
      // reserve one free slot of each placement for the buyer to fill in. Each
      // part keeps its own run length rather than sharing one.
      const { error } = await admin
        .from("startups")
        .update({
          featured: true,
          featured_until: endsFor("featured"),
          directory_status: "paid",
        })
        .eq("id", referenceId);
      if (error) {
        console.error("fulfil: bundle startup update failed:", error.message);
        return false;
      }

      if (buyerId) {
        for (const placement of ["sidebar", "sponsored", "newsletter"] as const) {
          const { data: free } = await admin
            .from("ad_slots")
            .select("id")
            .eq("placement", placement)
            .is("buyer_id", null)
            .order("position")
            .limit(1);
          const slotId = free?.[0]?.id;
          if (!slotId) continue; // that placement is sold out — the rest still land
          await admin
            .from("ad_slots")
            .update({
              active: true,
              buyer_id: buyerId,
              starts_at: now.toISOString(),
              ends_at: endsFor(placement),
            })
            .eq("id", slotId)
            .is("buyer_id", null); // don't race another buyer
        }
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
