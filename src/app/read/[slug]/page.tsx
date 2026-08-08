import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateArticle } from "@/lib/seo-article";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";

const FIELDS =
  "id, name, slug, tagline, category, about, outcome, failure_reason, failure_detail, biggest_mistake, lessons_learned, retention, total_users, claimed_mrr, verified_mrr, revenue_verified, tech_stack, website_url, created_at, updated_at, seo_article";

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  const t = url.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase
    .from("startups")
    .select("name, tagline, failure_reason, category, created_at, updated_at")
    .eq("slug", params.slug)
    .single();
  if (!data) return { title: "Not found" };

  const title = `${data.name}: ${data.failure_reason || "a startup post-mortem"}`;
  const description =
    data.tagline ||
    `An honest post-mortem of ${data.name} — what it built, what went wrong, and what a buyer could still do with it.`;
  const url = `${BASE}/read/${params.slug}`;
  // The listing's own certificate card, so a shared article previews properly.
  const image = `${BASE}/startup/${params.slug}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      `${data.name}`,
      `why ${data.name} failed`,
      `${data.name} post-mortem`,
      data.category ? `failed ${data.category} startup` : "failed startup",
      "startup post-mortem",
      "buy a failed startup",
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: "Saasgrave",
      publishedTime: data.created_at ?? undefined,
      modifiedTime: data.updated_at ?? data.created_at ?? undefined,
      images: [{ url: image, width: 1200, height: 630, alt: `${data.name} — certificate of death` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export const dynamic = "force-dynamic";

/** Stable, readable anchor for a heading — lets search engines deep-link sections. */
function anchor(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/** The H2s, in order — used for the contents list. */
function headings(md: string): string[] {
  return md
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.startsWith("## "))
    .map((b) => b.replace(/^##\s+/, ""));
}

// Minimal, safe markdown → blocks (## headings + paragraphs + simple bullets).
function renderBody(md: string) {
  const blocks = md.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      const text = block.replace(/^##\s+/, "");
      return (
        <h2
          key={i}
          id={anchor(text)}
          className="mt-8 scroll-mt-24 text-xl font-bold tracking-tight text-bone-100"
        >
          {text}
        </h2>
      );
    }
    if (/^[-*]\s+/m.test(block)) {
      const items = block.split(/\n/).map((l) => l.replace(/^[-*]\s+/, "").trim()).filter(Boolean);
      return (
        <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-bone-300">
          {items.map((it, j) => (
            <li key={j}>{it}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="mt-4 text-[15px] leading-relaxed text-bone-300">
        {block}
      </p>
    );
  });
}

export default async function ReadPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: s } = await supabase.from("startups").select(FIELDS).eq("slug", params.slug).eq("status", "listed").single();
  if (!s) notFound();

  const article = await getOrCreateArticle(s as any);
  if (!article) notFound(); // no AI configured yet and nothing cached

  const site = normalizeUrl(s.website_url);
  const listingUrl = `${BASE}/startup/${s.slug}`;
  const toc = headings(article);

  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: `${s.name}: ${s.failure_reason || "a startup post-mortem"}`,
                description: s.tagline || undefined,
                datePublished: s.created_at,
                dateModified: s.updated_at || s.created_at,
                wordCount: article.split(/\s+/).filter(Boolean).length,
                articleSection: s.category || "Startup post-mortem",
                inLanguage: "en",
                image: [`${BASE}/startup/${s.slug}/opengraph-image`],
                author: { "@type": "Organization", name: "Saasgrave", url: BASE },
                publisher: {
                  "@type": "Organization",
                  name: "Saasgrave",
                  url: BASE,
                  logo: { "@type": "ImageObject", url: `${BASE}/icon` },
                },
                mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/read/${s.slug}` },
                about: { "@type": "Thing", name: s.name },
              },
              {
                // Breadcrumbs give Google the path to show under the result.
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Saasgrave", item: BASE },
                  { "@type": "ListItem", position: 2, name: "Browse", item: `${BASE}/browse` },
                  { "@type": "ListItem", position: 3, name: s.name, item: `${BASE}/startup/${s.slug}` },
                  {
                    "@type": "ListItem",
                    position: 4,
                    name: "Post-mortem",
                    item: `${BASE}/read/${s.slug}`,
                  },
                ],
              },
            ],
          }),
        }}
      />

      <Link href={`/startup/${s.slug}`} className="inline-flex items-center gap-1.5 text-sm text-bone-500 transition hover:text-bone-300">
        <ArrowLeft size={14} /> Back to the listing
      </Link>

      <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600">
        Post-mortem{s.category ? ` · ${s.category}` : ""}
      </p>
      <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-bone-100 sm:text-4xl">
        {s.name}: {s.failure_reason || "a startup post-mortem"}
      </h1>
      {s.tagline && <p className="mt-3 text-[15px] text-bone-400">{s.tagline}</p>}

      {/* Contents — helps readers skim, and gives search engines the section
          links it can surface directly under the result. */}
      {toc.length >= 3 && (
        <nav aria-label="Contents" className="mt-8 rounded-2xl border border-black/8 bg-ink-900 p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-bone-500">
            In this post-mortem
          </p>
          <ol className="mt-3 space-y-1.5">
            {toc.map((h, i) => (
              <li key={h} className="flex gap-2.5 text-sm">
                <span className="font-mono text-xs text-bone-500">{String(i + 1).padStart(2, "0")}</span>
                <a href={`#${anchor(h)}`} className="text-bone-300 hover:text-accent-600">
                  {h}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="mt-8 border-t border-black/8 pt-2">{renderBody(article)}</div>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-black/8 pt-6">
        {site && (
          <a
            href={site}
            target="_blank"
            rel="noopener"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-black/12 bg-ink-900 px-5 text-sm font-medium text-bone-100 shadow-sm transition hover:shadow-card"
          >
            Visit {s.name} <ArrowUpRight size={14} />
          </a>
        )}
        <Link
          href={`/startup/${s.slug}`}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-5 text-sm font-semibold text-white shadow-glow transition hover:brightness-105"
        >
          See the listing → revive or acquire it
        </Link>
      </div>

      <p className="mt-6 text-xs text-bone-500">
        {s.name} is listed on{" "}
        <Link href={listingUrl} className="text-accent-600 hover:underline">
          Saasgrave
        </Link>{" "}
        — the marketplace for dead &amp; zero-revenue startups.
      </p>
    </article>
  );
}
