import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Newsletter signup. Uses the anon-key client + an insert RLS policy, so it
// works even without the service-role key. Duplicate emails are treated as OK.
export async function POST(req: Request) {
  let email = "";
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  email = (email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email, source: "site" });
    // Unique-violation just means they're already subscribed — that's fine.
    if (error && !/duplicate|unique/i.test(error.message)) {
      return NextResponse.json({ error: "Couldn't subscribe. Try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't subscribe. Try again." }, { status: 500 });
  }
}
