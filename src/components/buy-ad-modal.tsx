"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Plus, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui";
import { startCheckout } from "@/lib/checkout-client";

// The $49 ad-slot purchase popup. Deliberately written to *sell the slot* —
// scarcity, concrete value, and a single confident CTA.
export function BuyAdModal({ slotId, position }: { slotId: string; position: string }) {
  const [loading, setLoading] = useState(false);

  async function buy() {
    setLoading(true);
    const ok = await startCheckout("ad_slot", slotId);
    if (!ok) setLoading(false);
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="group flex h-full w-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/12 bg-ink-900/40 p-5 text-center transition hover:border-ember-500/40 hover:bg-ink-900">
          <span className="mb-2 grid h-8 w-8 place-items-center rounded-full border border-white/12 text-bone-500 transition group-hover:text-ember-400">
            <Plus size={16} />
          </span>
          <span className="text-xs font-medium text-bone-300">Your ad here</span>
          <span className="mt-0.5 text-xs text-bone-500">$49 / 30 days</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-ink-850 p-7 shadow-2xl focus:outline-none">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-ember-600/15 px-2.5 py-1 text-xs font-medium text-ember-400">
            <TrendingUp size={12} /> Only 6 slots exist. Ever.
          </div>
          <Dialog.Title className="mt-3 font-serif text-2xl text-bone-100">
            Put your product in front of founders
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-bone-500">
            Slot <span className="text-bone-300">{position}</span> sits beside every listing on the
            graveyard — seen by founders actively hunting for tools, code, and deals.
          </Dialog.Description>

          <ul className="my-6 space-y-2.5">
            {[
              "30 days of premium placement — not an auction, a fixed price",
              "Reaches buyers with intent: acquirers, indie hackers, operators",
              "Swap your creative anytime during the run",
              "One flat fee. No CPC, no bidding, no surprises.",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-bone-300">
                <Check size={16} className="mt-0.5 shrink-0 text-moss-400" />
                {line}
              </li>
            ))}
          </ul>

          <div className="mb-5 flex items-end justify-between rounded-xl border border-white/8 bg-ink-900 p-4">
            <div>
              <div className="text-xs text-bone-500 line-through">$149 / month elsewhere</div>
              <div className="font-serif text-3xl text-bone-100">$49</div>
            </div>
            <span className="text-xs text-bone-500">for 30 days</span>
          </div>

          <Button size="lg" className="w-full" onClick={buy} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Claim this slot →"}
          </Button>
          <p className="mt-3 text-center text-xs text-bone-500">
            Secure checkout via Dodo Payments. Cancel anytime before it goes live.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
