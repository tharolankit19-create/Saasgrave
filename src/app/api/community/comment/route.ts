import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to comment." }, { status: 401 });

  let body: { postId?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const text = (body.body || "").trim().slice(0, 2000);
  if (!body.postId || !text) return NextResponse.json({ error: "Write something first." }, { status: 400 });

  await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id" });

  const { error } = await supabase
    .from("community_comments")
    .insert({ post_id: body.postId, author_id: user.id, body: text });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
