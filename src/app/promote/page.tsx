import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Check, Flame, ShieldCheck, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Eyebrow } from "@/components/ui";
import { PayButton } from "@/components/pay-button";
import { ProductIcon } from "@/components/product-icon";
import {
  PRODUCTS,
  PRODUCT_ORDER,
  PLACEMENT_ORDER,
  BUNDLE_LIST_PRICE,
  BUNDLE_SAVING,
  type Placement,
  type ProductKey,
} from "@/lib/ad-pricing";

export const metadata: Metadata = {
  title: "Promote your product",
  description:
    "Featured Launch $9, sidebar slots $19, sponsored rows $29, newsletter mentions $49, a 100+ directory blast for $99 — or everything bundled. All with dofollow backlinks.",
};
export const dynamic = "force-dynamic";

/** Which checkout kind each product uses. */
const KIND: Record<ProductKey, "ad_slot" | "featured" | "directory" | "bundle"> = {
  featured: "featured",
  sidebar: "ad_slot",
  sponsored: "ad_slot",
  newsletter: "ad_slot",
  directory: "directory",
  bundle: "bundle",
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
      const rows = (data || []).filter((s) => (s.placement || "sidebar") === p);
      const free = rows.filter((s) => !s.buyer_id && !(s.active && s.headline));
      open[p] = { id: free[0]?.id ?? null, left: free.length };
    }
  } catch {
    /* buttons degrade to "sold out" */
  }

  // Startup-level products (featured / directory / bundle) attach to a listing.
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
    /* handled in the cards below */
  }

  const directLink = process.env.NEXT_PUBLIC_DODO_AD_LINK?.trim() || undefined;
  const needsStartup = (k: ProductKey) => KIND[k] !== "ad_slot";

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Eyebrow>Promote</Eyebrow>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-bone-100 sm:text-5xl">
          Get in front of every buyer.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-bone-400">
          Flat price, 30 days, no auctions or CPC. Add your logo, headline and link the moment
          you&apos;ve paid — nothing waits on approval.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-moss-500/30 bg-moss-500/10 px-3 py-1 text-xs font-semibold text-moss-500">
            <Link2 size={12} /> Every placement includes a dofollow backlink
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-ink-900 px-3 py-1 text-xs text-bone-400">
            <ShieldCheck size={12} className="text-moss-500" /> Secure checkout via Dodo
          </span>
        </div>
        <Link href="/pricing" className="mt-4 inline-block text-sm text-accent-600 hover:underline">
          See what each one does →
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {PRODUCT_ORDER.map((key) => {
          const spec = PRODUCTS[key];
          const kind = KIND[key];
          const slot = kind === "ad_slot" ? open[key as Placement] : undefined;

          // What we can actually sell right now.
          const refId = needsStartup(key)
            ? key === "featured" && featuredAlready
              ? null
              : myStartup?.id ?? null
            : slot?.id ?? null;
          const left = kind === "ad_slot" ? (slot?.left ?? 0) : spec.slots == null ? null : 1;
          const isBundle = key === "bundle";

          return (
            <Card
              key={key}
              className={`relative flex flex-col p-6 ${
                isBundle ? "shine-border border-accent-500/40 shadow-lift lg:col-span-3" : ""
              }`}
            >
              {isBundle && (
                <span className="absolute -top-2.5 left-6 z-[3] rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                  Save ${BUNDLE_SAVING}
                </span>
              )}

              <div className={isBundle ? "grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center" : ""}>
                <div>
                  <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-accent-400">
                    <ProductIcon product={key} size={18} />
                  </span>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-bone-100">${spec.dollars}</span>
                    {isBundle && (
                      <span className="text-sm text-bone-500 line-through">${BUNDLE_LIST_PRICE}</span>
                    )}
                    <span className="text-xs text-bone-500">
                      {key === "directory" ? "one-off" : "/ 30 days"}
                    </span>
                  </div>
                  <h2 className="mt-2.5 font-semibold text-bone-100">{spec.name}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-bone-500">{spec.tagline}</p>

                  <ul className={`mt-4 space-y-2 ${isBundle ? "sm:columns-2" : "flex-1"}`}>
                    {spec.perks.map((perk) => (
                      <li
                        key={perk}
                        className="flex items-start gap-2 text-xs leading-relaxed text-bone-300"
                      >
                        <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-accent-500/15 text-accent-600">
                          <Check size={9} strokeWidth={3.5} />
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`mt-5 space-y-2.5 ${isBundle ? "lg:mt-0 lg:w-64" : ""}`}>
                  {needsStartup(key) && !myStartup ? (
                    <Link
                      href="/sell"
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-black/12 px-6 text-sm font-semibold text-bone-100 transition hover:border-black/25"
                    >
                      List a startup first →
                    </Link>
                  ) : (
                    <PayButton
                      kind={kind}
                      referenceId={refId}
                      directLink={key === "sidebar" ? directLink : undefined}
                      label={`Get it — $${spec.dollars}`}
                      soldOutLabel={
                        key === "featured" && featuredAlready
                          ? "Already featured"
                          : "Sold out — check back"
                      }
                      variant={isBundle ? "primary" : "outline"}
                    />
                  )}
                  <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-bone-500">
                    {left === null ? (
                      needsStartup(key) && myStartup ? (
                        `For ${myStartup.name}`
                      ) : (
                        "Always available"
                      )
                    ) : left > 0 ? (
                      <>
                        <Flame size={11} className="text-accent-600" />
                        {kind === "ad_slot"
                          ? `${left} of ${spec.slots} left`
                          : `Featuring ${myStartup?.name}`}
                      </>
                    ) : key === "featured" && featuredAlready ? (
                      "Running right now"
                    ) : (
                      "All taken for now"
                    )}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
