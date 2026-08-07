"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { startCheckout } from "@/lib/checkout-client";

// The single place a promote purchase is triggered — on the /promote paywall,
// not in a popup. If a direct Dodo payment link is configured it just links
// there; otherwise it starts a hosted checkout via our API.
export function PayButton({
  slotId,
  directLink,
  label = "Pay $19 — go live →",
}: {
  slotId: string | null;
  directLink?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  if (directLink) {
    return (
      <a
        href={directLink}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-7 text-[15px] font-semibold text-white shadow-glow transition hover:brightness-105"
      >
        {label} <ArrowRight size={17} />
      </a>
    );
  }

  if (!slotId) {
    return (
      <button
        disabled
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-ink-800 px-7 text-[15px] font-semibold text-bone-400"
      >
        All 6 slots are booked — check back soon
      </button>
    );
  }

  async function buy() {
    setLoading(true);
    const ok = await startCheckout("ad_slot", slotId as string);
    if (!ok) setLoading(false);
  }

  return (
    <button
      onClick={buy}
      disabled={loading}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-7 text-[15px] font-semibold text-white shadow-glow transition hover:brightness-105 disabled:opacity-60"
    >
      {loading ? <Loader2 className="animate-spin" size={18} /> : <>{label} <ArrowRight size={17} /></>}
    </button>
  );
}
