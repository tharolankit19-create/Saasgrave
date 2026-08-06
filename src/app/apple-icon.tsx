import { ImageResponse } from "next/og";

// Apple touch icon — same mark, tuned padding for the rounded iOS mask.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const gold = "#c79a3a";
  const bone = "#f2efe8";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(120% 120% at 50% 0%, #16181e 0%, #0a0b0e 70%)",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <path d="M8 28V14.2a8 8 0 0 1 16 0V28a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z" fill={bone} />
          <path d="M16 9.6v7.6M12.9 12.9h6.2" stroke={gold} strokeWidth="2" strokeLinecap="round" />
          <circle cx="16" cy="5.4" r="1.9" fill={gold} />
        </svg>
      </div>
    ),
    { ...size }
  );
}
