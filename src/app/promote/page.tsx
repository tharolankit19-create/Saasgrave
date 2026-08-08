import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, Flame, ShieldCheck, Link2, Sparkles, Megaphone, Rows3, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Eyebrow } from "@/components/ui";
import { PayButton } from "@/components/pay-button";
import { PLACEMENTS, PLACEMENT_ORDER, type Placement } from "@/lib/ad-pricing";

export const metadata: Metadata = {
  title: "Promote your product",
  description:
    "Get in front of founders and buyers browsing the graveyard. Featured Launch from $9, sidebar slots $19, sponsored rows $29, newsletter mentions $49 — every one with a dofollow backlink.",
};
export const dynamic = "force-dynamic";

const ICONS: Record<Placement, JSX.Element> = {
  featured: <Sparkles size={18} />,
  sidebar: <Megaphone size={18} />,
  sponsored: <Rows3 size={18} />,
  newsletter: <Mail size={18} />,
};

export default async function PromotePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/promote");

  // The first open slot of each placement, plus how many are left.
  const open: Partial<Record<Placement, { id: string | null; left: number }>> = {};
  try {
    const { data } = await supabase
      .from("ad_slots")
      .select("id, placement, active, headline, buyer_id")
      .order("position");
    for (const p of PLACEMENT_ORDER) {
      if (p === "featured") continue; // featured attaches to a startup, not a slot
      const rows = (data || []).filter((s) => (s.placement || "sidebar") === p);
      const free = rows.filter((s) => !s.buyer_id && !(s.active && s.headline));
      open[p] = { id: free[0]?.id ?? null, left: free.length };
    }
  } catch {
    /* buttons degrade to "sold out" */
  }

  // Featured Launch applies to one of the founder's own listings.
  let myStartup: { id: string; name: string } | null = null;
  let featuredAlready = false;
  try {
    const { data } = await supabase
      .from("startups")
      .select("id, name, featured, featured_until")
      .eq("founder_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);
    const s = data?.[0];
    if (s) {
      myStartup = { id: s.id, name: s.name };
      featuredAlready =
        !!s.featured && (!s.featured_until || new Date(s.featured_until) > new Date());
    }
  } catch {
    /* handled in the card below */
  }

  const directLink = process.env.NEXT_PUBLIC_DODO_AD_LINK?.trim() || undefined;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Eyebrow>Promote</Eyebrow>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-bone-100 sm:text-5xl">
          Get in front of every buyer.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-bone-400">
          Founders, operators and acquirers come here shopping for products, code and deals. Put
          yours where they&apos;re already looking — flat price, 30 days, no auctions or CPC.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-moss-500/30 bg-moss-500/10 px-3 py-1 text-xs font-semibold text-moss-500">
            <Link2 size={12} /> Every placement includes a dofollow backlink
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-ink-900 px-3 py-1 text-xs text-bone-400">
            <ShieldCheck size={12} className="text-moss-500" /> Secure checkout via Dodo
          </span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PLACEMENT_ORDER.map((key) => {
          const spec = PLACEMENTS[key];
          const isFeatured = key === "featured";
          const slot = open[key];
          const left = isFeatured ? (myStartup && !featuredAlready ? 1 : 0) : (slot?.left ?? 0);
          const refId = isFeatured ? (featuredAlready ? null : myStartup?.id ?? null) : slot?.id ?? null;
          const highlight = key === "sidebar";

          return (
            <Card
              key={key}
              className={`relative flex flex-col p-6 ${highlight ? "shine-border border-accent-500/40 shadow-lift" : ""}`}
            >
              {highlight && (
                <span className="absolute -top-2.5 left-6 z-[3] rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                  Most popular
                </span>
              )}

              <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-accent-400">
                {ICONS[key]}
              </span>

              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-bone-100">${spec.dollars}</span>
                <span className="text-xs text-bone-500">/ 30 days</span>
              </div>
              <h2 className="mt-2.5 font-semibold text-bone-100">{spec.name}</h2>
              <p className="mt-1 text-sm leading-relaxed text-bone-500">{spec.tagline}</p>

              <ul className="mt-4 flex-1 space-y-2">
                {spec.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-xs leading-relaxed text-bone-300">
                    <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-accent-500/15 text-accent-600">
                      <Check size={9} strokeWidth={3.5} />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              <div className="mt-5 space-y-2.5">
                {isFeatured && !myStartup ? (
                  <Link
                    href="/sell"
                    className="inline-flex h-11 w-full items-center justify-center rounded-full border border-black/12 px-6 text-sm font-semibold text-bone-100 transition hover:border-black/25"
                  >
                    List a startup first →
                  </Link>
                ) : (
                  <PayButton
                    kind={isFeatured ? "featured" : "ad_slot"}
                    referenceId={refId}
                    directLink={key === "sidebar" ? directLink : undefined}
                    label={`Get it — $${spec.dollars}`}
                    soldOutLabel={
                      isFeatured && featuredAlready ? "Already featured" : "Sold out — check back"
                    }
                    variant={highlight ? "primary" : "outline"}
                  />
                )}
                <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-bone-500">
                  {left > 0 ? (
                    <>
                      <Flame size={11} className="text-accent-600" />
                      {isFeatured
                        ? `Featuring ${myStartup?.name}`
                        : `${left} of ${spec.slots} left`}
                    </>
                  ) : isFeatured && featuredAlready ? (
                    "Running right now"
                  ) : (
                    "All taken for now"
                  )}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-bone-500">
        Add your logo, headline and link the moment you&apos;ve paid — no waiting on approval. Every
        placement runs for 30 days and carries a dofollow link back to your site.
      </p>
    </div>
  );
}
