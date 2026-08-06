import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

// The Obituary Card. Every listing gets an auto-generated dark "death
// certificate" that unfurls whenever a founder shares the link on LinkedIn or
// X — zero effort for them, free reach for the graveyard. The card leans into
// the core IP (a dignified burial) rather than diluting it. Real data only.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A startup laid to rest on Saasgrave";

function yearOf(d?: string | null): number | null {
  if (!d) return null;
  const y = new Date(d).getFullYear();
  return Number.isFinite(y) ? y : null;
}

export default async function Image({ params }: { params: { slug: string } }) {
  // Anon, cookie-free read — listed startups are publicly readable.
  let s: {
    name?: string;
    category?: string | null;
    tagline?: string | null;
    failure_reason?: string | null;
    outcome?: string | null;
    started_at?: string | null;
    ended_at?: string | null;
    total_users?: number | null;
    verified_mrr?: number | null;
    revenue_verified?: boolean | null;
  } | null = null;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { data } = await supabase
      .from("startups")
      .select(
        "name, category, tagline, failure_reason, outcome, started_at, ended_at, total_users, verified_mrr, revenue_verified"
      )
      .eq("slug", params.slug)
      .single();
    s = data;
  } catch {
    /* fall through to a graceful generic card */
  }

  const rawName = s?.name || "A startup";
  const name = rawName.length > 42 ? rawName.slice(0, 40).trimEnd() + "…" : rawName;
  const nameSize = name.length > 28 ? 62 : name.length > 16 ? 82 : 104;
  const pivoted = s?.outcome === "pivot";
  const born = yearOf(s?.started_at);
  const died = yearOf(s?.ended_at);
  const lifespan = born ? `${born} — ${died ?? "†"}` : "In memoriam";
  const cause =
    (s?.failure_reason && s.failure_reason.slice(0, 90)) ||
    (s?.tagline && s.tagline.slice(0, 90)) ||
    "Ran out of runway, not out of worth.";

  // One honest, standout metric — verified revenue if present, else users.
  let metric: { label: string; value: string } | null = null;
  if (s?.revenue_verified && (s?.verified_mrr || 0) > 0) {
    metric = { label: "Verified MRR at death", value: `$${Math.round(s!.verified_mrr!).toLocaleString()}/mo` };
  } else if ((s?.total_users || 0) > 0) {
    metric = { label: "Users left behind", value: (s!.total_users as number).toLocaleString() };
  }

  const ink = "#14151a";
  const paper = "#f6f5f1";
  const muted = "#5b5c63";
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: paper,
          color: ink,
          padding: 56,
          position: "relative",
        }}
      >
        {/* certificate frame */}
        <div style={{ position: "absolute", inset: 24, border: `1.5px solid ${ink}` }} />
        <div style={{ position: "absolute", inset: 34, border: `1px solid ${ink}22` }} />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: mono,
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: muted,
          }}
        >
          Certificate of death
        </div>

        <div
          style={{
            marginTop: 26,
            display: "flex",
            textAlign: "center",
            color: ink,
            fontSize: nameSize,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.02,
            maxWidth: 1000,
          }}
        >
          {name}
        </div>

        <div style={{ marginTop: 18, fontFamily: mono, color: muted, fontSize: 28, letterSpacing: 2 }}>{lifespan}</div>

        <div style={{ marginTop: 26, display: "flex", gap: 12, alignItems: "center" }}>
          {s?.category ? (
            <div style={{ display: "flex", color: ink, fontSize: 22, border: `1px solid ${ink}55`, padding: "7px 18px" }}>
              {s.category}
            </div>
          ) : null}
          <div style={{ display: "flex", color: ink, fontSize: 22, border: `1px solid ${ink}55`, padding: "7px 18px" }}>
            {pivoted ? "Pivoted" : "Shut down"}
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            display: "flex",
            textAlign: "center",
            color: "#3a3b42",
            fontSize: 30,
            fontStyle: "italic",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          “{cause}”
        </div>

        {metric ? (
          <div style={{ marginTop: 22, display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontFamily: mono, color: ink, fontSize: 36, fontWeight: 700 }}>{metric.value}</span>
            <span style={{ color: muted, fontSize: 22 }}>{metric.label}</span>
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            bottom: 46,
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            paddingLeft: 34,
            paddingRight: 34,
            fontFamily: mono,
            fontSize: 20,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: muted,
          }}
        >
          <span style={{ color: ink }}>saasgrave.org</span>
          <span>Rest in production</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
