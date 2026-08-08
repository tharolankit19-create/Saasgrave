import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { GUIDES } from "@/lib/guides";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";
  const now = new Date();

  const staticPaths = ["", "/browse", "/sales", "/sell", "/pricing", "/wall", "/guides", "/guides/write", "/community", "/support", "/login", "/register"].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const guidePaths = GUIDES.map((g) => ({
    url: `${base}/guides/${g.slug}`,
    lastModified: new Date(g.updated),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Founder-written stories — real, unique content that should be indexed.
  let founderGuidePaths: MetadataRoute.Sitemap = [];

  // Every listed startup and its founder — real pages that should be indexed so
  // they rank and pass a link back to each founder's site.
  let startupPaths: MetadataRoute.Sitemap = [];
  let founderPaths: MetadataRoute.Sitemap = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("startups")
      .select("slug, founder_id, updated_at")
      .eq("status", "listed")
      .order("updated_at", { ascending: false })
      .limit(5000);

    if (data) {
      startupPaths = data.flatMap((s: any) => [
        {
          url: `${base}/startup/${s.slug}`,
          lastModified: s.updated_at ? new Date(s.updated_at) : now,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        },
        // The AI-written long-form post-mortem — unique content for search.
        {
          url: `${base}/read/${s.slug}`,
          lastModified: s.updated_at ? new Date(s.updated_at) : now,
          changeFrequency: "monthly" as const,
          priority: 0.55,
        },
      ]);
      const founders = Array.from(new Set(data.map((s: any) => s.founder_id).filter(Boolean)));
      founderPaths = founders.map((id) => ({
        url: `${base}/profile/${id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
    }

    const { data: fg } = await supabase
      .from("founder_guides")
      .select("slug, created_at")
      .eq("published", true)
      .limit(2000);
    if (fg) {
      founderGuidePaths = fg.map((g: any) => ({
        url: `${base}/guides/f/${g.slug}`,
        lastModified: g.created_at ? new Date(g.created_at) : now,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
    }
  } catch {
    // No DB configured — ship the static + guide URLs alone.
  }

  return [...staticPaths, ...guidePaths, ...founderGuidePaths, ...startupPaths, ...founderPaths];
}
