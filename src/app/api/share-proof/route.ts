import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// Hosts we accept a launch post from.
const ALLOWED = [
  "x.com",
  "www.x.com",
  "twitter.com",
  "www.twitter.com",
  "linkedin.com",
  "www.linkedin.com",
];

/**
 * A founder shared their launch and is claiming the second dofollow link.
 *
 * We check ownership and that the URL really points at a post on X or LinkedIn.
 * We deliberately don't try to fetch the post itself — both platforms serve
 * login walls to servers, so a fetch would fail for genuine posts and prove
 * nothing about fake ones. The link is stored and shown publicly on the launch
 * wall, which makes a bogus submission trivially visible and easy to pull.
 */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { startupId?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const startupId = body.startupId?.trim();
  const raw = (body.url || "").trim();
  if (!startupId || !raw) {
    return NextResponse.json({ error: "Missing the startup or the post link." }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a link." }, { status: 400 });
  }
  if (!ALLOWED.includes(parsed.hostname.toLowerCase())) {
    return NextResponse.json(
      { error: "Please paste the link to your post on X or LinkedIn." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Ownership check — you can only claim this for your own listing.
  const { data: startup } = await admin
    .from("startups")
    .select("id, founder_id")
    .eq("id", startupId)
    .single();
  if (!startup) return NextResponse.json({ error: "That listing doesn't exist." }, { status: 404 });
  if (startup.founder_id !== user.id) {
    return NextResponse.json({ error: "That isn't your listing." }, { status: 403 });
  }

  const { error } = await admin
    .from("startups")
    .update({ share_url: parsed.toString(), share_verified: true })
    .eq("id", startupId);

  if (error) return NextResponse.json({ error: "Couldn't save that. Try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
