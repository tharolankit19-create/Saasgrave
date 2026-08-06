"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Plus, Loader2, Megaphone, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { startCheckout } from "@/lib/checkout-client";

// The $49 ad-slot purchase popup — premium and built to *sell the slot*:
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
        <button className="group flex h-full w-full flex-col items-center justify-center rounded-2xl border border-dashed border-accent-500/30 bg-accent-600/[0.04] p-5 text-center shadow-sm transition hover:border-accent-500/50 hover:bg-accent-600/[0.07] hover:shadow-card">
          <span className="mb-2 grid h-9 w-9 place-items-center rounded-full border border-accent-500/30 bg-ink-900 text-accent-500 shadow-sm transition group-hover:scale-105">
            <Plus size={16} />
          </span>
          <span className="text-xs font-semibold text-bone-100">Your ad here</span>
          <span className="mt-0.5 text-[11px] font-medium text-accent-600">$49 / 30 days</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="shine-border fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-black/10 bg-ink-900 shadow-lift focus:outline-none data-[state=open]:animate-fade-up">
          {/* header band */}
          <div className="relative overflow-hidden border-b border-black/8 bg-gradient-to-b from-accent-600/[0.08] to-transparent px-7 pb-6 pt-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-600/15 blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-600/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-600">
                <Sparkles size={11} /> Only 6 slots exist. Ever.
              </div>
              <Dialog.Title className="mt-3 font-serif text-[26px] leading-tight tracking-tight text-bone-100">
                Put your product in front of buyers
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-relaxed text-bone-400">
                Slot <span className="font-medium text-bone-200">{position}</span> sits beside every
                listing on the graveyard — seen by operators, acquirers and indie hackers actively
                hunting for tools, code and deals.
              </Dialog.Description>
            </div>
          </div>

          <div className="px-7 py-6">
            <ul className="space-y-2.5">
              {[
                "30 days of premium placement — fixed price, no auction",
                "Reaches buyers with real intent, not random traffic",
                "Swap your creative anytime during the run",
                "One flat fee. No CPC, no bidding, no surprises.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-bone-300">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-moss-500/15 text-moss-500">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-end justify-between rounded-2xl border border-accent-500/20 bg-accent-600/[0.05] p-4">
              <div>
                <div className="text-xs text-bone-400 line-through">$149 / mo elsewhere</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-serif text-4xl text-bone-100">$49</span>
                  <span className="text-xs text-bone-400">/ 30 days</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-2.5 py-1 text-[11px] font-semibold text-accent-600 shadow-sm">
                <Megaphone size={11} /> Best value
              </span>
            </div>

            <Button size="lg" className="mt-5 w-full" onClick={buy} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Claim this slot →"}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-bone-400">
              <ShieldCheck size={13} className="text-moss-500" /> Secure checkout via Dodo Payments
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
