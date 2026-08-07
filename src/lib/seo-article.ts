// SEO article generator (server-only). For each listed startup we generate a
// unique, honest long-form write-up — purely for search/backlink value, not a
// public product feature. Generated once via OpenRouter (Gemini fallback), then
// cached on the startup row so crawlers don't re-trigger the model.
import { createAdminClient } from "@/lib/supabase/server";
import { aiComplete } from "@/lib/gemini";

type ArticleStartup = {
  id: string;
  name: string;
  slug: string;
  tagline?: string | null;
  category?: string | null;
  about?: string | null;
  outcome?: string | null;
  failure_reason?: string | null;
  failure_detail?: string | null;
  biggest_mistake?: string | null;
  lessons_learned?: string | null;
  retention?: string | null;
  total_users?: number | null;
  claimed_mrr?: number | null;
  verified_mrr?: number | null;
  revenue_verified?: boolean | null;
  tech_stack?: string | null;
  seo_article?: string | null;
};

function prompt(s: ArticleStartup): string {
  const pivoted = s.outcome === "pivot";
  const facts = [
    `Startup: ${s.name}`,
    s.tagline && `Tagline: ${s.tagline}`,
    s.category && `Category: ${s.category}`,
    s.about && `What it was: ${s.about}`,
    `Outcome: ${pivoted ? "pivoted" : "shut down"}`,
    s.failure_reason && `Cause of death: ${s.failure_reason}`,
    s.failure_detail && `What happened: ${s.failure_detail}`,
    s.biggest_mistake && `Biggest mistake: ${s.biggest_mistake}`,
    s.lessons_learned && `Lessons: ${s.lessons_learned}`,
    s.retention && `Retention notes: ${s.retention}`,
    (s.total_users || 0) > 0 && `Users reached: ${s.total_users}`,
    s.revenue_verified && (s.verified_mrr || 0) > 0 && `Verified MRR: $${s.verified_mrr}/mo`,
    s.tech_stack && `Built with: ${s.tech_stack}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `Write an original, SEO-friendly article (about 500-650 words) analysing the post-mortem of a real startup listed on a marketplace for dead and pivoted startups.

Rules:
- Third person, plain English, genuinely useful to other founders. No hype, no emojis.
- Use Markdown: a few "## " subheadings and short paragraphs. Do NOT include a top-level H1 (the page adds it).
- Only use the facts provided. NEVER invent metrics, dates, funding, names or events. If a detail is missing, stay general instead of fabricating.
- Cover: what it set out to do, what actually went wrong, the concrete lessons, and what an acquirer could still do with the assets (code, domain, users).
- End with one sentence noting the product is listed on Saasgrave and can be revived or acquired.

FACTS:
${facts}`;
}

// Returns cached article, or generates + persists one. Returns null if AI isn't
// configured or generation fails (the page then degrades gracefully).
export async function getOrCreateArticle(s: ArticleStartup): Promise<string | null> {
  if (s.seo_article && s.seo_article.trim().length > 200) return s.seo_article;
  try {
    const body = await aiComplete(prompt(s), 1100);
    const text = body?.trim();
    if (!text || text.length < 200) return s.seo_article || null;
    try {
      const admin = createAdminClient();
      await admin.from("startups").update({ seo_article: text, seo_article_at: new Date().toISOString() }).eq("id", s.id);
    } catch {
      /* cache write is best-effort */
    }
    return text;
  } catch {
    return s.seo_article || null;
  }
}
