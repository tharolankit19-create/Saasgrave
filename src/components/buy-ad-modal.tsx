"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Plus, Loader2, ShieldCheck, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui";
import { startCheckout } from "@/lib/checkout-client";

// The $9 ad-slot purchase popup — premium and aggressive: launch discount,
// live-traffic FOMO, scarcity, and one confident CTA.
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
        <button className="group flex h-full w-full flex-col items-center justify-center rounded-2xl border border-dashed border-accent-500/40 bg-accent-600/[0.06] p-5 text-center transition hover:border-accent-500/70 hover:bg-accent-600/[0.1] hover:shadow-card">
          <span className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow transition group-hover:scale-105">
            <Plus size={16} />
          </span>
          <span className="text-xs font-bold text-bone-100">Put your product here</span>
          <span className="mt-0.5 text-[11px] font-semibold text-accent-600">
            <span className="text-bone-500 line-through">$49</span> $9 / 30 days
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="shine-border fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-black/10 bg-ink-900 shadow-lift focus:outline-none data-[state=open]:animate-fade-up">
          {/* header band */}
          <div className="relative overflow-hidden border-b border-black/8 bg-gradient-to-b from-accent-600/[0.1] to-transparent px-7 pb-6 pt-7">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent-500/20 blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-glow">
                  <Flame size={11} /> 82% off · launch price
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-moss-500/30 bg-moss-500/10 px-2.5 py-1 text-[11px] font-semibold text-moss-500">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss-500" />
                  </span>
                  1,500+ buyers this week
                </span>
              </div>
              <Dialog.Title className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-bone-100">
                Get in front of every buyer.
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-relaxed text-bone-400">
                Slot <span className="font-medium text-bone-200">{position}</span> shows beside every
                listing on the graveyard — the exact moment operators, acquirers and indie hackers are
                shopping for tools, code and deals.
              </Dialog.Description>
            </div>
          </div>

          <div className="px-7 py-6">
            <ul className="space-y-2.5">
              {[
                "Beside every listing — where buyers already are",
                "Real intent traffic, not random impressions",
                "Swap your creative anytime during the run",
                "Only 6 slots exist. Ever. No auctions, no CPC.",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm text-bone-300">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent-500/15 text-accent-600">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-end justify-between rounded-2xl border border-accent-500/25 bg-accent-600/[0.06] p-4">
              <div>
                <div className="text-xs text-bone-400">
                  <span className="line-through">$49 / mo</span> · launch discount
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-bone-100">$9</span>
                  <span className="text-xs text-bone-400">/ 30 days</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-glow">
                <Zap size={11} /> Best value
              </span>
            </div>

            <Button size="lg" className="mt-5 w-full" onClick={buy} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Claim this slot for $9 →"}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-bone-400">
              <ShieldCheck size={13} className="text-moss-500" /> Secure checkout · add your creative right after
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
