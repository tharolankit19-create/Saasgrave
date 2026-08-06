"use client";

import { Download, Sparkles } from "lucide-react";
import { ShareLaunch } from "@/components/share-launch";

// The founder-facing Obituary Card: a preview of the auto-generated death
// certificate that unfurls on every share, plus one-tap download + share.
// This is the viral loop — a dark, aesthetic card people *want* to post.
export function ObituaryCard({
  slug,
  name,
  tagline,
  url,
  forSale,
}: {
  slug: string;
  name: string;
  tagline?: string | null;
  url: string;
  forSale?: boolean;
}) {
  const imgSrc = `/startup/${slug}/opengraph-image`;

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-black/8 bg-ink-900 shadow-card">
      <div className="flex items-center gap-2 border-b border-black/8 bg-ink-850/60 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-accent-600">
        <Sparkles size={13} /> Your obituary card
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-[1.4fr_1fr] sm:items-center">
        <a href={imgSrc} target="_blank" rel="noopener noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={`${name} obituary card`}
            className="w-full rounded-xl border border-black/10 shadow-sm transition hover:shadow-card"
          />
        </a>
        <div>
          <div className="text-sm font-medium text-bone-100">Share the card, not just a link.</div>
          <p className="mt-1 text-xs leading-relaxed text-bone-500">
            This dark, aesthetic card unfurls automatically when you post the link — and it stops the
            scroll. Download it to post as an image, or share the link and let it unfurl.
          </p>
          <a
            href={imgSrc}
            download={`${slug}-obituary.png`}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-full border border-black/12 bg-ink-900 px-4 text-sm font-medium text-bone-100 shadow-sm transition hover:border-black/25 hover:shadow-card"
          >
            <Download size={14} /> Download card
          </a>
          <div className="mt-3">
            <ShareLaunch name={name} tagline={tagline} url={url} forSale={forSale} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
