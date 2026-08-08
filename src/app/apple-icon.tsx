import { ImageResponse } from "next/og";
import { BrandScene, BRAND } from "@/components/brand-mark";

// Apple touch icon — iOS rounds the corners itself, so this fills the tile
// edge-to-edge with the disc colour rather than drawing its own circle.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        <svg width="180" height="180" viewBox="0 0 128 128" fill="none">
          <BrandScene />
        </svg>
      </div>
    ),
    { ...size }
  );
}
