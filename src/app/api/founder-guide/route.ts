import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to publish a guide." }, { status: 401 });

  let body: { title?: string; summary?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const title = (body.title || "").trim().slice(0, 120);
  const text = (body.body || "").trim().slice(0, 12000);
  if (!title || text.length < 40) {
    return NextResponse.json({ error: "Add a title and at least a paragraph." }, { status: 400 });
  }

  await supabase.from("profiles").upsert({ id: user.id }, { onConflict: "id" });

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
  const { data, error } = await supabase
    .from("founder_guides")
    .insert({
      author_id: user.id,
      slug,
      title,
      summary: (body.summary || "").trim().slice(0, 200) || null,
      body: text,
      published: true,
    })
    .select("slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, slug: data.slug });
}
