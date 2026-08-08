"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * The "Featured on Saasgrave" badge a founder embeds on their own site after
 * launching. Shows a live preview in both themes and hands over the HTML —
 * a dofollow link back to their listing, which is the point for both sides.
 */
export function BadgeEmbed({ site, slug }: { site: string; slug?: string | null }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [copied, setCopied] = useState(false);

  const href = slug ? `${site}/startup/${slug}` : site;
  const img = `${site}/api/badge${theme === "light" ? "?theme=light" : ""}`;
  const snippet = `<a href="${href}" target="_blank" rel="noopener">
  <img src="${img}" alt="Featured on Saasgrave" width="232" height="54" />
</a>`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the code is selectable anyway */
    }
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-ink-900 p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-bone-100">Your “Featured on Saasgrave” badge</h3>
          <p className="mt-0.5 text-xs text-bone-500">
            Drop it on your site — it links back to your listing.
          </p>
        </div>
        <div className="flex rounded-full border border-black/12 p-0.5">
          {(["dark", "light"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
                theme === t ? "bg-accent-500 text-white" : "text-bone-400 hover:text-bone-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div
        className={`mt-4 grid place-items-center rounded-xl border border-black/8 p-6 ${
          theme === "light" ? "bg-[#e9e7e0]" : "bg-ink-950"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img} alt="Featured on Saasgrave" width={232} height={54} />
      </div>

      <div className="mt-3 flex items-start gap-2">
        <pre className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-black/8 bg-ink-950 p-3 font-mono text-[11px] leading-relaxed text-bone-400">
          {snippet}
        </pre>
        <button
          onClick={copy}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-black/12 px-3.5 text-xs font-medium text-bone-100 transition hover:border-black/25"
        >
          {copied ? <Check size={13} className="text-moss-500" /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
