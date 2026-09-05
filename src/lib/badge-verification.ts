import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { request } from "node:https";

function ipv4Bytes(address: string) {
  const bytes = address.split(".").map(Number);
  return bytes.length === 4 &&
    bytes.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)
    ? bytes
    : null;
}

/** Reject loopback, private, link-local, CGNAT, documentation, multicast and
 * unspecified addresses. IPv4-mapped IPv6 is normalized before testing. */
export function publicAddress(input: string) {
  let address = input.toLowerCase().split("%")[0];
  const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  if (mapped) address = mapped;
  const version = isIP(address);
  if (version === 4) {
    const b = ipv4Bytes(address)!;
    return !(
      b[0] === 0 ||
      b[0] === 10 ||
      b[0] === 127 ||
      b[0] >= 224 ||
      (b[0] === 100 && b[1] >= 64 && b[1] <= 127) ||
      (b[0] === 169 && b[1] === 254) ||
      (b[0] === 172 && b[1] >= 16 && b[1] <= 31) ||
      (b[0] === 192 && b[1] === 0) ||
      (b[0] === 192 && b[1] === 168) ||
      (b[0] === 198 && [18, 19, 51].includes(b[1])) ||
      (b[0] === 203 && b[1] === 0 && b[2] === 113)
    );
  }
  if (version === 6)
    return !(
      address === "::" ||
      address === "::1" ||
      address.startsWith("fc") ||
      address.startsWith("fd") ||
      /^fe[89ab]/.test(address) ||
      address.startsWith("ff")
    );
  return false;
}

export function landingUrl(value: string): URL {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443")
  )
    throw new Error("Use your public HTTPS landing-page URL.");
  url.hash = "";
  return url;
}

export async function readLandingPage(value: string) {
  let url = landingUrl(value);
  const deadline = Date.now() + 12000;
  for (let redirects = 0; redirects <= 3; redirects++) {
    const remaining = deadline - Date.now();
    if (remaining <= 0)
      throw new Error(
        "Your landing page took too long to respond. Please retry.",
      );
    const host = url.hostname.replace(/^\[|\]$/g, "");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const addresses = await Promise.race([
      lookup(host, { all: true }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Website lookup timed out.")),
          remaining,
        );
      }),
    ]).finally(() => clearTimeout(timer));
    if (!addresses.length || addresses.some((a) => !publicAddress(a.address)))
      throw new Error(
        "Use a publicly reachable website, not a private network address.",
      );
    const target = addresses[0];
    const response = await new Promise<{ html: string; redirect?: string }>(
      (resolve, reject) => {
        const req = request(
          url,
          {
            family: target.family,
            headers: {
              "User-Agent": "Saasgrave-Badge-Verifier/1.0",
              Accept: "text/html",
              "Accept-Encoding": "identity",
            },
            lookup: (_hostname, _options, callback) =>
              callback(null, target.address, target.family),
          },
          (res) => {
            if (
              [301, 302, 303, 307, 308].includes(res.statusCode || 0) &&
              res.headers.location
            ) {
              res.resume();
              resolve({ html: "", redirect: res.headers.location });
              return;
            }
            if (
              res.statusCode !== 200 ||
              !res.headers["content-type"]?.includes("text/html")
            ) {
              res.resume();
              reject(
                new Error(
                  "Your landing page must return a public HTML page (HTTP 200).",
                ),
              );
              return;
            }
            const chunks: Buffer[] = [];
            let size = 0;
            res.on("data", (chunk) => {
              size += chunk.length;
              if (size > 2_000_000) {
                req.destroy(new Error("Landing page is too large to verify."));
                return;
              }
              chunks.push(Buffer.from(chunk));
            });
            res.on("error", reject);
            res.on("end", () =>
              resolve({ html: Buffer.concat(chunks).toString("utf8") }),
            );
          },
        );
        const timeout = setTimeout(
          () =>
            req.destroy(
              new Error("Website verification timed out. Please retry."),
            ),
          Math.max(1, deadline - Date.now()),
        );
        req.on("close", () => clearTimeout(timeout));
        req.on("error", reject);
        req.end();
      },
    );
    if (!response.redirect) return { html: response.html, url: url.href };
    const next = landingUrl(new URL(response.redirect, url).href);
    if (
      next.hostname.replace(/^www\./, "") !== url.hostname.replace(/^www\./, "")
    )
      throw new Error(
        "Your site redirects to another domain. Save the final landing-page URL first.",
      );
    url = next;
  }
  throw new Error(
    "Too many redirects. Save the final landing-page URL and try again.",
  );
}

function attrs(tag: string) {
  const out: Record<string, string> = {};
  for (const match of Array.from(
    tag.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g),
  ))
    out[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? "";
  return out;
}
function hidden(tag: string) {
  const a = attrs(tag),
    style = (a.style || "").replace(/\s+/g, "");
  return (
    "hidden" in a ||
    a["aria-hidden"] === "true" ||
    a.width === "0" ||
    a.height === "0" ||
    /display:none|visibility:hidden|opacity:0(?:[;!]|$)|(?:width|height):0(?:px)?(?:[;!]|$)/i.test(
      style,
    )
  );
}

/** Parse server HTML conservatively: an exact, dofollow listing anchor must
 * contain the exact launch-badge image and neither element may be hidden. */
export function containsLaunchBadge(
  source: string,
  pageUrl: string,
  site: string,
  slug: string,
) {
  const html = source.replace(
    /<!--[\s\S]*?-->|<(script|style|template|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    "",
  );
  const expected = new URL(`/startup/${slug}`, site);
  for (const match of Array.from(
    html.matchAll(/(<a\b[^>]*>)([\s\S]*?)<\/a\s*>/gi),
  )) {
    const anchor = attrs(match[1]);
    try {
      const href = new URL(anchor.href, pageUrl);
      if (
        href.origin !== expected.origin ||
        href.pathname.replace(/\/$/, "") !== expected.pathname ||
        /\b(nofollow|sponsored|ugc)\b/i.test(anchor.rel || "") ||
        hidden(match[1])
      )
        continue;
      for (const image of Array.from(match[2].matchAll(/<img\b[^>]*>/gi))) {
        const imageAttrs = attrs(image[0]);
        const src = new URL(imageAttrs.src, pageUrl);
        if (
          src.origin === expected.origin &&
          src.pathname === "/api/badge" &&
          src.searchParams.get("variant") === "launch" &&
          !hidden(image[0])
        )
          return true;
      }
    } catch {
      /* malformed URLs do not count */
    }
  }
  return false;
}
