"use client";

import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Loader2, Tag, ShieldCheck } from "lucide-react";
import { startCheckout } from "@/lib/checkout-client";
import { SALE_LISTING } from "@/lib/ad-pricing";

// The paywall for opening a listing for sale. Wrap any trigger in it:
//   <SellPaywallModal startupId={id} name={name}><button>…</button></SellPaywallModal>
//
// It sells the outcome before it asks for the money — what the fee actually
// buys, and the fact that we take nothing else until the startup sells.
export function SellPaywallModal({
  startupId,
  name,
  children,
}: {
  startupId: string;
  name?: string | null;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    const ok = await startCheckout("sale_listing", startupId);
    if (!ok) setLoading(false); // startCheckout already surfaced the error
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-black/10 bg-ink-900 p-7 shadow-2xl focus:outline-none">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow">
              <Tag size={18} />
            </span>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600">
                Open for sale
              </p>
              <Dialog.Title className="text-lg font-bold tracking-tight text-bone-100">
                Put {name ? `${name}` : "your startup"} on the market
              </Dialog.Title>
            </div>
          </div>

          <Dialog.Description className="text-sm text-bone-400">
            A one-off ${SALE_LISTING.dollars} unlocks the buyer side of Saasgrave for this listing.
            No subscription, and nothing else until it actually sells.
          </Dialog.Description>

          <ul className="my-5 space-y-2.5">
            {[
              "Listed on the For Sale board, where buyers actually look",
              "A “For sale” badge everywhere your startup appears",
              "Buyers can make offers on it directly",
              "Name your price, or open it to offers",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-bone-300">
                <Check size={16} className="mt-0.5 shrink-0 text-moss-500" />
                {line}
              </li>
            ))}
          </ul>

          <div className="mb-5 flex items-end justify-between rounded-xl border border-black/8 bg-ink-850 p-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-bone-400">
                One-off fee
              </div>
              <div className="text-3xl font-bold tracking-tight text-bone-100">
                ${SALE_LISTING.dollars}
              </div>
            </div>
            <span className="text-right text-xs text-bone-400">
              then just 3%
              <br />
              when it sells
            </span>
          </div>

          <button
            onClick={pay}
            disabled={loading}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 text-[15px] font-medium text-white shadow-glow transition-all duration-200 hover:brightness-[1.04] hover:shadow-lift active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>Pay ${SALE_LISTING.dollars} &amp; open for sale</>
            )}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-bone-400">
            <ShieldCheck size={13} /> Secure checkout via Dodo Payments
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
