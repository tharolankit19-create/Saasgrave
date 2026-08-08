/**
 * The Saasgrave mark — an original drawing.
 *
 * Same idea as the reference we liked (a graveyard in a warm circle: headstones,
 * crosses, a low sun) but every path here is our own geometry, drawn to the
 * site's palette. A concept isn't copyrightable; a specific drawing is — so this
 * is built from scratch rather than traced or edited.
 *
 * Painted back-to-front: sun, then the crosses standing behind, then the stones
 * that overlap them, then the mound they're planted in.
 *
 * Rendered as plain SVG so it works in React, in `next/og` ImageResponse, and as
 * a raw string for the embeddable badge.
 */

export const BRAND = {
  disc: "#b8332a", // deep grave-red
  discEdge: "#9a281f",
  sun: "#f2671e", // the site's accent, low on the horizon
  stone: "#1a1712", // warm near-black — the same ink as our headings
  lit: "#d4622c", // sunlit face and the carved crosses
} as const;

// Kept as one source of truth so the React and string renderers can't drift.
const PATHS = {
  sun: { cx: 72, cy: 45, r: 20 },
  crossSmall: ["M33 18h8v46h-8z", "M22 28h30v8H22z"],
  crossTall: ["M61 24h9v76h-9z", "M48 38h35v9H48z"],
  stoneBack: "M74 100V85a15 15 0 0 1 30 0v15Z",
  carvedBack: ["M85 76h8v18h-8z", "M79 81h20v8H79z"],
  stoneFront: "M24 100V77a19 19 0 0 1 38 0v23Z",
  stoneFrontLit: "M24 100V77a19 19 0 0 1 11-16.6V100Z",
  carvedFront: ["M39 66h8v22h-8z", "M31 72h24v8H31z"],
  // Kept inside the disc so the silhouette stays a clean circle at any size.
  mound: "M18 100c13-4 30-6 46-6s33 2 46 6c0 7-20 11-46 11s-46-4-46-11Z",
} as const;

/** The artwork on a 128×128 grid, without the surrounding disc. */
export function BrandScene() {
  return (
    <>
      <circle cx={PATHS.sun.cx} cy={PATHS.sun.cy} r={PATHS.sun.r} fill={BRAND.sun} />

      {/* crosses stand behind the stones */}
      {PATHS.crossSmall.map((d) => (
        <path key={d} d={d} fill={BRAND.stone} />
      ))}
      {PATHS.crossTall.map((d) => (
        <path key={d} d={d} fill={BRAND.stone} />
      ))}

      {/* back-right headstone */}
      <path d={PATHS.stoneBack} fill={BRAND.stone} />
      {PATHS.carvedBack.map((d) => (
        <path key={d} d={d} fill={BRAND.lit} />
      ))}

      {/* front-left headstone, with its sunlit edge */}
      <path d={PATHS.stoneFront} fill={BRAND.stone} />
      <path d={PATHS.stoneFrontLit} fill={BRAND.lit} />
      {PATHS.carvedFront.map((d) => (
        <path key={d} d={d} fill={BRAND.lit} />
      ))}

      {/* the mound they're planted in */}
      <path d={PATHS.mound} fill={BRAND.stone} />
    </>
  );
}

/** The complete badge: the scene inside its red disc. */
export function BrandMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      fill="none"
      className={className}
      role="img"
      aria-label="Saasgrave"
    >
      <defs>
        <clipPath id="sg-disc">
          <circle cx="64" cy="64" r="63" />
        </clipPath>
      </defs>
      <circle cx="64" cy="64" r="63" fill={BRAND.disc} stroke={BRAND.discEdge} strokeWidth="2" />
      <g clipPath="url(#sg-disc)">
        <BrandScene />
      </g>
    </svg>
  );
}

/**
 * The same mark as an SVG string, for contexts that can't render React — the
 * embeddable badge route serves raw SVG to third-party sites.
 */
export function brandMarkSvg(size = 32): string {
  const fill = (ds: readonly string[], c: string) =>
    ds.map((d) => `<path d="${d}" fill="${c}"/>`).join("");
  // A unique clip id per call — several badges can share one page.
  const cid = `sg-disc-${size}`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><clipPath id="${cid}"><circle cx="64" cy="64" r="63"/></clipPath></defs>
<circle cx="64" cy="64" r="63" fill="${BRAND.disc}" stroke="${BRAND.discEdge}" stroke-width="2"/>
<g clip-path="url(#${cid})">
<circle cx="${PATHS.sun.cx}" cy="${PATHS.sun.cy}" r="${PATHS.sun.r}" fill="${BRAND.sun}"/>
${fill(PATHS.crossSmall, BRAND.stone)}${fill(PATHS.crossTall, BRAND.stone)}
<path d="${PATHS.stoneBack}" fill="${BRAND.stone}"/>${fill(PATHS.carvedBack, BRAND.lit)}
<path d="${PATHS.stoneFront}" fill="${BRAND.stone}"/><path d="${PATHS.stoneFrontLit}" fill="${BRAND.lit}"/>${fill(PATHS.carvedFront, BRAND.lit)}
<path d="${PATHS.mound}" fill="${BRAND.stone}"/>
</g>
</svg>`;
}
