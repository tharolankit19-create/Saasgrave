import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, PenLine } from "lucide-react";
import { GUIDES } from "@/lib/guides";
import { createClient } from "@/lib/supabase/server";
import { Card, Eyebrow } from "@/components/ui";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";

export const metadata: Metadata = {
  title: "Guides for founders — failing, pivoting, selling & buying startups",
  description:
    "Practical, honest guides for founders: what to do when your startup fails, whether to pivot or shut down, how to sell a dead startup, and how to buy one to grow.",
  alternates: { canonical: `${BASE}/guides` },
};

export const dynamic = "force-dynamic";

export default async function GuidesIndex() {
  // Founder-written guides (best-effort — the curated set always renders).
  let founderGuides: any[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("founder_guides")
      .select("slug, title, summary, created_at, author_id")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(24);
    founderGuides = data || [];
  } catch {}

  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <div className="text-center">
        <Eyebrow>Guides</Eyebrow>
        <h1 className="font-serif text-4xl tracking-tight text-bone-100 sm:text-5xl">
          The honest playbook for what comes after
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-bone-400">
          Failing, pivoting, selling, buying — the parts of the startup journey nobody writes about,
          written plainly for founders who are in it right now.
        </p>
        <Link
          href="/guides/write"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-bone-100 px-6 text-sm font-medium text-ink-950 shadow-card transition hover:shadow-lift"
        >
          <PenLine size={15} /> Write your own guide
        </Link>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="group">
            <Card className="flex h-full flex-col p-7 transition hover:shadow-lift">
              <h2 className="font-serif text-xl leading-snug tracking-tight text-bone-100 group-hover:text-accent-600">
                {g.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-bone-400">{g.description}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-bone-400">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={12} /> {g.readMins} min read
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-accent-600">
                  Read <ArrowRight size={12} />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {founderGuides.length > 0 && (
        <div className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-2xl tracking-tight text-bone-100">From founders</h2>
            <Link href="/guides/write" className="text-sm font-medium text-accent-600 hover:underline">
              Add yours →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {founderGuides.map((g) => (
              <Link key={g.slug} href={`/guides/f/${g.slug}`} className="group">
                <Card className="flex h-full flex-col p-6 transition hover:shadow-lift">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent-600">Founder guide</span>
                  <h3 className="mt-2 font-medium leading-snug text-bone-100 group-hover:text-accent-600">{g.title}</h3>
                  {g.summary && <p className="mt-1.5 flex-1 text-sm leading-relaxed text-bone-400">{g.summary}</p>}
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-accent-600">
                    Read <ArrowRight size={12} />
                  </span>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
