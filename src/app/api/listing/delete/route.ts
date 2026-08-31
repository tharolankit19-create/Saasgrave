import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Deletes one of the caller's own listings. RLS already restricts deletes to
// the founder, but doing the check here too means a blocked delete comes back
// as a clear message rather than a silent no-op.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { startupId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  if (!body.startupId) {
    return NextResponse.json({ error: "Missing startupId" }, { status: 400 });
  }

  const { data: startup } = await supabase
    .from("startups")
    .select("id, founder_id")
    .eq("id", body.startupId)
    .single();

  if (!startup) return NextResponse.json({ error: "That listing doesn't exist." }, { status: 404 });
  if (startup.founder_id !== user.id) {
    return NextResponse.json({ error: "That isn't your listing." }, { status: 403 });
  }

  const { error } = await supabase.from("startups").delete().eq("id", body.startupId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
