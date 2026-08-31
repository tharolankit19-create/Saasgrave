import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scrapeSite, normalizeSiteUrl } from "@/lib/firecrawl";
import { aiComplete } from "@/lib/gemini";
import { CATEGORIES } from "@/lib/listing-options";

// Reads a founder's live site and turns it into the product half of a listing,
// so nobody has to type out what their own landing page already says.
//
// Deliberately limited to what a page can actually evidence: name, tagline,
// what it did, category, stack. The post-mortem (why it died, the numbers) is
// never guessed — inventing that would put words in the founder's mouth.
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Auth required, or this is a free scraper + AI proxy for anyone.
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const url = normalizeSiteUrl(body.url || "");
  if (!url) {
    return NextResponse.json({ error: "That doesn't look like a website address." }, { status: 400 });
  }

  try {
    const site = await scrapeSite(url);

    const prompt = `You are filling in a marketplace listing for a startup, using only its own website.

Return ONLY a JSON object — no prose, no markdown fence — with exactly these keys:
{
  "name": "the product's name",
  "tagline": "one line, under 90 characters, what it does",
  "about": "2-4 plain sentences: what it did and who it was for",
  "category": "exactly one of: ${CATEGORIES.join(" | ")}",
  "tech_stack": "comma-separated technologies you can actually tell it uses, else an empty string"
}

Rules:
- Use only what the page supports. Never invent metrics, prices, dates or a reason it shut down.
- Write "about" in past tense — this product is being listed as one that has shut down.
- If you can't tell the tech stack, return "".
- If unsure of the category, use "Other".

PAGE TITLE: ${site.title || "(none)"}
PAGE DESCRIPTION: ${site.description || "(none)"}
PAGE CONTENT:
${site.markdown}`;

    const raw = await aiComplete(prompt, 700);

    // Models like to wrap JSON in a fence or add a sentence around it.
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      return NextResponse.json(
        { error: "Couldn't make sense of that page — fill it in by hand." },
        { status: 502 }
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json(
        { error: "Couldn't make sense of that page — fill it in by hand." },
        { status: 502 }
      );
    }

    const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
    const category = CATEGORIES.includes(str(parsed.category)) ? str(parsed.category) : "Other";

    return NextResponse.json({
      fields: {
        name: str(parsed.name),
        tagline: str(parsed.tagline).slice(0, 120),
        about: str(parsed.about),
        category,
        tech_stack: str(parsed.tech_stack),
        website_url: site.url,
        // Straight from the page's own metadata — not the model's guess.
        logo_url: site.image || "",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Couldn't read that page." },
      { status: 500 }
    );
  }
}
