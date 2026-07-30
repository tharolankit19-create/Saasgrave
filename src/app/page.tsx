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
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LinkButton, Eyebrow, Card } from "@/components/ui";
import { StartupCard } from "@/components/startup-card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();
  const { data: featured } = await supabase
    .from("startups")
    .select("*, founder:profiles(full_name, avatar_url)")
    .eq("status", "listed")
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 pb-16 pt-24 text-center sm:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-xs text-ink-soft">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
          The marketplace for startups that didn&apos;t make it
        </div>

        <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-ink sm:text-6xl">
          Sold your soul to a startup
          <br className="hidden sm:block" /> that died?
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-soft sm:text-lg">
          Most products don&apos;t fail because the code was bad — they run out of time, money, or
          the right market. Saasgrave is where founders list those dead and zero-revenue products so
          someone else can buy the code, domain, users and lessons, and give it a second life.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/sell" size="lg">
            List your startup — free <ArrowRight size={17} />
          </LinkButton>
          <LinkButton href="/browse" variant="outline" size="lg">
            Browse the marketplace
          </LinkButton>
        </div>
        <p className="mt-4 text-xs text-ink-faint">Free to list · $9 to sell · No commission on sales</p>
      </section>

      {/* ─── Plain-language explainer ─────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-20 text-center">
        <p className="font-serif text-2xl leading-relaxed text-ink-soft sm:text-[28px]">
          Every year millions of startups shut down. Behind each one sits{" "}
          <span className="text-ink">working code, a paid domain, real users, and a hard-won
          lesson</span>{" "}
          — usually deleted or left to expire. Saasgrave keeps that value alive.
        </p>
      </section>

      {/* ─── Stats ────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {[
            { k: "90%", v: "of startups shut down" },
            { k: "$500B+", v: "in assets written off yearly" },
            { k: "1 in 3", v: "founders build again" },
          ].map((s) => (
            <div key={s.k} className="bg-card p-6 text-center sm:p-8">
              <div className="font-serif text-3xl text-ink sm:text-4xl">{s.k}</div>
              <div className="mt-1.5 text-xs text-ink-faint sm:text-sm">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-12 text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            From dead repo to done deal
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-faint">
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
              <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-line text-accent-400">
                {step.icon}
              </span>
              <h3 className="mb-2 font-medium text-ink">{step.title}</h3>
              <p className="text-sm leading-relaxed text-ink-faint">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── What's in a listing ──────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-10 text-center">
          <Eyebrow>What you get</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
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
              <span className="mb-4 grid h-9 w-9 place-items-center rounded-lg border border-line text-accent-400">
                {x.icon}
              </span>
              <h3 className="mb-1.5 text-sm font-medium text-ink">{x.title}</h3>
              <p className="text-xs leading-relaxed text-ink-faint">{x.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Two audiences ────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="p-8">
            <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-line text-accent-400">
              <Store size={19} />
            </span>
            <h3 className="text-xl font-medium text-ink">If you built it</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-faint">
              Don&apos;t let months of work rot in a private repo. List it in minutes, recover some
              value, and let your work help the next founder.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-ink-soft">
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
            <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-line text-accent-400">
              <Search size={19} />
            </span>
            <h3 className="text-xl font-medium text-ink">If you want to build</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-faint">
              Skip zero-to-one. Buy a product that already exists, read exactly why it stalled, and
              take it somewhere the first founder couldn&apos;t.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-ink-soft">
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
          <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
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
                <span className="absolute -top-2.5 left-7 rounded-full bg-accent-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                  Most popular
                </span>
              )}
              <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-line text-accent-400">
                {p.icon}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-3xl text-ink">{p.price}</span>
                {p.unit && <span className="text-xs text-ink-faint">{p.unit}</span>}
              </div>
              <h3 className="mt-3 font-medium text-ink">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-faint">{p.body}</p>
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
            <h3 className="text-lg font-medium text-ink">Numbers you can actually trust</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-faint">
              Founders verify revenue with a read-only Stripe key. We compute the real MRR, badge the
              listing, and never store the key. What you see is what it earned — no screenshots to fake.
            </p>
          </div>
        </Card>
      </section>

      {/* ─── Featured ─────────────────────────────────────── */}
      {featured && featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <Eyebrow>Recently listed</Eyebrow>
              <h2 className="font-serif text-3xl tracking-tight text-ink">Latest arrivals</h2>
            </div>
            <Link href="/browse" className="hidden text-sm text-ink-soft hover:text-accent-400 sm:block">
              View all →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s: any) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        </section>
      )}

      {/* ─── FAQ ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-5 pb-24">
        <div className="mb-10 text-center">
          <Eyebrow>Questions</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-ink">Good to know</h2>
        </div>
        <div className="divide-y divide-line rounded-2xl border border-line">
          {[
            { q: "What does it cost?", a: "Browsing and listing a startup are free. Listing one for sale is a one-time $9 fee, and we take no commission on the sale itself. Ad slots are $49 for 30 days." },
            { q: "Do I have to sell?", a: "No. You can list a product purely as a public record — its metrics and post-mortem — without ever putting it up for sale." },
            { q: "How is revenue verified?", a: "You paste a restricted, read-only Stripe key. We calculate MRR from active subscriptions and discard the key immediately. Verified listings get a green badge." },
            { q: "Who buys dead startups?", a: "Operators and indie hackers who want a head start — a working codebase, a domain, existing users, or simply a market to pivot into." },
            { q: "What if my startup made $0?", a: "That's exactly what Saasgrave is for. Zero-revenue products still have code, a domain, and a lesson worth money to the right buyer." },
            { q: "How does the sale actually happen?", a: "Buyers make an offer through the listing. You accept, reject, or counter, then handle the transfer directly. Escrow and assisted transfers are coming next." },
          ].map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-ink">
                {item.q}
                <span className="text-ink-faint transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-faint">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-5 pb-24">
        <Card className="p-10 text-center sm:p-14">
          <h2 className="font-serif text-3xl tracking-tight text-ink sm:text-4xl">
            Give your dead startup a second act.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-faint">
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
        </Card>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-ink-faint sm:flex-row">
          <span className="font-semibold text-ink-soft">
            Saas<span className="text-ink-faint">grave</span>
          </span>
          <div className="flex items-center gap-5">
            <Link href="/browse" className="hover:text-ink-soft">Browse</Link>
            <Link href="/sales" className="hover:text-ink-soft">For sale</Link>
            <Link href="/sell" className="hover:text-ink-soft">List</Link>
          </div>
          <p>© {new Date().getFullYear()} Saasgrave</p>
        </div>
      </footer>
    </div>
  );
}
