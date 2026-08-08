import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Link2,
  Store,
  Rocket,
  ShieldCheck,
  Share2,
  Flame,
} from "lucide-react";
import { Card, Eyebrow, LinkButton } from "@/components/ui";
import { ProductIcon } from "@/components/product-icon";
import { createClient } from "@/lib/supabase/server";
import {
  PRODUCTS,
  BUNDLE_INCLUDES,
  BUNDLE_LIST_PRICE,
  BUNDLE_SAVING,
  PLACEMENT_ORDER,
  type Placement,
  type ProductKey,
} from "@/lib/ad-pricing";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Listing is free forever and selling costs 3% only when it sells. Promotion is flat-priced: Featured Launch $9, sidebar slot $19, sponsored row $29, newsletter mention $49, a 100+ directory blast $99 — or everything bundled for $149.",
  alternates: { canonical: `${SITE}/pricing` },
  openGraph: {
    title: "Pricing — free to list, flat prices to go further",
    description:
      "Free to list and sell (3% on a sale). Promotion from $9, all with dofollow backlinks.",
  },
};
export const dynamic = "force-dynamic";

export default async function PricingPage() {
  // Real scarcity — how many of each placement are still open.
  const left: Partial<Record<Placement, number>> = {};
  try {
    const supabase = createClient();
    const { data } = await supabase.from("ad_slots").select("placement, active, headline, buyer_id");
    for (const p of PLACEMENT_ORDER) {
      left[p] = (data || []).filter(
        (s) => (s.placement || "sidebar") === p && !s.buyer_id && !(s.active && s.headline)
      ).length;
    }
  } catch {
    /* scarcity line is simply omitted */
  }

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="grave-grid pointer-events-none absolute inset-0 opacity-[0.22]" />
        <div className="relative mx-auto max-w-3xl px-5 pb-14 pt-20 text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-bone-100 sm:text-6xl">
            Free to list.
            <br className="hidden sm:block" /> Pay only to{" "}
            <span className="text-accent-500 underline decoration-accent-500/40 decoration-4 underline-offset-[8px]">
              go further
            </span>
            .
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-bone-400 sm:text-lg">
            No subscriptions, no auctions, no CPC. Listing a dead startup costs nothing and always
            will — everything below is optional.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-moss-500/30 bg-moss-500/10 px-3 py-1 text-xs font-semibold text-moss-500">
              <Link2 size={12} /> Every plan includes a dofollow backlink
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-ink-900 px-3 py-1 text-xs text-bone-400">
              <ShieldCheck size={12} className="text-moss-500" /> Secure checkout via Dodo
            </span>
          </div>
        </div>
      </section>

      {/* ── 1 · Free forever ────────────────────────────── */}
      <Section
        eyebrow="The free part"
        title="Listing and selling cost nothing"
        sub="We only make money when you do — a flat 3% when a startup actually sells."
      >
        <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
          <Card className="flex flex-col p-7">
            <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-accent-400">
              <Store size={18} />
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-3xl text-bone-100">Free</span>
              <span className="text-xs text-bone-500">forever</span>
            </div>
            <h3 className="mt-3 font-medium text-bone-100">List</h3>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-bone-500">
              A public post-mortem page, an AI write-up for search, and a dofollow backlink to your
              site. Live immediately, no card.
            </p>
            <LinkButton href="/sell" variant="outline" size="md" className="mt-6 w-full">
              List my startup
            </LinkButton>
          </Card>

          <Card className="shine-border relative flex flex-col border-accent-500/40 p-7 shadow-lift">
            <span className="absolute -top-2.5 left-7 z-[3] rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
              Most popular
            </span>
            <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-accent-400">
              <Rocket size={18} />
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-3xl text-bone-100">3%</span>
              <span className="text-xs text-bone-500">only when it sells</span>
            </div>
            <h3 className="mt-3 font-medium text-bone-100">Sell</h3>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-bone-500">
              Open it to buyers, take offers, keep 97%. No upfront fee, no subscription, no listing
              charge. Typical marketplaces take up to ~15%.
            </p>
            <LinkButton href="/sell" size="md" className="mt-6 w-full">
              Open it for sale — free
            </LinkButton>
          </Card>
        </div>
      </Section>

      {/* ── 2 · On-site placements ──────────────────────── */}
      <Section
        eyebrow="Get seen on the site"
        title="Placements on Saasgrave"
        sub="Buyers, operators and indie hackers browse here looking for products to acquire. Put yours in their path."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {(["featured", "sidebar", "sponsored"] as ProductKey[]).map((key) => (
            <ProductCard key={key} product={key} left={left[key as Placement]} />
          ))}
        </div>
      </Section>

      {/* ── 3 · Newsletter ──────────────────────────────── */}
      <Section
        eyebrow="Land in inboxes"
        title="The Weekly Obituary"
        sub="Site traffic is one thing — an inbox is another. A dedicated block in the weekly email, sent to every subscriber."
      >
        <div className="mx-auto max-w-3xl">
          <ProductCard product="newsletter" left={left.newsletter} wide />
        </div>
      </Section>

      {/* ── 4 · Directory blast ─────────────────────────── */}
      <Section
        eyebrow="Build backlinks"
        title="Directory Blast — 100+ submissions"
        sub="The unglamorous SEO work nobody wants to do. We submit your product by hand to more than a hundred startup and SaaS directories."
      >
        <div className="mx-auto max-w-3xl">
          <ProductCard product="directory" wide />
        </div>
      </Section>

      {/* ── 5 · Bundle ──────────────────────────────────── */}
      <Section
        eyebrow="Everything at once"
        title={`Take the lot and save $${BUNDLE_SAVING}`}
        sub={`Every placement we sell, plus the directory blast. Bought separately it comes to $${BUNDLE_LIST_PRICE}.`}
      >
        <Card className="shine-border relative mx-auto max-w-4xl border-accent-500/40 p-8 shadow-lift sm:p-10">
          <span className="absolute -top-3 left-8 z-[3] rounded-full bg-accent-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm">
            Save ${BUNDLE_SAVING} · best value
          </span>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow">
                <ProductIcon product="bundle" size={20} />
              </span>
              <h3 className="text-2xl font-bold text-bone-100">{PRODUCTS.bundle.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-bone-500">
                {PRODUCTS.bundle.tagline}
              </p>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {BUNDLE_INCLUDES.map((k) => (
                  <li key={k} className="flex items-center gap-2.5 text-sm text-bone-300">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-black/10 text-accent-500">
                      <ProductIcon product={k} size={13} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{PRODUCTS[k].name}</span>
                      <span className="block font-mono text-[10px] text-bone-500">
                        ${PRODUCTS[k].dollars} on its own
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="shrink-0 rounded-2xl border border-black/8 bg-ink-950 p-6 text-center lg:w-64">
              <div className="font-mono text-xs uppercase tracking-wider text-bone-500 line-through">
                ${BUNDLE_LIST_PRICE}
              </div>
              <div className="mt-1 text-5xl font-bold tracking-tight text-bone-100">
                ${PRODUCTS.bundle.dollars}
              </div>
              <div className="mt-1 text-xs text-bone-500">one payment · 30-day run</div>
              <LinkButton href="/promote" size="lg" className="mt-5 w-full">
                Get the bundle <ArrowRight size={16} />
              </LinkButton>
              <p className="mt-2.5 text-[11px] text-bone-500">
                Dofollow backlinks from every placement
              </p>
            </div>
          </div>
        </Card>
      </Section>

      {/* ── 6 · Free extra: share to earn a second link ── */}
      <Section
        eyebrow="Free extra"
        title="Share your launch, earn a second backlink"
        sub="Post your listing on X or LinkedIn, send us the link, and we add a second dofollow link on the launch wall. It costs nothing."
      >
        <Card className="mx-auto flex max-w-3xl flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-moss-500/30 bg-moss-500/10 text-moss-400">
            <Share2 size={24} />
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-bone-100">
              One post, one extra dofollow link
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-bone-500">
              After your listing goes live we hand you a post that&apos;s actually worth publishing.
              Share it, paste the link back, and your startup joins the launch wall with a second
              dofollow link to your site.
            </p>
          </div>
          <LinkButton href="/sell" variant="outline" size="md" className="shrink-0">
            List & share
          </LinkButton>
        </Card>
      </Section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <div className="mb-10 text-center">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100">Good to know</h2>
        </div>
        <div className="divide-y divide-black/8 rounded-2xl border border-black/8">
          {[
            {
              q: "Is listing really free?",
              a: "Yes — free forever, and opening a listing for sale is free too. We take a flat 3% only when your startup actually sells. Everything on this page is optional.",
            },
            {
              q: "Do all the paid plans include a backlink?",
              a: "Yes, and so does the free listing. Every placement carries a dofollow link to your site. Featured Launch also gives you an embeddable “Featured on Saasgrave” badge, and sharing your launch earns a second dofollow link for free.",
            },
            {
              q: "What exactly is the Directory Blast?",
              a: "We submit your product by hand to more than a hundred startup and SaaS directories — the slow, boring backlink work. No bots and no spam, and you get a report of where it landed. Turnaround is within 7 days.",
            },
            {
              q: "How long does a placement run?",
              a: "30 days from the moment you pay. The Directory Blast is a one-off — the submissions stay up permanently.",
            },
            {
              q: "Can I change my ad after buying?",
              a: "Yes. You add your logo, name, headline and link straight after paying, and you can edit any of it from your dashboard at any time.",
            },
            {
              q: "What happens if a placement is sold out?",
              a: "Slot counts are hard caps — 6 sidebar slots, 2 sponsored rows, 4 newsletter mentions, 3 featured spots. When they're gone you have to wait for one to expire. Join the newsletter and we'll tell you the moment one frees up.",
            },
          ].map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-bone-100">
                {item.q}
                <span className="text-bone-500 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2.5 text-sm leading-relaxed text-bone-500">{item.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center">
          <LinkButton href="/promote" size="lg">
            Promote my product <ArrowRight size={17} />
          </LinkButton>
          <p className="mt-3 text-xs text-bone-500">Or just list it — free, in 3 minutes.</p>
        </div>
      </section>
    </div>
  );
}

/** Consistent section wrapper so each price band reads the same way. */
function Section({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className="mb-9 text-center">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="text-3xl font-bold tracking-tight text-bone-100 sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-bone-500">{sub}</p>
      </div>
      {children}
    </section>
  );
}

/** One purchasable product, priced and linked through to checkout. */
function ProductCard({
  product,
  left,
  wide = false,
}: {
  product: ProductKey;
  left?: number;
  wide?: boolean;
}) {
  const spec = PRODUCTS[product];
  const soldOut = left === 0;

  return (
    <Card className={`flex flex-col p-6 ${wide ? "sm:flex-row sm:items-center sm:gap-8" : ""}`}>
      <div className={wide ? "flex-1" : ""}>
        <div className="flex items-center justify-between">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-accent-400">
            <ProductIcon product={product} size={18} />
          </span>
          {spec.slots != null && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-bone-500">
              {spec.slots} slot{spec.slots > 1 ? "s" : ""} total
            </span>
          )}
        </div>

        <div className="mt-4 flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-bone-100">${spec.dollars}</span>
          <span className="text-xs text-bone-500">
            {product === "directory" ? "one-off" : "/ 30 days"}
          </span>
        </div>
        <h3 className="mt-2 font-semibold text-bone-100">{spec.name}</h3>
        <p className="mt-1 text-sm leading-relaxed text-bone-500">{spec.tagline}</p>

        <ul className={`mt-4 space-y-2 ${wide ? "sm:columns-2" : "flex-1"}`}>
          {spec.perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-xs leading-relaxed text-bone-300">
              <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-accent-500/15 text-accent-600">
                <Check size={9} strokeWidth={3.5} />
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className={`mt-5 space-y-2 ${wide ? "sm:mt-0 sm:w-52 sm:shrink-0" : ""}`}>
        <LinkButton href="/promote" variant="outline" size="md" className="w-full">
          {soldOut ? "Join the waitlist" : `Get it — $${spec.dollars}`}
        </LinkButton>
        {left != null && (
          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-bone-500">
            {left > 0 ? (
              <>
                <Flame size={11} className="text-accent-600" /> {left} of {spec.slots} still open
              </>
            ) : (
              "All taken right now"
            )}
          </p>
        )}
      </div>
    </Card>
  );
}
