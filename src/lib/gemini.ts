// ─── Gemini helper ──────────────────────────────────────────
// Server-only. Turns a founder's raw listing fields into a warm, honest
// "story-mode" narrative other founders can learn from. Uses the REST API so
// there's no SDK dependency. Set GEMINI_API_KEY in the environment.

const MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash-latest";

export type StoryInput = {
  name: string;
  tagline?: string;
  about?: string;
  category?: string;
  outcome?: string; // shutdown | pivot
  failure_reason?: string;
  failure_detail?: string;
  lessons_learned?: string;
  total_users?: number | string;
  claimed_mrr?: number | string;
  tech_stack?: string;
};

export async function generateStory(input: StoryInput): Promise<string> {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) throw new Error("AI is not configured — set GEMINI_API_KEY.");

  const pivoted = input.outcome === "pivot";
  const facts = [
    `Name: ${input.name}`,
    input.tagline && `Tagline: ${input.tagline}`,
    input.category && `Category: ${input.category}`,
    input.about && `What it was: ${input.about}`,
    `Outcome: ${pivoted ? "pivoted away from it" : "shut it down"}`,
    input.failure_reason && `Main reason: ${input.failure_reason}`,
    input.failure_detail && `What happened: ${input.failure_detail}`,
    input.lessons_learned && `Lessons the founder noted: ${input.lessons_learned}`,
    input.total_users && `Total users reached: ${input.total_users}`,
    input.claimed_mrr && Number(input.claimed_mrr) > 0 && `Peak MRR: $${input.claimed_mrr}/mo`,
    input.tech_stack && `Built with: ${input.tech_stack}`,
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are writing a short, honest "post-mortem story" for a marketplace of dead and pivoted startups. Founders read these to learn from each other.

Write in third person about the founder and their product. Be warm, specific, and human — never corporate or hyped. No emojis. No markdown headings. 150–220 words.

Structure it as 3 short paragraphs:
1) What they set out to build and why it mattered.
2) What actually happened — the honest turning point where it ${pivoted ? "pivoted" : "died"}.
3) The lesson another founder should take from it.

Only use the facts below. Do not invent metrics, names, or events. If a detail is missing, keep it general rather than fabricating.

FACTS:
${facts}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 512, topP: 0.95 },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`Gemini failed (${res.status}): ${text}`);
    if (res.status === 400 || res.status === 403) {
      throw new Error("AI couldn't run — check that GEMINI_API_KEY is valid and enabled.");
    }
    throw new Error("AI is busy right now. Please try again in a moment.");
  }

  const data = await res.json();
  const story: string =
    data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join("").trim() || "";
  if (!story) throw new Error("AI returned an empty story. Try again.");
  return story;
}
