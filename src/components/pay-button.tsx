"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { startCheckout } from "@/lib/checkout-client";
import type { CheckoutKind } from "@/lib/dodo";

// The single place a promotion purchase is triggered — on the /promote paywall,
// not in a popup. If a direct Dodo payment link is configured it just links
// there; otherwise it starts a hosted checkout via our API.
export function PayButton({
  kind = "ad_slot",
  referenceId,
  directLink,
  label,
  soldOutLabel = "Sold out — check back soon",
  variant = "primary",
}: {
  kind?: CheckoutKind;
  referenceId: string | null;
  directLink?: string;
  label: string;
  soldOutLabel?: string;
  variant?: "primary" | "outline";
}) {
  const [loading, setLoading] = useState(false);

  const base =
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition disabled:opacity-60";
  const skin =
    variant === "primary"
      ? "bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow hover:brightness-105"
      : "border border-black/12 text-bone-100 hover:border-black/25";

  if (directLink) {
    return (
      <a href={directLink} className={`${base} ${skin}`}>
        {label} <ArrowRight size={16} />
      </a>
    );
  }

  if (!referenceId) {
    return (
      <button disabled className={`${base} bg-ink-800 text-bone-400`}>
        {soldOutLabel}
      </button>
    );
  }

  async function buy() {
    setLoading(true);
    const ok = await startCheckout(kind, referenceId as string);
    if (!ok) setLoading(false);
  }

  return (
    <button onClick={buy} disabled={loading} className={`${base} ${skin}`}>
      {loading ? (
        <Loader2 className="animate-spin" size={17} />
      ) : (
        <>
          {label} <ArrowRight size={16} />
        </>
      )}
    </button>
  );
}
