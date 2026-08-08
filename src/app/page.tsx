import Link from "next/link";
import {
  ArrowRight,
  Store,
  ShieldCheck,
  Tag,
  BookOpen,
  Code2,
  Globe,
  Users,
  Check,
  X,
  Flame,
  Skull,
  Heart,
  LineChart,
  Rocket,
  Sparkles,
  Link2,
} from "lucide-react";
import { LinkButton, Eyebrow, Card } from "@/components/ui";
import { PRODUCTS } from "@/lib/ad-pricing";
import { LedgerRow, SponsoredRow } from "@/components/ledger-row";
import { Reveal, Marquee } from "@/components/motion";
import { loadGraveyard } from "@/lib/stats";
import { loadSponsored } from "@/lib/sponsored";
import { getLiveStats } from "@/lib/live";
import { money } from "@/lib/utils";

function compact(n: number) {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ rows, stats }, sponsored, liveStats] = await Promise.all([
    loadGraveyard(200),
    loadSponsored(),
    getLiveStats(),
  ]);

  // Paid Featured Launches lead the ledger; everything else keeps its order.
  const live = (r: { featured: boolean | null; featured_until: string | null }) =>
    !!r.featured && (!r.featured_until || new Date(r.featured_until) > new Date());
  const ledger = [...rows.filter(live), ...rows.filter((r) => !live(r))].slice(0, 12);
  const featured = rows.filter(live).slice(0, 6);
  // Only ever shown when analytics is actually configured — never an invented number.
  const liveVisitors = liveStats.visitors7d;
  const maxViews = Math.max(1, ...ledger.map((s) => s.view_count ?? 0));
  const hasListings = rows.length > 0;

  // The moving tape under the hero. Real names when we have them; otherwise a
  // loop of what a dead startup leaves behind — concept words, never fake names.
  const marqueeItems = hasListings
    ? rows.slice(0, 22).map((s) => s.name)
    : ["Working code", "An aged domain", "Real users", "An email list", "A hard-won lesson", "A second life"];

  return (
    <div>
      {/* ─── 1 · Hero — one idea, sold from here alone ────── */}
      <section data-fomo="hero" className="relative overflow-hidden">
        <div className="grave-grid pointer-events-none absolute inset-0 opacity-[0.22]" />

        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-24 text-center sm:pt-28">
          <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-black/10 bg-ink-900 px-3.5 py-1.5 text-xs font-medium text-bone-300 shadow-card">
            {hasListings ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss-500" />
                </span>
                <span className="text-bone-100">{stats.founders}+ founders</span> joined ·{" "}
                <span className="text-bone-100">{stats.graves}</span> startups buried
              </>
            ) : (
              <>
                <Flame size={12} className="text-accent-500" />
                The resting place for dead &amp; zero-revenue startups
              </>
            )}
          </div>

          <h1 className="text-[2.7rem] font-bold leading-[0.98] tracking-tight text-bone-100 sm:text-[5rem]">
            Your dead startup
            <br className="hidden sm:block" /> is still worth{" "}
            <span className="text-accent-500 underline decoration-accent-500/40 decoration-4 underline-offset-[8px]">money</span>.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-bone-400">
            Nine out of ten startups die. I built one place for all of them — bury yours here with the
            story intact, or hand it to someone who&apos;ll bring it back.
          </p>

          {/* One clear next step — a single primary action, quiet secondary. */}
          <div className="mt-9 flex flex-col items-center justify-center gap-4">
            <LinkButton href="/sell" size="lg">
              List my dead startup — free <ArrowRight size={17} />
            </LinkButton>
            <Link href="/browse" className="text-sm font-medium text-accent-600 underline decoration-accent-600/30 underline-offset-4 transition hover:text-accent-500">
              or browse startups for sale →
            </Link>
          </div>

          {/* Friction-killers right under the CTA — the reasons to sign up now. */}
          <p className="mt-4 text-xs text-bone-500">
            Free forever · No card · Lists in 3 minutes
          </p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-bone-500">
            {hasListings ? (
              <>{stats.graves} buried · free to list · just 3% when it sells</>
            ) : (
              <>Free to list · free to sell · just 3% on a sale</>
            )}
          </p>
        </div>

        {/* Moving tape — the graveyard, drifting past. */}
        <div className="relative mx-auto max-w-6xl px-5 pb-16">
          <p className="mb-3 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-bone-500">
            {hasListings ? "Recently laid to rest" : "What every dead startup leaves behind"}
          </p>
          <Marquee items={marqueeItems} />
        </div>
      </section>

      {/* ─── 2 · Live proof, in real numbers ──────────────── */}
      {hasListings && (() => {
        // Only ever surface real, non-zero stats — no "0 up for sale" deadness.
        const pills: { key: string; icon: JSX.Element; value: string; label: string }[] = [
          { key: "graves", icon: <Skull size={16} />, value: String(stats.graves), label: "startups at rest" },
          { key: "founders", icon: <Users size={16} />, value: String(stats.founders), label: "founders joined" },
        ];
        if (stats.buriedMrr > 0) pills.push({ key: "mrr", icon: <ShieldCheck size={16} />, value: money(stats.buriedMrr), label: "verified revenue buried" });
        if (stats.users > 0) pills.push({ key: "users", icon: <Heart size={16} />, value: compact(stats.users), label: "users left behind" });
        if (stats.forSale > 0) pills.push({ key: "sale", icon: <Tag size={16} />, value: String(stats.forSale), label: "open to offers" });
        return (
          <section className="mx-auto max-w-5xl px-5 pb-24">
            <div className="flex flex-wrap justify-center gap-4">
              {pills.slice(0, 4).map((p) => (
                <div
                  key={p.key}
                  className="flex min-w-[190px] flex-1 items-center gap-4 rounded-2xl border border-black/8 bg-ink-900 p-5 shadow-card"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-500/10 text-accent-600">
                    {p.icon}
                  </span>
                  <div>
                    <div className="font-mono text-2xl font-bold leading-none tabular-nums text-bone-100">{p.value}</div>
                    <div className="mt-1.5 text-xs text-bone-500">{p.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-wider text-bone-500">
              Live from real listings — not one seeded or fake startup
            </p>
          </section>
        );
      })()}

      {/* ─── 3 · Empathy — name the pain before selling ───── */}
      <Reveal as="section" className="mx-auto max-w-3xl px-5 pb-24 text-center">
        <span className="mx-auto mb-6 grid h-12 w-12 animate-float place-items-center rounded-2xl border border-black/10 bg-ink-900 text-accent-500 shadow-card">
          <Heart size={22} />
        </span>
        <h2 className="font-serif text-3xl leading-snug tracking-tight text-bone-100 sm:text-[38px]">
          You didn&apos;t fail. You ran out of runway.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-bone-400 sm:text-lg">
          Most products don&apos;t die because the code was bad. They run out of time, money, or the
          right moment. Then the repo goes private, the domain lapses, the users scatter — and months
          of real work quietly disappear. That&apos;s the part that stings. Saasgrave is where it
          doesn&apos;t have to.
        </p>
      </Reveal>

      {/* ─── 4 · The Ledger — real listings as proof ──────── */}
      <section data-fomo="ledger" className="mx-auto max-w-4xl px-5 pb-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Eyebrow>Fresh graves</Eyebrow>
            <h2 className="font-serif text-3xl tracking-tight text-bone-100">The latest to rest</h2>
            <p className="mt-2 text-sm text-bone-500">Real founders, honest post-mortems — the record as it grows.</p>
          </div>
          <Link
            href="/browse"
            className="hidden shrink-0 text-sm text-bone-300 transition hover:text-accent-400 sm:block"
          >
            View all →
          </Link>
        </div>

        {hasListings ? (
          <div className="overflow-hidden rounded-2xl border border-black/8 bg-ink-900 shadow-card">
            <div className="hidden grid-cols-[2.25rem_1fr_7rem_8rem_auto] gap-4 border-b border-black/8 bg-ink-850/50 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-bone-400 sm:grid">
              <span>Rank</span>
              <span>Startup</span>
              <span>Status</span>
              <span className="text-right">MRR</span>
              <span className="text-right">Interest</span>
            </div>
            {ledger.map((s, i) => (
              <div key={s.slug}>
                <LedgerRow s={s} rank={i + 1} maxViews={maxViews} />
                {/* Sponsored placement sits right after the top grave (slot #2). */}
                {i === 0 && <SponsoredRow {...sponsored} />}
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-black/10 text-accent-400">
              <Store size={20} />
            </span>
            <h3 className="font-serif text-2xl text-bone-100">The ledger is empty — for now.</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-bone-500">
              No startup has been laid to rest here yet. Be the first — list yours and start the record.
            </p>
            <LinkButton href="/sell" size="lg" className="mt-6">
              List the first startup <ArrowRight size={16} />
            </LinkButton>
          </Card>
        )}
      </section>

      {/* ─── 5 · How it works — numbered stepper ──────────── */}
      <section data-fomo="how" className="mx-auto max-w-5xl px-5 pb-24">
        <div className="mb-14 text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="text-4xl font-bold tracking-tight text-bone-100 sm:text-5xl">
            Dead repo to done deal in 3 minutes.
          </h2>
        </div>
        <div className="relative grid gap-10 md:grid-cols-3">
          {/* connector line across the numbers on desktop */}
          <div className="pointer-events-none absolute left-[16.66%] right-[16.66%] top-6 hidden border-t border-dashed border-black/15 md:block" />
          {[
            {
              n: "01",
              icon: <BookOpen size={16} />,
              title: "Tell the story",
              body: "Name, logo, screenshots, real metrics, and an honest account of what actually went wrong. Detail is what makes buyers trust it.",
            },
            {
              n: "02",
              icon: <LineChart size={16} />,
              title: "Verify & publish",
              body: "Optionally connect a read-only revenue key to prove real MRR. Publishing is completely free — nothing goes live until you say so.",
            },
            {
              n: "03",
              icon: <Tag size={16} />,
              title: "Sell or keep the record",
              body: "Open it for sale for free, name your price, take offers — or leave it up purely as a public post-mortem.",
            },
          ].map((step) => (
            <div key={step.n} className="relative text-center">
              <span className="relative z-[1] mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-b from-accent-400 to-accent-500 font-mono text-sm font-bold text-white shadow-glow ring-4 ring-ink-950">
                {step.n}
              </span>
              <h3 className="mt-5 flex items-center justify-center gap-2 text-lg font-semibold text-bone-100">
                <span className="text-bone-400">{step.icon}</span> {step.title}
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-bone-500">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 6 · What you get — sell the outcome ──────────── */}
      <section data-fomo="value" className="mx-auto max-w-6xl px-5 pb-24">
        <div className="mb-10 text-center">
          <Eyebrow>What changes hands</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
            A dead startup is more than code
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: <Code2 size={18} />, title: "The codebase", body: "A working product someone already built and shipped." },
            { icon: <Globe size={18} />, title: "Domain & brand", body: "An aged domain, a name, and the design that came with it." },
            { icon: <Users size={18} />, title: "Users & data", body: "Existing signups, an email list, and early traction." },
            { icon: <BookOpen size={18} />, title: "The post-mortem", body: "Why it failed — the most valuable part for a buyer." },
          ].map((x) => (
            <Card key={x.title} className="p-6">
              <span className="mb-4 grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-accent-400">
                {x.icon}
              </span>
              <h3 className="mb-1.5 text-sm font-medium text-bone-100">{x.title}</h3>
              <p className="text-xs leading-relaxed text-bone-500">{x.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 9 · Comparison — why here, not elsewhere ─────── */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <div className="mb-10 text-center">
          <Eyebrow>Why Saasgrave</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
            The alternatives cost more and give less
          </h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-black/8">
          <div className="grid grid-cols-4 border-b border-black/8 bg-ink-900 text-[11px] font-medium uppercase tracking-[0.14em] text-bone-500 sm:text-xs">
            <span className="p-4" />
            <span className="border-l border-black/8 p-4 text-center text-accent-400">Saasgrave</span>
            <span className="border-l border-black/8 p-4 text-center">Delete the repo</span>
            <span className="border-l border-black/8 p-4 text-center">Typical marketplace</span>
          </div>
          {[
            { label: "Cost to list", a: "Free", b: "—", c: "Fees to start" },
            { label: "Zero-revenue welcome", a: true, b: false, c: false },
            { label: "Keeps the post-mortem", a: true, b: false, c: false },
            { label: "Commission on sale", a: "3%", b: "—", c: "Up to ~15%" },
            { label: "Stays as a public record", a: true, b: false, c: false },
          ].map((row) => (
            <div key={row.label} className="grid grid-cols-4 border-b border-black/[0.06] text-sm last:border-b-0">
              <span className="p-4 text-bone-300">{row.label}</span>
              <Cell v={row.a} accent />
              <Cell v={row.b} />
              <Cell v={row.c} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-bone-500">
          Marketplace fees vary by platform — the point is simple: here, listing is free and the sale is yours.
        </p>
      </section>

      {/* ─── 10 · Pricing teaser — the detail lives on /pricing ─ */}
      <section id="pricing" className="mx-auto max-w-5xl px-5 pb-24 scroll-mt-24">
        <div className="mb-9 text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-bone-100 sm:text-4xl">
            Free to list. Pay only to go further.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-bone-500">
            No subscriptions. Listing and opening for sale are free — we take just 3% when a startup
            actually sells.
          </p>
        </div>

        <div className="mx-auto grid max-w-3xl gap-5 md:grid-cols-2">
          {[
            {
              icon: <Store size={18} />,
              price: "Free",
              unit: "forever",
              title: "List",
              body: "A public post-mortem page with a dofollow backlink to your site and an AI write-up for search. Live immediately.",
              cta: "List my startup",
              href: "/sell",
              highlight: false,
            },
            {
              icon: <Rocket size={18} />,
              price: "3%",
              unit: "only when it sells",
              title: "Sell",
              body: "Open it to buyers, take offers, keep 97%. No upfront fee, no subscription. We earn only when you do.",
              cta: "Open it for sale — free",
              href: "/sell",
              highlight: true,
            },
          ].map((p) => (
            <Card
              key={p.title}
              className={`relative flex flex-col p-7 ${p.highlight ? "shine-border border-accent-500/40 shadow-lift" : ""}`}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-7 z-[3] rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                  Most popular
                </span>
              )}
              <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-accent-400">
                {p.icon}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-3xl text-bone-100">{p.price}</span>
                <span className="text-xs text-bone-500">{p.unit}</span>
              </div>
              <h3 className="mt-3 font-medium text-bone-100">{p.title}</h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-bone-500">{p.body}</p>
              <LinkButton
                href={p.href}
                variant={p.highlight ? "primary" : "outline"}
                size="md"
                className="mt-6 w-full"
              >
                {p.cta}
              </LinkButton>
            </Card>
          ))}
        </div>

        {/* Everything paid lives on its own page — one line, one link. */}
        <Link
          href="/pricing"
          className="group mx-auto mt-6 flex max-w-3xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-accent-500/30 bg-accent-600/[0.04] px-6 py-5 transition hover:border-accent-500/60 hover:bg-accent-600/[0.08]"
        >
          <div>
            <p className="text-sm font-semibold text-bone-100">
              Want to be seen? Promotion starts at ${PRODUCTS.featured.dollars}.
            </p>
            <p className="mt-0.5 text-xs text-bone-500">
              Featured launches, sidebar slots, sponsored rows, newsletter mentions and a 100+
              directory blast — every one with a dofollow backlink.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent-600">
            See all pricing <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>
      {/* ─── 10b · The payoff — what listing actually buys you ─ */}
      <Reveal as="section" className="mx-auto max-w-6xl px-5 pb-24">
        <div className="mb-10 text-center">
          <Eyebrow>What you get</Eyebrow>
          <h2 className="text-3xl font-bold tracking-tight text-bone-100 sm:text-4xl">
            A dead repo earns you nothing. A listing earns you this.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-bone-500">
            Even if nobody ever buys it, the listing keeps working for you.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: <Link2 size={18} />,
              stat: "Dofollow",
              title: "A permanent backlink",
              body: "Your listing links straight to your site, and Google follows it. Share your launch and you earn a second one — free.",
            },
            {
              icon: <Users size={18} />,
              stat: liveVisitors ? compact(liveVisitors) : `${stats.founders}+`,
              title: liveVisitors ? "People browsed last week" : "Founders already here",
              body: "Operators, indie hackers and acquirers come here hunting for code, domains and users to take over.",
            },
            {
              icon: <BookOpen size={18} />,
              stat: "AI",
              title: "A write-up built for search",
              body: "Every listing gets a long-form article written for the terms buyers actually search — so it keeps pulling traffic on its own.",
            },
            {
              icon: <Tag size={18} />,
              stat: "3%",
              title: "A real shot at a sale",
              body: "Zero-revenue products still sell on the code, the domain and the audience. You keep 97% of whatever it goes for.",
            },
          ].map((b) => (
            <Card key={b.title} className="flex flex-col p-6">
              <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-accent-500/10 text-accent-600">
                {b.icon}
              </span>
              <div className="font-mono text-2xl font-bold leading-none tabular-nums text-bone-100">
                {b.stat}
              </div>
              <h3 className="mt-2 text-sm font-semibold text-bone-100">{b.title}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-relaxed text-bone-500">{b.body}</p>
            </Card>
          ))}
        </div>
      </Reveal>

      {/* ─── 10c · Featured so far — proof the placement works ─ */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Featured so far</Eyebrow>
              <h2 className="text-2xl font-bold tracking-tight text-bone-100 sm:text-3xl">
                Currently pinned to the top
              </h2>
              <p className="mt-2 text-sm text-bone-500">
                Founders who took a Featured Launch — and where it put them.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 text-sm font-medium text-accent-600 hover:underline"
            >
              Get featured from ${PRODUCTS.featured.dollars} →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <Link key={s.slug} href={`/startup/${s.slug}`} className="group block">
                <Card className="flex h-full items-start gap-3 p-5 transition-all duration-300 hover:border-accent-500/40 hover:bg-ink-850">
                  {s.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.logo_url}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-xl border border-black/10 object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-black/10 bg-ink-800 font-serif text-lg text-bone-300">
                      {s.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="truncate font-semibold text-bone-100 group-hover:text-accent-600">
                        {s.name}
                      </h3>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-accent-600">
                        <Sparkles size={8} /> Featured
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-bone-500">
                      {s.tagline || "No description yet."}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ─── 11 · Trust — numbers you can verify ──────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-24">
        <Card className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-moss-500/30 bg-moss-500/10 text-moss-400">
            <ShieldCheck size={24} />
          </span>
          <div>
            <h3 className="text-lg font-medium text-bone-100">Revenue you can actually trust</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-bone-500">
              Founders verify revenue with a read-only key from Stripe, Paddle, Lemon Squeezy or Dodo. We compute the real MRR, badge the listing, and never store the key. What you see is what it earned — no screenshots to fake.
            </p>
          </div>
        </Card>
      </section>

      {/* ─── 12 · FAQ ─────────────────────────────────────── */}
      <section data-fomo="faq" className="mx-auto max-w-3xl px-5 pb-24">
        <div className="mb-10 text-center">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100">Good to know</h2>
        </div>
        <div className="divide-y divide-black/8 rounded-2xl border border-black/8">
          {[
            { q: "Is it really free to list?", a: "Yes — listing is free forever, and opening it for sale is free too. We take a flat 3% only when your startup actually sells. The only paid options are promotion placements: Featured Launch ($9), a sidebar slot ($19), a sponsored row ($29), a newsletter mention ($49) or a 100+ directory blast ($99). Featured runs a week, the rest a month." },
            { q: "Do promotions include a backlink?", a: "Yes — every placement, including the free listing itself, carries a dofollow link to your site. Featured Launch also gives you an embeddable “Featured on Saasgrave” badge for your own landing page." },
            { q: "Do I need an account to look?", a: "No — browsing and search are open to everyone. You only need a free account to make offers, save a watchlist, get death alerts, or list your own startup." },
            { q: "How is revenue verified?", a: "You connect a restricted, read-only key from Stripe, Paddle, Lemon Squeezy or Dodo. We calculate MRR from active subscriptions and discard the key immediately. Only verified listings get the green badge — self-reported MRR shows as unverified." },
            { q: "Who buys dead startups?", a: "Operators and indie hackers who want a head start — a working codebase, a domain, existing users, or simply a market to pivot into." },
            { q: "What if my startup made $0?", a: "That's exactly what Saasgrave is for. Zero-revenue products still have code, a domain, and a lesson worth money to the right buyer." },
            { q: "How does the sale actually happen?", a: "Buyers make an offer through the listing. You accept, reject, or counter, then handle the transfer directly. Escrow and assisted transfers are coming next." },
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
      </section>

      {/* ─── 13 · Final CTA — one action ──────────────────── */}
      <Reveal as="section" className="mx-auto max-w-4xl px-5 pb-24">
        <Card className="relative overflow-hidden bg-bone-100 p-10 text-center sm:p-16">
          <div className="relative">
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-[42px]">
              Don&apos;t let it die twice.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
              It took months to build. It takes 3 minutes to list — and it&apos;s free.
            </p>
            <div className="mt-8 flex justify-center">
              <LinkButton href="/sell" size="lg" className="bg-white text-ink-950 shadow-lift hover:bg-white/90">
                List my dead startup — free <ArrowRight size={17} />
              </LinkButton>
            </div>
          </div>
        </Card>
      </Reveal>

      {/* ─── 14 · Footer — finish strong, worth sharing ───── */}
      <footer className="border-t border-black/8">
        <div className="mx-auto max-w-6xl px-5 py-14 text-center">
          <p className="font-serif text-2xl tracking-tight text-bone-300">
            Every startup deserves a proper burial.
          </p>
          <p className="mt-2 text-sm text-bone-500">
            Built in public by a 16-year-old who buried 4 of his own. No investors, no design team — just vibes and a lot of dead startups.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-bone-500">
            <Link href="/browse" className="hover:text-bone-300">Browse</Link>
            <Link href="/sales" className="hover:text-bone-300">For sale</Link>
            <Link href="/pricing" className="hover:text-bone-300">Pricing</Link>
            <Link href="/guides" className="hover:text-bone-300">Stories</Link>
            <Link href="/wall" className="hover:text-bone-300">Launch wall</Link>
            <Link href="/community" className="hover:text-bone-300">Community</Link>
            <Link href="/sell" className="hover:text-bone-300">List a startup</Link>
            <Link href="/support" className="hover:text-bone-300">Support</Link>
          </div>
          <div className="mt-5 flex items-center justify-center gap-4 text-sm text-bone-500">
            <a href="mailto:ankittharol7@gmail.com" className="hover:text-bone-300">ankittharol7@gmail.com</a>
            <span className="text-bone-500/50">·</span>
            <a href="https://x.com/SaasGrave" target="_blank" rel="noopener noreferrer" className="hover:text-bone-300">@SaasGrave</a>
          </div>
          <p className="mt-8 text-xs text-bone-500">
            © {new Date().getFullYear()} Saas<span className="text-bone-300">grave</span> — the marketplace for startups that didn&apos;t make it.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Comparison cell — a boolean renders a check/cross, a string renders as text.
function Cell({ v, accent = false }: { v: boolean | string; accent?: boolean }) {
  return (
    <span
      className={`flex items-center justify-center border-l border-black/8 p-4 text-center ${
        accent ? "bg-accent-600/[0.04]" : ""
      }`}
    >
      {typeof v === "boolean" ? (
        v ? (
          <Check size={17} className="text-moss-400" />
        ) : (
          <X size={16} className="text-bone-500/60" />
        )
      ) : (
        <span className={`text-sm font-medium ${accent ? "text-accent-400" : "text-bone-400"}`}>{v}</span>
      )}
    </span>
  );
}
