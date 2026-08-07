// ─── AI story helper ────────────────────────────────────────
// Server-only. Turns a founder's raw listing fields into a warm, honest
// "story-mode" narrative other founders can learn from.
//
// Provider order: OpenRouter (set OPENROUTER_API_KEY, e.g. an NVIDIA Nemotron
// model) is used first; Gemini (GEMINI_API_KEY) is the fallback. Whichever is
// configured works — no code change needed to switch.

export type StoryInput = {
  name: string;
  tagline?: string;
  about?: string;
  category?: string;
  outcome?: string; // shutdown | pivot
  failure_reason?: string;
  failure_detail?: string;
  lessons_learned?: string;
  biggest_mistake?: string;
  cac?: number | string;
  retention?: string;
  total_users?: number | string;
  claimed_mrr?: number | string;
  tech_stack?: string;
};

function buildPrompt(input: StoryInput) {
  const pivoted = input.outcome === "pivot";
  const facts = [
    `Name: ${input.name}`,
    input.tagline && `Tagline: ${input.tagline}`,
    input.category && `Category: ${input.category}`,
    input.about && `What it was: ${input.about}`,
    `Outcome: ${pivoted ? "pivoted away from it" : "shut it down"}`,
    input.failure_reason && `Main reason: ${input.failure_reason}`,
    input.failure_detail && `What happened: ${input.failure_detail}`,
    input.biggest_mistake && `Biggest mistake: ${input.biggest_mistake}`,
    input.lessons_learned && `Lessons the founder noted: ${input.lessons_learned}`,
    input.cac && Number(input.cac) > 0 && `Customer acquisition cost: $${input.cac}`,
    input.retention && `Retention: ${input.retention}`,
    input.total_users && `Total users reached: ${input.total_users}`,
    input.claimed_mrr && Number(input.claimed_mrr) > 0 && `Peak MRR: $${input.claimed_mrr}/mo`,
    input.tech_stack && `Built with: ${input.tech_stack}`,
  ]
    .filter(Boolean)
    .join("\n");

  return `You are writing a short, honest "post-mortem story" for a marketplace of dead and pivoted startups. Founders read these to learn from each other.

Write in third person about the founder and their product. Be warm, specific, and human — never corporate or hyped. No emojis. No markdown headings. 150–220 words.

Structure it as 3 short paragraphs:
1) What they set out to build and why it mattered.
2) What actually happened — the honest turning point where it ${pivoted ? "pivoted" : "died"}.
3) The lesson another founder should take from it.

Only use the facts below. Do not invent metrics, names, or events. If a detail is missing, keep it general rather than fabricating.

FACTS:
${facts}`;
}

export async function generateStory(input: StoryInput): Promise<string> {
  if (!input.name?.trim()) throw new Error("Add a name first, then generate.");
  const prompt = buildPrompt(input);
  return aiComplete(prompt, 600);
}

// Generic completion — OpenRouter first, Gemini fallback. Reused by the SEO
// article generator. Returns "" if no provider is configured (callers decide).
export async function aiComplete(prompt: string, maxTokens = 900): Promise<string> {
  if (process.env.OPENROUTER_API_KEY?.trim()) return viaOpenRouter(prompt, maxTokens);
  if (process.env.GEMINI_API_KEY?.trim()) return viaGemini(prompt, maxTokens);
  throw new Error("AI is not configured — set OPENROUTER_API_KEY (or GEMINI_API_KEY).");
}

async function viaOpenRouter(prompt: string, maxTokens = 600): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY!.trim();
  const model = process.env.OPENROUTER_MODEL?.trim() || "nvidia/llama-3.1-nemotron-70b-instruct";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": site,
      "X-Title": "Saasgrave",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`OpenRouter failed (${res.status}): ${text}`);
    if (res.status === 401) throw new Error("AI couldn't run — check OPENROUTER_API_KEY.");
    throw new Error("AI is busy right now. Please try again in a moment.");
  }
  const data = await res.json();
  const story: string = data?.choices?.[0]?.message?.content?.trim() || "";
  if (!story) throw new Error("AI returned an empty story. Try again.");
  return story;
}

async function viaGemini(prompt: string, maxTokens = 512): Promise<string> {
  const key = process.env.GEMINI_API_KEY!.trim();
  const model = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: maxTokens, topP: 0.95 },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`Gemini failed (${res.status}): ${text}`);
    if (res.status === 400 || res.status === 403) throw new Error("AI couldn't run — check GEMINI_API_KEY.");
    throw new Error("AI is busy right now. Please try again in a moment.");
  }
  const data = await res.json();
  const story: string =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("").trim() || "";
  if (!story) throw new Error("AI returned an empty story. Try again.");
  return story;
}
