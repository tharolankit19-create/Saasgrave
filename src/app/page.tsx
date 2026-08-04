import Link from "next/link";
import {
  ArrowRight,
  Store,
  Search,
  ShieldCheck,
  Tag,
  BookOpen,
  Code2,
  Globe,
  Users,
  Check,
  X,
  Bell,
  Bookmark,
  Handshake,
  Flame,
  Heart,
  LineChart,
  Rocket,
  Megaphone,
} from "lucide-react";
import { LinkButton, Eyebrow, Card } from "@/components/ui";
import { GraveyardSearch } from "@/components/graveyard-search";
import { CountUp } from "@/components/count-up";
import { LedgerRow } from "@/components/ledger-row";
import { GoogleButton } from "@/components/google-button";
import { PromoSlots } from "@/components/promo-slots";
import { Reveal, Aurora, Marquee } from "@/components/motion";
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

  const ledger = rows.slice(0, 12);
  const hasListings = rows.length > 0;

  // The moving tape under the hero. Real names when we have them; otherwise a
  // loop of what a dead startup leaves behind — concept words, never fake names.
  const marqueeItems = hasListings
    ? rows.slice(0, 22).map((s) => s.name)
    : ["Working code", "An aged domain", "Real users", "An email list", "A hard-won lesson", "A second life"];

  return (
    <div>
      {/* ─── 1 · Hero — one idea, sold from here alone ────── */}
      <section className="relative overflow-hidden">
        <div className="grave-grid pointer-events-none absolute inset-0 opacity-60" />
        <Aurora className="left-1/2 top-[-120px] h-[520px] w-[880px] -translate-x-1/2" />
        <Aurora className="right-[-140px] top-[120px] h-[360px] w-[360px]" />

        <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-24 text-center sm:pt-28">
          <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-black/10 bg-ink-900 px-3.5 py-1.5 text-xs text-bone-500 shadow-card">
            <Flame size={12} className="text-accent-500" />
            The resting place for dead &amp; zero-revenue startups
          </div>

          <h1 className="font-serif text-[2.6rem] leading-[1.04] tracking-tight text-bone-100 sm:text-6xl">
            Your dead startup
            <br className="hidden sm:block" /> is still worth{" "}
            <span className="text-shimmer animate-shimmer">money.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-bone-300 sm:text-lg">
            9 in 10 startups die — and their code, domain, users and lessons get deleted with them.
            List yours in 3 minutes. Keep it as a public post-mortem, or sell it and keep 100%.
          </p>

          {/* Show the product before explaining it — visitors search first. */}
          <div className="mt-9">
            <GraveyardSearch items={searchItems} />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-bone-500">Try:</span>
              {["AI", "Chrome extension", "For sale", "SaaS", "No-code"].map((c) => (
                <Link
                  key={c}
                  href={`/browse?q=${encodeURIComponent(c)}`}
                  className="rounded-full border border-black/10 bg-ink-900/60 px-3 py-1 text-bone-300 transition hover:border-black/25 hover:text-bone-100"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* One clear next step. */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/sell" size="lg">
              List my startup — free <ArrowRight size={17} />
            </LinkButton>
            <LinkButton href="/browse" variant="outline" size="lg">
              Browse the graveyard
            </LinkButton>
          </div>
          <p className="mt-4 text-xs text-bone-500">
            Free to list, forever · $9 to open it for sale · 0% commission
          </p>
        </div>

        {/* Moving tape — the graveyard, drifting past. */}
        <div className="relative mx-auto max-w-6xl px-5 pb-16">
          <p className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.2em] text-bone-500">
            {hasListings ? "Recently laid to rest" : "What every dead startup leaves behind"}
          </p>
          <Marquee items={marqueeItems} />
        </div>
      </section>

      {/* ─── 2 · Live proof, in real numbers ──────────────── */}
      {hasListings && (
        <section className="mx-auto max-w-5xl px-5 pb-24">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-black/8 bg-black/8 sm:grid-cols-4">
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
          <div className="overflow-hidden rounded-2xl border border-black/8 bg-ink-900/50">
            <div className="hidden grid-cols-[2.5rem_1fr_9rem_auto] gap-4 border-b border-black/8 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-bone-500 sm:grid">
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

      {/* ─── 5 · How it works — one screen, three steps ───── */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="mb-12 text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
            Dead repo to done deal in 3 minutes
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-bone-500">
            You stay in control the whole way. Nothing goes live until you say so.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <BookOpen size={18} />,
              title: "1 · Tell the story",
              body: "Name, logo, screenshots, metrics, and an honest account of what happened. Detail is what makes buyers trust it.",
            },
            {
              icon: <LineChart size={18} />,
              title: "2 · Verify & publish",
              body: "Optionally connect a read-only Stripe key to prove real revenue. Publishing is completely free.",
            },
            {
              icon: <Tag size={18} />,
              title: "3 · Sell or keep as a record",
              body: "Open it for sale for a one-time $9, price it, take offers — or leave it up purely as a public post-mortem.",
            },
          ].map((step) => (
            <Card key={step.title} className="p-7">
              <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-black/10 text-accent-400">
                {step.icon}
              </span>
              <h3 className="mb-2 font-medium text-bone-100">{step.title}</h3>
              <p className="text-sm leading-relaxed text-bone-500">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── 6 · What you get — sell the outcome ──────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
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

      {/* ─── 7 · Why sign up — conversion core, one click ─── */}
      <section className="relative mx-auto max-w-6xl px-5 pb-24">
        <Card className="relative overflow-hidden p-8 sm:p-12">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent-600/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <Eyebrow>Why sign up</Eyebrow>
              <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
                Looking is free.
                <br /> Acting needs an account.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-bone-500">
                Browse all you like. An account is what lets you move on what you find — and give your
                own dead work a second life. One click with Google, no password.
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
                <div key={b.title} className="rounded-xl border border-black/8 bg-ink-950/40 p-5">
                  <span className="mb-3 grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-accent-400">
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

      {/* ─── 8 · Premium placements (real money surface) ──── */}
      <PromoSlots />

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
            { label: "Commission on sale", a: "0%", b: "—", c: "Up to ~15%" },
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

      {/* ─── 10 · Pricing — popcorn: good / better / best ─── */}
      <section id="pricing" className="mx-auto max-w-6xl px-5 pb-24 scroll-mt-24">
        <div className="mb-10 text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
            Free to list. Pay only to go further.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-bone-500">
            No subscriptions. No commission. You pay once, only when you want more reach.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <Store size={18} />,
              price: "Free",
              unit: "forever",
              title: "List",
              body: "Publish your product as a public post-mortem. Metrics, story, lessons — live immediately.",
              cta: "List my startup",
              href: "/sell",
              highlight: false,
            },
            {
              icon: <Rocket size={18} />,
              price: "$9",
              unit: "one-time",
              title: "Sell",
              body: "Open it to buyers, set a price or take offers, and keep 100% of the sale. No commission, ever.",
              cta: "Open it for sale",
              href: "/sell",
              highlight: true,
            },
            {
              icon: <Megaphone size={18} />,
              price: "$49",
              unit: "/ 30 days",
              title: "Promote",
              body: "Book one of six premium slots beside every listing. Reach buyers with real intent.",
              cta: "Claim a slot",
              href: "/browse",
              highlight: false,
            },
          ].map((p) => (
            <Card
              key={p.title}
              className={`relative flex flex-col p-7 ${p.highlight ? "border-accent-500/40" : ""}`}
            >
              {p.highlight && (
                <span className="absolute -top-2.5 left-7 rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-950">
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
      </section>

      {/* ─── 11 · Trust — numbers you can verify ──────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-24">
        <Card className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-moss-500/30 bg-moss-500/10 text-moss-400">
            <ShieldCheck size={24} />
          </span>
          <div>
            <h3 className="text-lg font-medium text-bone-100">Revenue you can actually trust</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-bone-500">
              Founders verify revenue with a read-only Stripe key. We compute the real MRR, badge the
              listing, and never store the key. What you see is what it earned — no screenshots to fake.
            </p>
          </div>
        </Card>
      </section>

      {/* ─── 12 · FAQ ─────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <div className="mb-10 text-center">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100">Good to know</h2>
        </div>
        <div className="divide-y divide-black/8 rounded-2xl border border-black/8">
          {[
            { q: "Is it really free to list?", a: "Yes — listing a startup is free forever. You only pay if you open it for sale ($9 once) or book a promo slot ($49 / 30 days). We never take commission on a sale." },
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

      {/* ─── 13 · Final CTA — one action ──────────────────── */}
      <Reveal as="section" className="mx-auto max-w-4xl px-5 pb-24">
        <Card className="relative overflow-hidden p-10 text-center sm:p-16">
          <div className="grave-grid pointer-events-none absolute inset-0 opacity-50" />
          <Aurora className="left-1/2 top-[-60px] h-64 w-[520px] -translate-x-1/2" />
          <div className="relative">
            <h2 className="font-serif text-3xl leading-tight tracking-tight text-bone-100 sm:text-[42px]">
              Don&apos;t let it die twice.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-bone-500">
              It took months to build. It takes 3 minutes to list — and it&apos;s free.
            </p>
            <div className="mt-8 flex justify-center">
              <LinkButton href="/sell" size="lg">
                List my startup — free <ArrowRight size={17} />
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
          <p className="mt-2 text-sm text-bone-500">Rest in production.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-bone-500">
            <Link href="/browse" className="hover:text-bone-300">Browse</Link>
            <Link href="/sales" className="hover:text-bone-300">For sale</Link>
            <Link href="/#pricing" className="hover:text-bone-300">Pricing</Link>
            <Link href="/sell" className="hover:text-bone-300">List a startup</Link>
            <Link href="/register" className="hover:text-bone-300">Sign up</Link>
          </div>
          <p className="mt-8 text-xs text-bone-500">
            © {new Date().getFullYear()} Saas<span className="text-bone-300">grave</span> — the marketplace for startups that didn&apos;t make it.
          </p>
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
