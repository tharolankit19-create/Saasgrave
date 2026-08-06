import { ImageResponse } from "next/og";

// App icon — the Saasgrave headstone in gold on a dark, engraved tile. Renders
// the same mark used across the brand so it reads in browser tabs and Google
// search results, not just on the site.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 110,
        }}
      >
        <svg width="300" height="300" viewBox="0 0 32 32" fill="none">
          {/* headstone body */}
          <path d="M8 28V14.2a8 8 0 0 1 16 0V28a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z" fill={bone} />
          {/* inlaid gold cross */}
          <path
            d="M16 9.6v7.6M12.9 12.9h6.2"
            stroke={gold}
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* ascending ember */}
          <circle cx="16" cy="5.4" r="1.9" fill={gold} />
          <circle cx="19.6" cy="7" r="0.8" fill={gold} opacity="0.7" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
