"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, CreditCard, Loader2, Rocket } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/checkout-client";

// Dashboard row actions. A new listing starts as a draft; here the founder
// chooses what to do with it:
//   • Publish free  → goes live on the marketplace at no cost
//   • List for sale → $9 one-time fee, goes live and marked for sale
export function ListingRowActions({
  startup,
}: {
  startup: {
    id: string;
    slug: string;
    status: string;
    for_sale: boolean;
    sale_listing_paid: boolean;
  };
}) {
  const supabase = createClient();
  const router = useRouter();
  const [publishing, setPublishing] = useState(false);
  const [paying, setPaying] = useState(false);

  const isDraft = startup.status === "draft";
  const isListed = startup.status === "listed";
  const canSell = !startup.sale_listing_paid; // hasn't paid the $9 sale fee yet

  async function publishFree() {
    setPublishing(true);
    const { error } = await supabase
      .from("startups")
      .update({ status: "listed" })
      .eq("id", startup.id);
    setPublishing(false);
    if (error) return toast.error(error.message);
    toast.success("Your listing is live.");
    router.refresh();
  }

  async function listForSale() {
    setPaying(true);
    const ok = await startCheckout("sale_listing", startup.id);
    if (!ok) setPaying(false);
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      {isDraft && (
        <button
          onClick={publishFree}
          disabled={publishing}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bone-100 px-4 text-sm font-medium text-ink-950 transition hover:bg-white disabled:opacity-50"
        >
          {publishing ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
          Publish free
        </button>
      )}

      {canSell && (
        <button
          onClick={listForSale}
          disabled={paying}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-accent-500/40 bg-accent-600/10 px-4 text-sm font-medium text-accent-400 transition hover:bg-accent-600/20 disabled:opacity-50"
        >
          {paying ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
          List for sale · $9
        </button>
      )}

      {isListed && (
        <Link
          href={`/startup/${startup.slug}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/12 px-4 text-sm text-bone-300 transition hover:border-white/25"
        >
          <ExternalLink size={14} /> View
        </Link>
      )}
    </div>
  );
}
