import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const KINDS = ["story", "win", "question", "show"];

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to post." }, { status: 401 });

  let body: { title?: string; body?: string; kind?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const title = (body.title || "").trim().slice(0, 140);
  if (!title) return NextResponse.json({ error: "A title is required." }, { status: 400 });
  const kind = KINDS.includes(body.kind || "") ? body.kind : "story";

  const { data, error } = await supabase
    .from("community_posts")
    .insert({ author_id: user.id, title, body: (body.body || "").trim().slice(0, 4000) || null, kind })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id });
}
