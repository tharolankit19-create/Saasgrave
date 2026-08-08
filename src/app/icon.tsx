import { ImageResponse } from "next/og";
import { brandMarkDataUri } from "@/components/brand-mark";

// App icon — the graveyard mark, the same drawing used in the navbar, the
// social cards and the embeddable badge.
//
// Drawn via an <img> data URI rather than inline SVG children: Satori doesn't
// expand nested components inside <svg>, which is why this rendered as a plain
// red disc before.
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
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandMarkDataUri(512)} width={512} height={512} alt="" />
      </div>
    ),
    { ...size }
  );
}
