// The embeddable "Featured on Saasgrave" badge, served as SVG so it stays
// crisp at any size and weighs almost nothing on the buyer's own site.
//
// Carries the site's own graveyard mark, so a badge sitting on someone else's
// landing page still reads unmistakably as Saasgrave.
//
//   /api/badge                 → dark (default)
//   /api/badge?theme=light     → light
//
import { brandMarkSvg } from "@/components/brand-mark";

export const runtime = "edge";

type Theme = {
  bg: string;
  border: string;
  eyebrow: string;
  word: string;
};

const DARK: Theme = {
  bg: "#14151a",
  border: "#2a2b33",
  eyebrow: "#8b8c96",
  word: "#f6f5f1",
};

const LIGHT: Theme = {
  bg: "#f6f5f1",
  border: "#dedcd4",
  eyebrow: "#6b6c76",
  word: "#14151a",
};

const W = 232;
const H = 54;

function badge(t: Theme, launch = false) {
  const label = launch ? "Listed on Saasgrave" : "Featured on Saasgrave";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}">
  <title>${label}</title>
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="11" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>

  <!-- the brand mark, identical to the favicon and navbar -->
  <g transform="translate(13 11)">${brandMarkSvg(32)}</g>

  <text x="58" y="23" fill="${t.eyebrow}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="9.5" font-weight="600" letter-spacing="1.7">${launch ? "LISTED ON" : "FEATURED ON"}</text>
  <text x="58" y="41" fill="${t.word}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="-0.4">Saasgrave</text>
</svg>`;
}

export async function GET(req: Request) {
  const theme = new URL(req.url).searchParams.get("theme") === "light" ? LIGHT : DARK;
  return new Response(badge(theme, new URL(req.url).searchParams.get("variant") === "launch"), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Long cache — the badge is static, and it's served onto third-party sites.
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
