"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, CreditCard, Loader2 } from "lucide-react";
import { startCheckout } from "@/lib/checkout-client";

// Row-level actions on the dashboard: view the public page, or pay the $9
// listing fee to publish a draft.
export function ListingRowActions({
  startup,
}: {
  startup: { id: string; slug: string; status: string; listing_paid: boolean };
}) {
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    const ok = await startCheckout("listing", startup.id);
    if (!ok) setLoading(false);
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {!startup.listing_paid && startup.status === "draft" && (
        <button
          onClick={pay}
          disabled={loading}
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-bone-100 px-4 text-sm font-medium text-ink-950 transition hover:bg-white disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
          Publish · $9
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
