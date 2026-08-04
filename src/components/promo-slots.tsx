import Link from "next/link";
import { Megaphone, ArrowRight, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Eyebrow } from "@/components/ui";

// The premium-placement pitch, learned from how canivibecodeit sells its
// sponsor rail: a fixed number of slots, always visible, scarcity stated in
// plain numbers, one confident CTA. Listing stays free — this and the $9 sale
// upgrade are the only things anyone ever pays for. Real slot counts, no fakes.
export async function PromoSlots() {
  let open = 6;
  let total = 6;
  try {
    const supabase = createClient();
    const { data } = await supabase.from("ad_slots").select("active, headline");
    if (data && data.length) {
      total = data.length;
      open = data.filter((s) => !(s.active && s.headline)).length;
    }
  } catch {
    // fall back to the seeded 6 open slots
  }

  const taken = total - open;

  return (
    <section className="mx-auto max-w-5xl px-5 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-accent-500/25 bg-gradient-to-b from-ink-850 to-ink-900 p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-600/15 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center">
          <div>
            <Eyebrow>For sponsors</Eyebrow>
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-bone-100 sm:text-4xl">
              Reach founders the day they go hunting.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-bone-500">
              Six slots sit beside every listing on the graveyard — seen by operators, acquirers and
              indie hackers actively shopping for code, domains and deals. One flat price. No auction,
              no CPC, no bidding.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-600/15 px-3 py-1.5 text-xs font-medium text-accent-400">
                <Zap size={12} /> {open > 0 ? `${open} of ${total} slots open` : "All slots taken"}
              </span>
              <span className="text-xs text-bone-500">$49 / 30 days · swap creative anytime</span>
            </div>

            <Link
              href="/browse"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full bg-bone-100 px-7 text-[15px] font-medium text-ink-950 transition hover:bg-bone-300"
            >
              Claim a slot <ArrowRight size={16} />
            </Link>
          </div>

          {/* A miniature of the rail buyers will actually appear in. */}
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => {
              const isTaken = i < taken;
              return (
                <div
                  key={i}
                  className={`flex aspect-[3/4] flex-col justify-between rounded-xl border p-3 ${
                    isTaken
                      ? "border-black/8 bg-ink-800"
                      : "border-dashed border-accent-500/30 bg-accent-600/[0.04]"
                  }`}
                >
                  <span
                    className={`text-[9px] uppercase tracking-widest ${
                      isTaken ? "text-bone-500" : "text-accent-400"
                    }`}
                  >
                    {isTaken ? "Sponsored" : "Open"}
                  </span>
                  {isTaken ? (
                    <span className="space-y-1">
                      <span className="block h-1.5 w-3/4 rounded-full bg-black/15" />
                      <span className="block h-1.5 w-1/2 rounded-full bg-black/10" />
                    </span>
                  ) : (
                    <Megaphone size={16} className="text-accent-400/70" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
