import Link from "next/link";
import { ArrowRight, Store, Search, LineChart, ShieldCheck, Tag, BookOpen } from "lucide-react";
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
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-900 px-3.5 py-1.5 text-xs text-bone-300">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
          For founders who shipped, learned, and moved on
        </div>

        <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-bone-100 sm:text-6xl">
          The resting place for dead SaaS.
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-bone-300 sm:text-lg">
          Every failed product still holds something worth keeping — the code, the domain, the
          users, the lesson. List yours on Saasgrave, or acquire one worth reviving.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href="/sell" size="lg">
            List your startup <ArrowRight size={17} />
          </LinkButton>
          <LinkButton href="/browse" variant="outline" size="lg">
            Browse listings
          </LinkButton>
        </div>
        <p className="mt-4 text-xs text-bone-500">Free to browse · $9 to list · No commission on sales</p>
      </section>

      {/* ─── Stats ────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 pb-20">
        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8">
          {[
            { k: "90%", v: "of startups shut down" },
            { k: "$500B+", v: "in assets written off yearly" },
            { k: "1 in 3", v: "founders build again" },
          ].map((s) => (
            <div key={s.k} className="bg-ink-900 p-6 text-center sm:p-8">
              <div className="font-serif text-3xl text-bone-100 sm:text-4xl">{s.k}</div>
              <div className="mt-1.5 text-xs text-bone-500 sm:text-sm">{s.v}</div>
            </div>
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
              Don&apos;t let it rot in a private repo. Write down what happened, attach the assets,
              and let it go — as a sale or simply as a record others can learn from.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-bone-300">
              {["Recover value from code, domains and users", "Verify your revenue for buyer trust", "Set a price or open it to offers"].map(
                (x) => (
                  <li key={x} className="flex gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                    {x}
                  </li>
                )
              )}
            </ul>
          </Card>

          <Card className="p-8">
            <span className="mb-5 grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-accent-400">
              <Search size={19} />
            </span>
            <h3 className="text-xl font-medium text-bone-100">If you want to build</h3>
            <p className="mt-2 text-sm leading-relaxed text-bone-500">
              Skip six months of zero-to-one. Acquire a product with a working codebase and a clear
              post-mortem, then take it where the original founder couldn&apos;t.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-bone-300">
              {["Filter by tech stack, price and why it failed", "Read the honest story before you buy", "Make an offer directly to the founder"].map(
                (x) => (
                  <li key={x} className="flex gap-2.5">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent-500" />
                    {x}
                  </li>
                )
              )}
            </ul>
          </Card>
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-12 text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
            Three steps, start to sold
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: <BookOpen size={18} />, title: "Write the record", body: "Name, tagline, metrics, and an honest account of why it ended. Detail is what earns trust." },
            { icon: <LineChart size={18} />, title: "Verify & list", body: "Connect a read-only key to prove real revenue, then publish it to the marketplace for $9." },
            { icon: <Tag size={18} />, title: "Sell or pass it on", body: "Price it outright or as a multiple of revenue, and field offers from operators ready to run it." },
          ].map((step, i) => (
            <Card key={step.title} className="p-7">
              <div className="mb-5 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-accent-400">
                  {step.icon}
                </span>
                <span className="font-serif text-2xl text-white/10">0{i + 1}</span>
              </div>
              <h3 className="mb-2 font-medium text-bone-100">{step.title}</h3>
              <p className="text-sm leading-relaxed text-bone-500">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Featured ─────────────────────────────────────── */}
      {featured && featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <Eyebrow>Recently listed</Eyebrow>
              <h2 className="font-serif text-3xl tracking-tight text-bone-100">Latest arrivals</h2>
            </div>
            <Link href="/browse" className="hidden text-sm text-bone-300 hover:text-accent-400 sm:block">
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
              listing, and never store the key. What you see is what it earned.
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
            { q: "What does it cost?", a: "Browsing is free. Publishing a listing is $9. Listing something for sale is $90. We take no commission on the sale itself." },
            { q: "Do I have to sell?", a: "No. You can list a product purely as a public record — its metrics and post-mortem — without putting it up for sale." },
            { q: "How is revenue verified?", a: "You paste a restricted, read-only Stripe key. We calculate MRR from active subscriptions and discard the key immediately. Verified listings get a badge." },
            { q: "Who buys dead startups?", a: "Operators and indie hackers looking for a head start — a working codebase, a domain, existing users, or a market to pivot into." },
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
        <Card className="p-10 text-center sm:p-14">
          <h2 className="font-serif text-3xl tracking-tight text-bone-100 sm:text-4xl">
            Give your dead startup a second act.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-bone-500">
            It took months to build. It takes minutes to list.
          </p>
          <div className="mt-7">
            <LinkButton href="/sell" size="lg">
              List your startup <ArrowRight size={17} />
            </LinkButton>
          </div>
        </Card>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-bone-500 sm:flex-row">
          <span className="font-semibold text-bone-300">Saas<span className="text-bone-500">grave</span></span>
          <p>© {new Date().getFullYear()} Saasgrave</p>
        </div>
      </footer>
    </div>
  );
}
