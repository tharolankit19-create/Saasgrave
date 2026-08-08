// The embeddable "Featured on Saasgrave" badge, served as SVG so it stays
// crisp at any size and weighs almost nothing on the buyer's own site.
//
// Uses the site's own headstone mark and orange accent, so a badge sitting on
// someone else's landing page still reads unmistakably as Saasgrave.
//
//   /api/badge                 → dark (default)
//   /api/badge?theme=light     → light
//
export const runtime = "edge";

type Theme = {
  bg: string;
  border: string;
  eyebrow: string;
  word: string;
  markBody: string;
  markCut: string;
};

const DARK: Theme = {
  bg: "#14151a",
  border: "#2a2b33",
  eyebrow: "#8b8c96",
  word: "#f6f5f1",
  markBody: "url(#sgGrad)",
  markCut: "#14151a",
};

const LIGHT: Theme = {
  bg: "#f6f5f1",
  border: "#dedcd4",
  eyebrow: "#6b6c76",
  word: "#14151a",
  markBody: "url(#sgGrad)",
  markCut: "#f6f5f1",
};

const W = 232;
const H = 54;

function badge(t: Theme) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Featured on Saasgrave">
  <title>Featured on Saasgrave</title>
  <defs>
    <linearGradient id="sgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fb8b3d"/>
      <stop offset="100%" stop-color="#f2671e"/>
    </linearGradient>
  </defs>

  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="11" fill="${t.bg}" stroke="${t.border}" stroke-width="1.5"/>

  <!-- headstone mark, the site's own -->
  <g transform="translate(14 11) scale(1)">
    <rect width="32" height="32" rx="9" fill="${t.markBody}"/>
    <g transform="translate(4 4) scale(0.75)">
      <path d="M8 28V14.2a8 8 0 0 1 16 0V28a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z" fill="${t.markCut}"/>
      <path d="M16 10.4v6.6M13.4 13.4h5.2" stroke="${t.markBody === "url(#sgGrad)" ? "#fb8b3d" : t.markBody}" stroke-width="2" stroke-linecap="round"/>
    </g>
  </g>

  <text x="58" y="23" fill="${t.eyebrow}" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="9.5" font-weight="600" letter-spacing="1.7">FEATURED ON</text>
  <text x="58" y="41" fill="${t.word}" font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="-0.4">Saasgrave</text>
</svg>`;
}

export async function GET(req: Request) {
  const theme = new URL(req.url).searchParams.get("theme") === "light" ? LIGHT : DARK;
  return new Response(badge(theme), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // Long cache — the badge is static, and it's served onto third-party sites.
      "Cache-Control": "public, max-age=86400, s-maxage=604800, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
