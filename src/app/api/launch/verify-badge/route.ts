import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { containsLaunchBadge, readLandingPage } from "@/lib/badge-verification";

export const runtime = "nodejs";
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "Please sign in again." },
      { status: 401 },
    );
  const input = z
    .object({
      startupId: z.string().uuid(),
      websiteUrl: z.string().url().max(2048),
    })
    .safeParse(await req.json().catch(() => null));
  if (!input.success)
    return NextResponse.json(
      { error: "Enter a valid landing-page URL." },
      { status: 400 },
    );
  const { data: startup } = await supabase
    .from("startups")
    .select("id, slug, status, website_url")
    .eq("id", input.data.startupId)
    .eq("founder_id", user.id)
    .single();
  if (!startup || startup.status !== "draft")
    return NextResponse.json(
      { error: "Open an unpublished draft to verify its badge." },
      { status: 409 },
    );
  const admin = createAdminClient();
  // Persistent, atomic rate limit; not a per-process counter on serverless.
  const { data: locked, error: lockError } = await admin
    .from("startups")
    .update({ badge_check_at: new Date().toISOString() })
    .eq("id", startup.id)
    .or(
      `badge_check_at.is.null,badge_check_at.lt.${new Date(Date.now() - 15000).toISOString()}`,
    )
    .select("id")
    .maybeSingle();
  if (lockError)
    return NextResponse.json(
      { error: "Verification is temporarily unavailable." },
      { status: 503 },
    );
  if (!locked)
    return NextResponse.json(
      { error: "Please wait 15 seconds before checking again." },
      { status: 429 },
    );
  try {
    const page = await readLandingPage(input.data.websiteUrl);
    const site = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";
    if (!containsLaunchBadge(page.html, page.url, site, startup.slug)) {
      return NextResponse.json(
        {
          error:
            "Badge not found. Put the exact linked badge on your public landing page, deploy the change, then retry. It must be in the page HTML, not injected only after JavaScript runs.",
        },
        { status: 422 },
      );
    }
    const { data, error } = await admin
      .from("startups")
      .update({
        website_url: page.url,
        badge_verified_url: page.url,
        badge_verified_at: new Date().toISOString(),
        status: "listed",
      })
      .eq("id", startup.id)
      .eq("slug", startup.slug)
      .eq("founder_id", user.id)
      .eq("status", "draft")
      .select("slug")
      .single();
    if (error || !data)
      throw new Error("Could not publish this draft. Refresh and retry.");
    return NextResponse.json({ url: `/startup/${data.slug}?launched=1` });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Couldn't reach your website. Please retry.",
      },
      { status: 422 },
    );
  }
}
