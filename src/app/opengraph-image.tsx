import { ImageResponse } from "next/og";

// The site's social card — editorial black & white, like a printed register
// page, not a generic SaaS gradient. Real one-line promise, mono ledger footer.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Saasgrave — the marketplace for dead startups";

export default function OG() {
  const ink = "#14151a";
  const paper = "#f6f5f1";
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: paper,
          color: ink,
          padding: 72,
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", inset: 24, border: `1.5px solid ${ink}` }} />
        <div style={{ position: "absolute", inset: 32, border: `1px solid ${ink}22` }} />

        {/* top ledger rule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: mono,
            fontSize: 20,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#5b5c63",
          }}
        >
          <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
            <path d="M8 28V14.2a8 8 0 0 1 16 0V28a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z" fill={ink} />
            <path d="M16 10.4v6.6M13.4 13.4h5.2" stroke={paper} strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Saasgrave — est. graveyard
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 700,
            letterSpacing: -3,
            lineHeight: 1.02,
            marginTop: 34,
            maxWidth: 980,
          }}
        >
          Your dead startup is still worth money.
        </div>

        <div style={{ display: "flex", fontSize: 30, marginTop: 26, color: "#3a3b42", maxWidth: 900 }}>
          List it in 3 minutes. It doesn&apos;t have to die twice.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 72,
            right: 72,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: mono,
            fontSize: 20,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: ink,
          }}
        >
          <span>Free to list · $9 to sell · 0% commission</span>
          <span style={{ color: "#5b5c63" }}>saasgrave.org</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
