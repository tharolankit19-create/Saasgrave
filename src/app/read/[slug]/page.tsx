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
  const { data } = await supabase.from("startups").select("name, tagline, failure_reason").eq("slug", params.slug).single();
  if (!data) return { title: "Not found" };
  const title = `${data.name}: ${data.failure_reason || "a startup post-mortem"}`;
  const description = data.tagline || `An honest post-mortem of ${data.name} — what it built, what went wrong, and the lessons.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/read/${params.slug}` },
    openGraph: { title, description, type: "article" },
  };
}

export const dynamic = "force-dynamic";

// Minimal, safe markdown → blocks (## headings + paragraphs + simple bullets).
function renderBody(md: string) {
  const blocks = md.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="mt-8 text-xl font-bold tracking-tight text-bone-100">
          {block.replace(/^##\s+/, "")}
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

  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${s.name}: ${s.failure_reason || "a startup post-mortem"}`,
            description: s.tagline || undefined,
            datePublished: s.created_at,
            dateModified: s.updated_at || s.created_at,
            publisher: { "@type": "Organization", name: "Saasgrave" },
            mainEntityOfPage: `${BASE}/read/${s.slug}`,
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
