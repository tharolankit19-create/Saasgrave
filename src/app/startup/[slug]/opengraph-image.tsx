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

  const gold = "#c79a3a";
  const bone = "#e9e6df";

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
          background: "radial-gradient(120% 120% at 50% 0%, #14161b 0%, #0a0b0e 60%, #060708 100%)",
          padding: 56,
          position: "relative",
        }}
      >
        {/* engraved frame */}
        <div
          style={{
            position: "absolute",
            inset: 26,
            border: `2px solid ${gold}66`,
            borderRadius: 24,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 36,
            border: `1px solid ${gold}33`,
            borderRadius: 18,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: gold,
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
          }}
        >
          <span style={{ fontSize: 30, fontWeight: 700 }}>†</span> In loving memory
        </div>

        <div
          style={{
            marginTop: 26,
            display: "flex",
            textAlign: "center",
            color: bone,
            fontSize: nameSize,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.02,
            maxWidth: 1000,
          }}
        >
          {name}
        </div>

        <div style={{ marginTop: 20, color: "#9aa0ab", fontSize: 30, letterSpacing: 2 }}>{lifespan}</div>

        <div
          style={{
            marginTop: 28,
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          {s?.category ? (
            <div
              style={{
                display: "flex",
                color: "#c8ccd3",
                fontSize: 24,
                border: "1px solid #2a2e36",
                borderRadius: 999,
                padding: "8px 20px",
              }}
            >
              {s.category}
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              color: pivoted ? gold : "#c8ccd3",
              fontSize: 24,
              border: `1px solid ${pivoted ? gold + "55" : "#2a2e36"}`,
              borderRadius: 999,
              padding: "8px 20px",
            }}
          >
            {pivoted ? "Pivoted" : "Shut down"}
          </div>
        </div>

        <div
          style={{
            marginTop: 30,
            display: "flex",
            textAlign: "center",
            color: "#aeb4bf",
            fontSize: 30,
            fontStyle: "italic",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          “{cause}”
        </div>

        {metric ? (
          <div style={{ marginTop: 24, display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ color: gold, fontSize: 38, fontWeight: 700 }}>{metric.value}</span>
            <span style={{ color: "#7d828c", fontSize: 23 }}>{metric.label}</span>
          </div>
        ) : null}

        <div
          style={{
            position: "absolute",
            bottom: 46,
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            paddingLeft: 30,
            paddingRight: 30,
            color: "#6b7078",
            fontSize: 24,
            letterSpacing: 3,
          }}
        >
          <span style={{ color: gold, letterSpacing: 4 }}>SAASGRAVE.ORG</span>
          <span>Rest in production.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
