import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Newsletter signup. Uses the anon-key client + an insert RLS policy, so it
// works even without the service-role key. Duplicate emails are treated as OK.
export async function POST(req: Request) {
  let email = "";
  let source = "site";
  try {
    const body = await req.json();
    email = body?.email ?? "";
    // Records which surface/section drove the signup (e.g. "popup:pricing",
    // "bar") so we can see what actually converts. Bounded and sanitised.
    if (typeof body?.source === "string" && body.source.trim()) {
      source = body.source.trim().slice(0, 40);
    }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  email = (email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({ email, source });
    // Unique-violation just means they're already subscribed — that's fine.
    if (error && !/duplicate|unique/i.test(error.message)) {
      return NextResponse.json({ error: "Couldn't subscribe. Try again." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Couldn't subscribe. Try again." }, { status: 500 });
  }
}
