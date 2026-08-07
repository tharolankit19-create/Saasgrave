"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Tag, Loader2, Rocket } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Dashboard row actions. A new listing starts as a draft; here the founder
// chooses what to do with it:
//   • Publish free    → goes live on the marketplace at no cost
//   • Open for sale   → free to open; we take just 3% only when it sells
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
  const [opening, setOpening] = useState(false);

  const isDraft = startup.status === "draft";
  const isListed = startup.status === "listed";
  const canSell = !startup.for_sale; // not open for sale yet

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

  // Opening for sale is free now — no upfront fee. We only take 3% on a sale.
  async function openForSale() {
    setOpening(true);
    const { error } = await supabase
      .from("startups")
      .update({ for_sale: true, status: "listed" })
      .eq("id", startup.id);
    setOpening(false);
    if (error) return toast.error(error.message);
    toast.success("Open for sale — buyers can make offers now.");
    router.refresh();
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
      {isDraft && (
        <button
          onClick={publishFree}
          disabled={publishing}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bone-100 px-4 text-sm font-medium text-ink-950 transition hover:bg-bone-300 disabled:opacity-50"
        >
          {publishing ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
          Publish free
        </button>
      )}

      {canSell && (
        <button
          onClick={openForSale}
          disabled={opening}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-accent-500/40 bg-accent-600/10 px-4 text-sm font-medium text-accent-600 transition hover:bg-accent-600/20 disabled:opacity-50"
        >
          {opening ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
          Open for sale · free
        </button>
      )}

      {isListed && (
        <Link
          href={`/startup/${startup.slug}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/12 px-4 text-sm text-bone-300 transition hover:border-black/25"
        >
          <ExternalLink size={14} /> View
        </Link>
      )}
    </div>
  );
}
