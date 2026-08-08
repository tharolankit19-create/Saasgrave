import { ImageResponse } from "next/og";
import { BrandScene, BRAND } from "@/components/brand-mark";

// App icon — the graveyard mark on its red disc, the same drawing used in the
// navbar, the social cards and the embeddable badge.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND.disc,
        }}
      >
        <svg width="512" height="512" viewBox="0 0 128 128" fill="none">
          <BrandScene />
        </svg>
      </div>
    ),
    { ...size }
  );
}
