import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Check, Flame, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { PayButton } from "@/components/pay-button";

export const metadata: Metadata = { title: "Promote your product — $9" };
export const dynamic = "force-dynamic";

export default async function PromotePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/promote");

  // First open slot (not active / no creative, not already owned by this user).
  let openSlotId: string | null = null;
  let openCount = 0;
  try {
    const { data } = await supabase.from("ad_slots").select("id, active, headline, buyer_id").order("position");
    const open = (data || []).filter((s) => !(s.active && s.headline) && s.buyer_id !== user.id);
    openCount = open.length;
    openSlotId = open[0]?.id ?? null;
  } catch {
    /* degrade to disabled button */
  }

  // Optional: a direct Dodo payment link (skips our API entirely).
  const directLink = process.env.NEXT_PUBLIC_DODO_AD_LINK?.trim() || undefined;

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <Card className="shine-border overflow-hidden">
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
                1,900+ buyers this week
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-bone-100">
              Get in front of every buyer.
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-bone-400">
              Your product shows beside every listing on the graveyard — the moment operators, acquirers
              and indie hackers are shopping for tools, code and deals.
            </p>
          </div>
        </div>

        <div className="px-7 py-6">
          <ul className="space-y-2.5">
            {[
              "Beside every listing — where buyers already are",
              "Real intent traffic, not random impressions",
              "Add your logo, headline and link right after paying",
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
            <span className="text-xs text-bone-500">
              {openCount > 0 ? `${openCount} of 6 slots open` : "All slots booked"}
            </span>
          </div>

          <div className="mt-5">
            <PayButton slotId={openSlotId} directLink={directLink} />
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-bone-400">
            <ShieldCheck size={13} className="text-moss-500" /> Secure checkout via Dodo · add your creative right after
          </p>
        </div>
      </Card>
    </div>
  );
}
