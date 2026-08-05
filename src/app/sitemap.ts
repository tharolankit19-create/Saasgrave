import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { GUIDES } from "@/lib/guides";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.com";
  const now = new Date();

  const staticPaths = ["", "/browse", "/sales", "/sell", "/guides", "/login", "/register"].map((path) => ({
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
      startupPaths = data.map((s: any) => ({
        url: `${base}/startup/${s.slug}`,
        lastModified: s.updated_at ? new Date(s.updated_at) : now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
      const founders = Array.from(new Set(data.map((s: any) => s.founder_id).filter(Boolean)));
      founderPaths = founders.map((id) => ({
        url: `${base}/profile/${id}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      }));
    }
  } catch {
    // No DB configured — ship the static + guide URLs alone.
  }

  return [...staticPaths, ...guidePaths, ...startupPaths, ...founderPaths];
}
