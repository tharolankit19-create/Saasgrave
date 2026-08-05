import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { GUIDES } from "@/lib/guides";
import { Card, Eyebrow } from "@/components/ui";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.com";

export const metadata: Metadata = {
  title: "Guides for founders — failing, pivoting, selling & buying startups",
  description:
    "Practical, honest guides for founders: what to do when your startup fails, whether to pivot or shut down, how to sell a dead startup, and how to buy one to grow.",
  alternates: { canonical: `${BASE}/guides` },
};

export default function GuidesIndex() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-14">
      <div className="text-center">
        <Eyebrow>Guides</Eyebrow>
        <h1 className="font-serif text-4xl tracking-tight text-bone-100 sm:text-5xl">
          The honest playbook for what comes after
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-bone-500">
          Failing, pivoting, selling, buying — the parts of the startup journey nobody writes about,
          written plainly for founders who are in it right now.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="group">
            <Card className="flex h-full flex-col p-7 transition hover:shadow-lift">
              <h2 className="font-serif text-xl leading-snug tracking-tight text-bone-100 group-hover:text-accent-600">
                {g.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-bone-500">{g.description}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-bone-500">
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
    </div>
  );
}
