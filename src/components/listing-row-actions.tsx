"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, CreditCard, Loader2 } from "lucide-react";
import { startCheckout } from "@/lib/checkout-client";

// Row-level actions on the dashboard. Listing a startup is free (it goes live
// on creation), so the only paid action here is the $9 fee to list a draft
// startup FOR SALE.
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
  const [loading, setLoading] = useState(false);
  const needsSaleFee = startup.status === "draft" && startup.for_sale && !startup.sale_listing_paid;

  async function paySaleFee() {
    setLoading(true);
    const ok = await startCheckout("sale_listing", startup.id);
    if (!ok) setLoading(false);
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {needsSaleFee && (
        <button
          onClick={paySaleFee}
          disabled={loading}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bone-100 px-4 text-sm font-medium text-ink-950 transition hover:bg-white disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
          List for sale · $9
        </button>
      )}
      {startup.status === "listed" && (
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
