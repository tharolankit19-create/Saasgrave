import { ImageResponse } from "next/og";

// The site's social card. Without this, sharing saasgrave.org unfurled to a
// blank/ugly preview — this gives every link a branded, on-theme card that
// sells the one idea in a glance.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Saasgrave — Where dead startups find new life";

export default function OG() {
  const gold = "#c79a3a";
  const bone = "#eae6df";
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
          background: "radial-gradient(130% 130% at 50% -10%, #16181e 0%, #0a0b0e 55%, #060708 100%)",
          padding: 64,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 26, border: `2px solid ${gold}55`, borderRadius: 26 }} />

        {/* brand lockup */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}>
          <svg width="58" height="58" viewBox="0 0 32 32" fill="none">
            <path d="M8 28V14.2a8 8 0 0 1 16 0V28a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z" fill={bone} />
            <path d="M16 9.6v7.6M12.9 12.9h6.2" stroke={gold} strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="5.4" r="1.9" fill={gold} />
          </svg>
          <div style={{ display: "flex", color: bone, fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            Saasgrave
          </div>
        </div>

        <div style={{ color: gold, fontSize: 22, letterSpacing: 6, textTransform: "uppercase", marginTop: 22 }}>
          The marketplace for dead startups
        </div>

        <div
          style={{
            display: "flex",
            textAlign: "center",
            color: bone,
            fontSize: 82,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
            marginTop: 20,
            maxWidth: 980,
          }}
        >
          Your dead startup is still worth money.
        </div>

        <div
          style={{
            display: "flex",
            textAlign: "center",
            color: "#a7adb8",
            fontSize: 30,
            marginTop: 26,
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          List it in 3 minutes. Free to list · $9 to sell · 0% commission.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 50,
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            paddingLeft: 34,
            paddingRight: 34,
            fontSize: 24,
            letterSpacing: 3,
          }}
        >
          <span style={{ color: gold, letterSpacing: 4 }}>SAASGRAVE.ORG</span>
          <span style={{ color: "#6b7078" }}>Rest in production.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
