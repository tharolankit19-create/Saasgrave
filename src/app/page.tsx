import Link from "next/link";
import {
  ArrowRight,
  Store,
  Search,
  LineChart,
  ShieldCheck,
  Tag,
  BookOpen,
  Code2,
  Globe,
  Users,
  Megaphone,
  Check,
  Rocket,
  Bell,
  Bookmark,
  Handshake,
  Flame,
} from "lucide-react";
import { LinkButton, Eyebrow, Card } from "@/components/ui";
import { GraveyardSearch } from "@/components/graveyard-search";
import { CountUp } from "@/components/count-up";
import { LedgerRow } from "@/components/ledger-row";
import { GoogleButton } from "@/components/google-button";
import { loadGraveyard } from "@/lib/stats";
import { money } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { rows, stats } = await loadGraveyard(200);

  const searchItems = rows.map((s) => ({
    slug: s.slug,
    name: s.name,
    category: s.category,
    tagline: s.tagline,
    for_sale: s.for_sale,
    logo_url: s.logo_url,
  }));

  // The ledger leads with what has pull — most-viewed first (loadGraveyard
  // already sorts by views then recency). Everything here is a real listing.
  const ledger = rows.slice(0, 12);
  const hasListings = rows.length > 0;

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="grave-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-accent-600/[0.07] blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-24 text-center sm:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/70 px-3.5 py-1.5 text-xs text-bone-300 backdrop-blur">
            <Flame size={12} className="text-accent-400" />
            The resting place for dead &amp; zero-revenue startups
          </div>

          <h1 className="font-serif text-4xl leading-[1.06] tracking-tight text-bone-100 sm:text-6xl">
            Every dead startup
            <br className="hidden sm:block" /> is worth something.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-bone-300 sm:text-lg">
            Working code, an aged domain, real users, and a hard-won lesson — usually deleted the day
            a product dies. Saasgrave keeps that value alive so someone else can revive it.
          </p>

          {/* Live search — visitors use the graveyard before they read a word of pitch. */}
          <div className="mt-9">
            <GraveyardSearch items={searchItems} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-bone-500">Try:</span>
              {["AI", "Chrome extension", "For sale", "SaaS", "No-code"].map((c) => (
                <Link
                  key={c}
                  href={`/browse?q=${encodeURIComponent(c)}`}
                  className="rounded-full border border-white/10 bg-ink-900/60 px-3 py-1 text-bone-300 transition hover:border-white/25 hover:text-bone-100"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/sell" size="lg">
              List your startup — free <ArrowRight size={17} />
            </LinkButton>
            <LinkButton href="/browse" variant="outline" size="lg">
              Browse the graveyard
            </LinkButton>
          </div>
          <p className="mt-4 text-xs text-bone-500">Free to list · $9 to sell · No commission on sales</p>
        </div>
      </section>

      {/* ─── Live stats ribbon ────────────────────────────── */}
      {hasListings && (
        <section className="mx-auto max-w-5xl px-5 pb-20">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-4">
            <StatCell value={stats.graves} label="startups at rest" />
            {stats.buriedMrr > 0 ? (
              <StatCellRaw k={`${money(stats.buriedMrr)}`} label="monthly revenue buried" />
            ) : (
              <StatCell value={stats.users} label="users left behind" />
            )}
            <StatCell value={stats.founders} label="founders" />
            <StatCell value={stats.forSale} label="up for sale" />
          </div>
          <p className="mt-3 text-center text-xs text-bone-500">
            Live from real listings — not a single seeded or fake startup.
          </p>
        </section>
      )}

      {/* ─── Plain-language explainer ─────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-20 text-center">
        <p className="font-serif text-2xl leading-relaxed text-bone-300 sm:text-[28px]">
          Every year millions of startups shut down. Behind each one sits{" "}
          <span className="text-bone-100">working code, a paid domain, real users, and a hard-won
          lesson</span>{" "}
          — usually deleted or left to expire. Saasgrave keeps that value alive.
        </p>
      </section>

      {/* ─── The Ledger (leaderboard) ─────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Eyebrow>The ledger</Eyebrow>
            <h2 className="font-serif text-3xl tracking-tight text-bone-100">Most-visited graves</h2>
            <p className="mt-2 text-sm text-bone-500">Where buyers are looking right now.</p>
          </div>
          <Link
            href="/browse"
            className="hidden shrink-0 text-sm text-bone-300 transition hover:text-accent-400 sm:block"
          >
            View all →
          </Link>
        </div>

        {hasListings ? (
          <div className="overflow-hidden rounded-2xl border border-white/8 bg-ink-900/50">
            <div className="hidden grid-cols-[2.5rem_1fr_9rem_auto] gap-4 border-b border-white/8 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-bone-500 sm:grid">
              <span>#</span>
              <span>Startup</span>
              <span>Status</span>
              <span className="text-right">Interest</span>
            </div>
            {ledger.map((s, i) => (
              <LedgerRow key={s.slug} s={s} rank={i + 1} />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-white/10 text-accent-400">
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

      {/* ─── Why create an account (conversion core) ──────── */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24">
        <Card className="relative overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-600/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <Eyebrow>Why sign up</Eyebrow>
              <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
                Browsing is free.
                <br /> The good stuff needs an account.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-bone-500">
                Looking is open to everyone. An account is what lets you act on what you find — and
                give your own dead work a second life. Takes one click.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <GoogleButton next="/onboarding" label="Continue with Google" />
                <LinkButton href="/register" variant="outline" size="lg">
                  Other ways to sign up
                </LinkButton>
              </div>
              <p className="mt-3 text-xs text-bone-500">Free forever · No card · Unsubscribe anytime</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: <Bell size={17} />, title: "Death alerts", body: "Get pinged when a product in your niche or stack gets buried — reach it first." },
                { icon: <Bookmark size={17} />, title: "Watchlist", body: "Save graves you're eyeing and track price drops and new offers." },
                { icon: <Handshake size={17} />, title: "Make offers", body: "Message founders and bid directly. No middleman, no commission." },
                { icon: <Store size={17} />, title: "List in minutes", body: "Turn a dead repo into a public post-mortem — or a clean sale." },
              ].map((b) => (
                <div key={b.title} className="rounded-xl border border-white/8 bg-ink-950/40 p-5">
                  <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-accent-400">
                    {b.icon}
                  </span>
                  <h3 className="text-sm font-medium text-bone-100">{b.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-bone-500">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* ─── How it works ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-12 text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
            From dead repo to done deal
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-bone-500">
            Listing takes a few minutes. You stay in control the whole way.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <BookOpen size={18} />,
              title: "1 · Tell the story",
              body: "Add the name, logo, screenshots, metrics, and an honest account of what happened. Detail is what makes buyers trust it.",
            },
            {
              icon: <LineChart size={18} />,
              title: "2 · Verify & publish",
              body: "Optionally connect a read-only Stripe key to prove real revenue. Publishing your listing is completely free.",
            },
            {
              icon: <Tag size={18} />,
              title: "3 · Sell or keep as a record",
              body: "Turn on “for sale” for a one-time $9 fee, price it, and take offers — or leave it up purely as a public post-mortem.",
            },
          ].map((step) => (
            <Card key={step.title} className="p-7">
              <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-accent-400">
                {step.icon}
              </span>
              <h3 className="mb-2 font-medium text-bone-100">{step.title}</h3>
              <p className="text-sm leading-relaxed text-bone-500">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── What's in a listing ──────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-10 text-center">
          <Eyebrow>What you get</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
            More than just code
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
              <span className="mb-4 grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-accent-400">
                {x.icon}
              </span>
              <h3 className="mb-1.5 text-sm font-medium text-bone-100">{x.title}</h3>
              <p className="text-xs leading-relaxed text-bone-500">{x.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Two audiences ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="p-8">
            <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-accent-400">
              <Store size={19} />
            </span>
            <h3 className="text-xl font-medium text-bone-100">If you built it</h3>
            <p className="mt-2 text-sm leading-relaxed text-bone-500">
              Don&apos;t let months of work rot in a private repo. List it in minutes, recover some
              value, and let your work help the next founder.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-bone-300">
              {["Free to list — always", "Verify revenue for buyer trust", "Set a price or open it to offers", "Keep 100% of the sale — no commission"].map(
                (x) => (
                  <li key={x} className="flex gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-moss-400" />
                    {x}
                  </li>
                )
              )}
            </ul>
            <LinkButton href="/sell" variant="outline" size="sm" className="mt-6">
              List a startup
            </LinkButton>
          </Card>

          <Card className="p-8">
            <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-accent-400">
              <Search size={19} />
            </span>
            <h3 className="text-xl font-medium text-bone-100">If you want to build</h3>
            <p className="mt-2 text-sm leading-relaxed text-bone-500">
              Skip zero-to-one. Buy a product that already exists, read exactly why it stalled, and
              take it somewhere the first founder couldn&apos;t.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-bone-300">
              {["Filter by tech stack, price and cause", "Read the honest story before buying", "See verified revenue where available", "Make an offer directly to the founder"].map(
                (x) => (
                  <li key={x} className="flex gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-moss-400" />
                    {x}
                  </li>
                )
              )}
            </ul>
            <LinkButton href="/browse" variant="outline" size="sm" className="mt-6">
              Browse listings
            </LinkButton>
          </Card>
        </div>
      </section>

      {/* ─── Pricing ──────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-10 text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
            Simple, honest, and mostly free
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <Store size={18} />,
              price: "Free",
              title: "List a startup",
              body: "Publish your product to the marketplace as a public record. No fee, no catch.",
              highlight: false,
            },
            {
              icon: <Rocket size={18} />,
              price: "$9",
              unit: "one-time",
              title: "List it for sale",
              body: "Add a price or open offers and let operators buy it. We take zero commission.",
              highlight: true,
            },
            {
              icon: <Megaphone size={18} />,
              price: "$49",
              unit: "/ 30 days",
              title: "Book an ad slot",
              body: "One of six premium slots beside every listing. Reach buyers with real intent.",
              highlight: false,
            },
          ].map((p) => (
            <Card
              key={p.title}
              className={`relative p-7 ${p.highlight ? "border-accent-500/40" : ""}`}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-7 rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-950">
                  Most popular
                </span>
              )}
              <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-accent-400">
                {p.icon}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-3xl text-bone-100">{p.price}</span>
                {p.unit && <span className="text-xs text-bone-500">{p.unit}</span>}
              </div>
              <h3 className="mt-3 font-medium text-bone-100">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-bone-500">{p.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Trust / verification ─────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <Card className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-moss-500/30 bg-moss-500/10 text-moss-400">
            <ShieldCheck size={24} />
          </span>
          <div>
            <h3 className="text-lg font-medium text-bone-100">Numbers you can actually trust</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-bone-500">
              Founders verify revenue with a read-only Stripe key. We compute the real MRR, badge the
              listing, and never store the key. What you see is what it earned — no screenshots to fake.
            </p>
          </div>
        </Card>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <div className="mb-10 text-center">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100">Good to know</h2>
        </div>
        <div className="divide-y divide-white/8 rounded-2xl border border-white/8">
          {[
            { q: "What does it cost?", a: "Browsing and listing a startup are free. Listing one for sale is a one-time $9 fee, and we take no commission on the sale itself. Ad slots are $49 for 30 days." },
            { q: "Do I need an account to look?", a: "No — browsing and search are open to everyone. You only need a free account to make offers, save a watchlist, get death alerts, or list your own startup." },
            { q: "How is revenue verified?", a: "You paste a restricted, read-only Stripe key. We calculate MRR from active subscriptions and discard the key immediately. Verified listings get a green badge." },
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

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <Card className="relative overflow-hidden p-10 text-center sm:p-14">
          <div className="grave-grid pointer-events-none absolute inset-0 opacity-50" />
          <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-96 -translate-x-1/2 rounded-full bg-accent-600/10 blur-3xl" />
          <div className="relative">
            <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
              Give your dead startup a second act.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-bone-500">
              It took months to build. It takes minutes to list — and it&apos;s free.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <LinkButton href="/sell" size="lg">
                List your startup <ArrowRight size={17} />
              </LinkButton>
              <LinkButton href="/browse" variant="outline" size="lg">
                Browse listings
              </LinkButton>
            </div>
          </div>
        </Card>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-bone-500 sm:flex-row">
          <span className="font-semibold text-bone-300">
            Saas<span className="text-bone-500">grave</span>
          </span>
          <div className="flex items-center gap-5">
            <Link href="/browse" className="hover:text-bone-300">Browse</Link>
            <Link href="/sales" className="hover:text-bone-300">For sale</Link>
            <Link href="/sell" className="hover:text-bone-300">List</Link>
          </div>
          <p>© {new Date().getFullYear()} Saasgrave</p>
        </div>
      </footer>
    </div>
  );
}

function StatCell({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-ink-900 p-6 text-center sm:p-7">
      <CountUp value={value} className="font-serif text-3xl text-bone-100 sm:text-4xl" />
      <div className="mt-1.5 text-xs text-bone-500 sm:text-sm">{label}</div>
    </div>
  );
}

function StatCellRaw({ k, label }: { k: string; label: string }) {
  return (
    <div className="bg-ink-900 p-6 text-center sm:p-7">
      <div className="font-serif text-3xl text-bone-100 sm:text-4xl">{k}</div>
      <div className="mt-1.5 text-xs text-bone-500 sm:text-sm">{label}</div>
    </div>
  );
}
