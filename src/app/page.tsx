import Link from "next/link";
import { ArrowUpRight, Skull, Search, Sparkles } from "lucide-react";
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
      <section className="grave-grid relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember-500/40 to-transparent" />
        <div className="mx-auto max-w-4xl px-5 pb-24 pt-28 text-center sm:pt-36">
          <div className="animate-fade-up mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/60 px-4 py-1.5 text-xs text-bone-300">
            <span className="h-1.5 w-1.5 rounded-full bg-ember-500" />
            90% of startups die. Their code doesn&apos;t have to.
          </div>

          <h1 className="animate-fade-up font-serif text-5xl leading-[1.05] tracking-tight text-bone-100 sm:text-7xl">
            Where dead startups
            <br />
            find new life.
          </h1>

          <p className="animate-fade-up mx-auto mt-7 max-w-xl text-lg leading-relaxed text-bone-300">
            A quiet marketplace for failed and zero-revenue products. Lay yours to rest with
            dignity — or browse what others left behind and revive it.
          </p>

          <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <LinkButton href="/sell" size="lg">
              List your startup <ArrowUpRight size={18} />
            </LinkButton>
            <LinkButton href="/browse" variant="outline" size="lg">
              Walk the graveyard
            </LinkButton>
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-3">
          {[
            { k: "90%", v: "of startups fail within a few years" },
            { k: "$500B+", v: "of dead assets buried every year" },
            { k: "0", v: "marketplaces built for the ones that died" },
          ].map((s) => (
            <div key={s.k} className="bg-ink-900 p-8 text-center">
              <div className="font-serif text-4xl text-bone-100">{s.k}</div>
              <div className="mt-2 text-sm text-bone-500">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="mb-14 text-center">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="font-serif text-4xl tracking-tight text-bone-100">Three steps to closure</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <Skull size={20} />,
              title: "Bury it",
              body: "Write the autopsy. Name, tagline, why it died, what it cost, what you learned. Honest is what sells.",
            },
            {
              icon: <Search size={20} />,
              title: "Get discovered",
              body: "Your listing lands in the graveyard where founders hunt for code, domains, users and pivots.",
            },
            {
              icon: <Sparkles size={20} />,
              title: "Revive or sell",
              body: "List it for free, or price it as a multiple of its last revenue. Verified numbers earn trust.",
            },
          ].map((step, i) => (
            <Card key={step.title} className="p-7">
              <div className="mb-5 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-ember-400">
                  {step.icon}
                </span>
                <span className="font-serif text-3xl text-white/10">0{i + 1}</span>
              </div>
              <h3 className="mb-2 text-lg font-medium text-bone-100">{step.title}</h3>
              <p className="text-sm leading-relaxed text-bone-500">{step.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Featured ─────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-28">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <Eyebrow>Freshly buried</Eyebrow>
            <h2 className="font-serif text-4xl tracking-tight text-bone-100">Latest arrivals</h2>
          </div>
          <Link href="/browse" className="hidden text-sm text-bone-300 hover:text-ember-400 sm:block">
            View all →
          </Link>
        </div>

        {featured && featured.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s: any) => (
              <StartupCard key={s.id} startup={s} />
            ))}
          </div>
        ) : (
          <Card className="grave-grid p-16 text-center">
            <p className="font-serif text-2xl text-bone-300">The graveyard is quiet… for now.</p>
            <p className="mx-auto mt-3 max-w-md text-sm text-bone-500">
              Be the first to lay a startup to rest. The first 50 listings are free.
            </p>
            <div className="mt-7">
              <LinkButton href="/sell" size="md">
                Be the first
              </LinkButton>
            </div>
          </Card>
        )}
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-bone-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-ember-500">†</span>
            <span className="font-serif text-bone-300">Graveyard</span>
          </div>
          <p>Rest in production.</p>
        </div>
      </footer>
    </div>
  );
}
