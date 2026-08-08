import { ImageResponse } from "next/og";
import { brandMarkDataUri, BRAND } from "@/components/brand-mark";

// Apple touch icon — iOS rounds the corners itself and doesn't like
// transparency, so the disc colour fills the tile behind the mark.
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandMarkDataUri(180)} width={180} height={180} alt="" />
      </div>
    ),
    { ...size }
  );
}
