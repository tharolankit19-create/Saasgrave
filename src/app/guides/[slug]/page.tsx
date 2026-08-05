import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Check, Clock } from "lucide-react";
import { GUIDES, getGuide } from "@/lib/guides";
import { LinkButton, Card, Eyebrow } from "@/components/ui";

export const dynamic = "force-static";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.com";

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  if (!g) return { title: "Not found" };
  const url = `${BASE}/guides/${g.slug}`;
  return {
    title: g.metaTitle,
    description: g.description,
    keywords: g.keywords,
    alternates: { canonical: url },
    openGraph: { title: g.metaTitle, description: g.description, type: "article", url },
    twitter: { card: "summary_large_image", title: g.metaTitle, description: g.description },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();
  const url = `${BASE}/guides/${g.slug}`;

  // Structured data so search engines and AI assistants can parse and cite it.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: g.metaTitle,
      description: g.description,
      datePublished: g.updated,
      dateModified: g.updated,
      author: { "@type": "Organization", name: "Saasgrave" },
      publisher: { "@type": "Organization", name: "Saasgrave" },
      mainEntityOfPage: url,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: g.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Guides", item: `${BASE}/guides` },
        { "@type": "ListItem", position: 2, name: g.title, item: url },
      ],
    },
  ];

  const related = GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 flex items-center gap-2 text-sm text-bone-500">
        <Link href="/" className="hover:text-bone-300">Saasgrave</Link>
        <span>›</span>
        <Link href="/guides" className="hover:text-bone-300">Guides</Link>
      </nav>

      <header>
        <Eyebrow>Founder guide</Eyebrow>
        <h1 className="font-serif text-[2.1rem] leading-[1.1] tracking-tight text-bone-100 sm:text-5xl">
          {g.title}
        </h1>
        <div className="mt-4 flex items-center gap-2 text-xs text-bone-500">
          <Clock size={13} /> {g.readMins} min read · Updated {new Date(g.updated).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
      </header>

      <div className="mt-8 space-y-4">
        {g.intro.map((p, i) => (
          <p key={i} className="text-[17px] leading-relaxed text-bone-300">{p}</p>
        ))}
      </div>

      <div className="mt-10 space-y-10">
        {g.sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-serif text-2xl tracking-tight text-bone-100">{s.h}</h2>
            {s.p?.map((p, i) => (
              <p key={i} className="mt-3 text-[16px] leading-relaxed text-bone-300">{p}</p>
            ))}
            {s.list && (
              <ul className="mt-4 space-y-2.5">
                {s.list.map((item) => (
                  <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-bone-300">
                    <Check size={17} className="mt-0.5 shrink-0 text-accent-500" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {/* CTA */}
      <Card className="mt-12 overflow-hidden p-8 text-center sm:p-10">
        <h2 className="font-serif text-2xl tracking-tight text-bone-100 sm:text-3xl">{g.cta.heading}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-bone-500">{g.cta.body}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LinkButton href={g.cta.primaryHref} size="lg">
            {g.cta.primaryLabel} <ArrowRight size={16} />
          </LinkButton>
          <LinkButton href={g.cta.secondaryHref} variant="outline" size="lg">
            {g.cta.secondaryLabel}
          </LinkButton>
        </div>
      </Card>

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="mb-6 font-serif text-2xl tracking-tight text-bone-100">Frequently asked</h2>
        <div className="divide-y divide-black/8 rounded-2xl border border-black/8 bg-ink-900">
          {g.faqs.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-bone-100">
                {f.q}
                <span className="text-bone-500 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2.5 text-sm leading-relaxed text-bone-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* related */}
      <section className="mt-14">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-bone-500">Keep reading</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {related.map((r) => (
            <Link key={r.slug} href={`/guides/${r.slug}`} className="group">
              <Card className="h-full p-5 transition hover:shadow-lift">
                <h3 className="text-sm font-medium leading-snug text-bone-100 group-hover:text-accent-600">{r.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-xs text-bone-500">Read <ArrowRight size={12} /></span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Link href="/guides" className="mt-12 inline-flex items-center gap-1.5 text-sm text-bone-500 hover:text-bone-300">
        <ArrowLeft size={14} /> All guides
      </Link>
    </article>
  );
}
