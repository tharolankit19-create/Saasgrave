"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Accept / reject buttons the seller sees on a pending offer.
export function OfferActions({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accepted" | "rejected" | null>(null);

  async function respond(action: "accepted" | "rejected") {
    setBusy(action);
    const res = await fetch("/api/offers/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, action }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) return toast.error(data.error || "Couldn't update the offer.");
    toast.success(action === "accepted" ? "Offer accepted 🎉" : "Offer declined.");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => respond("accepted")}
        disabled={!!busy}
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-moss-500 px-3.5 text-xs font-medium text-white transition hover:bg-moss-400 disabled:opacity-50"
      >
        {busy === "accepted" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Accept
      </button>
      <button
        onClick={() => respond("rejected")}
        disabled={!!busy}
        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/12 px-3.5 text-xs font-medium text-bone-400 transition hover:text-bone-100 disabled:opacity-50"
      >
        {busy === "rejected" ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />} Decline
      </button>
    </div>
  );
}
