import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateStory, type StoryInput } from "@/lib/gemini";

// Generates an AI post-mortem story from the founder's listing fields. Auth
// required so it can't be abused as a free Gemini proxy.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: StoryInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Add a name first, then generate." }, { status: 400 });
  }

  try {
    const story = await generateStory(body);
    return NextResponse.json({ story });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Couldn't generate the story." }, { status: 500 });
  }
}
