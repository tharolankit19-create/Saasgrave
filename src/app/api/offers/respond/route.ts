import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const ACTIONS = ["accepted", "rejected"];

// The seller (startup founder) accepts or rejects an offer. Ownership is
// verified server-side before the status is changed.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { offerId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.offerId || !ACTIONS.includes(body.action || "")) {
    return NextResponse.json({ error: "Missing offer or action" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: offer } = await admin
    .from("offers")
    .select("id, startup_id, startups!inner(founder_id)")
    .eq("id", body.offerId)
    .single();

  const founderId = (offer as any)?.startups?.founder_id;
  if (!offer || founderId !== user.id) {
    return NextResponse.json({ error: "Not your offer to answer." }, { status: 403 });
  }

  const { error } = await admin.from("offers").update({ status: body.action }).eq("id", body.offerId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: body.action });
}
