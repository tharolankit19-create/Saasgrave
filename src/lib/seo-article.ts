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

  return `Write an original, in-depth article (900-1200 words) analysing the post-mortem of a real startup listed on Saasgrave, a marketplace for dead and pivoted startups.

This page has to earn organic search traffic on its own, so write it the way a
strong human editor would — not as filler.

Structure (Markdown, no top-level H1 — the page supplies it):
- Open with 2-3 sentences that answer "what was ${s.name} and why did it die?" directly. Someone arriving from a search result should get the answer immediately, not an introduction.
- Then 4-6 "## " sections with specific, descriptive headings. Write real headings ("Why ${s.name} ran out of users before it ran out of money"), never generic ones ("Introduction", "Conclusion", "Overview").
- Use short paragraphs. Use a bulleted list only where it genuinely helps.
- Close with a "## What a buyer gets" section covering the concrete assets — the codebase, the domain, existing users, the lesson — and one sentence saying it's listed on Saasgrave and can be acquired or revived.

Voice:
- Third person, plain English, concrete and genuinely useful to another founder.
- No hype, no emojis, no "in today's fast-paced world", no summarising what you're about to say.
- Name the specific mistake plainly. Founders read these to avoid repeating them.

Accuracy — this matters more than length:
- Use ONLY the facts below. NEVER invent metrics, dates, funding rounds, investors, customer names or events.
- If something isn't given, either leave it out or speak generally. Do not guess numbers.
- If the facts are thin, write a shorter, honest article rather than padding it.

FACTS:
${facts}`;
}

// Returns cached article, or generates + persists one. Returns null if AI isn't
// configured or generation fails (the page then degrades gracefully).
// `force` re-runs the model even when a cached article exists — the admin
// panel's "regenerate" uses it; page views never do.
export async function getOrCreateArticle(
  s: ArticleStartup,
  { force = false, throwOnError = false }: { force?: boolean; throwOnError?: boolean } = {}
): Promise<string | null> {
  if (!force && s.seo_article && s.seo_article.trim().length > 200) return s.seo_article;
  try {
    const body = await aiComplete(prompt(s), 2200);
    const text = body?.trim();
    if (!text || text.length < 200) {
      // Too short to be a real article — say so rather than silently keeping
      // whatever was cached.
      if (throwOnError) throw new Error("The model returned too little text to publish.");
      return s.seo_article || null;
    }
    try {
      const admin = createAdminClient();
      const { error } = await admin
        .from("startups")
        .update({ seo_article: text, seo_article_at: new Date().toISOString() })
        .eq("id", s.id);
      if (error) {
        console.error("seo-article: save failed:", error.message);
        if (throwOnError) throw new Error(`Generated, but couldn't save: ${error.message}`);
      }
    } catch (e) {
      if (throwOnError) throw e;
      /* on a page view the cache write is best-effort */
    }
    return text;
  } catch (e) {
    // A page view degrades quietly; the admin panel needs the real reason, or
    // there's no way to tell a missing key from a retired model.
    console.error("seo-article: generation failed:", (e as Error)?.message || e);
    if (throwOnError) throw e;
    return s.seo_article || null;
  }
}
