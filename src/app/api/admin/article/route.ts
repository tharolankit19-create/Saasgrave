import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { getOrCreateArticle } from "@/lib/seo-article";

// Generating an article calls a model — give it room.
export const maxDuration = 60;

/**
 * Admin: publish (or regenerate) the AI write-up for any startup.
 *
 * The article is what earns the listing its search traffic and its dofollow
 * link, so being able to fire it off for a startup whose founder never will is
 * the whole point of the button.
 */
export async function POST(req: Request) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  let body: { startupId?: string; force?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.startupId) return NextResponse.json({ error: "Missing startupId" }, { status: 400 });

  const admin = createAdminClient();
  const { data: startup } = await admin
    .from("startups")
    .select("*")
    .eq("id", body.startupId)
    .single();
  if (!startup) return NextResponse.json({ error: "No such startup" }, { status: 404 });

  const article = await getOrCreateArticle(startup, { force: !!body.force });
  if (!article) {
    return NextResponse.json(
      { error: "Couldn't generate — check OPENROUTER_API_KEY (or the Gemini fallback)." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, words: article.split(/\s+/).length, slug: startup.slug });
}
