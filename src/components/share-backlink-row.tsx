"use client";

import { useState } from "react";
import { Link2, Check, ChevronDown } from "lucide-react";
import { ShareToEarn } from "@/components/share-to-earn";

/**
 * The standing offer under each listing on the dashboard: share the launch,
 * claim a second dofollow link. Collapsed until asked for, so it doesn't shout
 * at founders who've already done it — and permanent, so dismissing the
 * post-publish popup never costs them the backlink.
 */
export function ShareBacklinkRow({
  startupId,
  name,
  tagline,
  url,
  forSale,
  claimed,
  postUrl,
}: {
  startupId: string;
  name: string;
  tagline?: string | null;
  url: string;
  forSale?: boolean;
  claimed?: boolean;
  postUrl?: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (claimed) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/8 pt-3 text-xs">
        <span className="inline-flex items-center gap-1.5 font-medium text-moss-500">
          <Check size={13} /> Second backlink live on the launch wall
        </span>
        {postUrl && (
          <a
            href={postUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-bone-500 underline-offset-2 hover:text-bone-300 hover:underline"
          >
            your post
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 border-t border-black/8 pt-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-accent-500/30 bg-accent-600/[0.04] px-4 py-3 text-left transition hover:border-accent-500/60 hover:bg-accent-600/[0.08]"
      >
        <span className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow">
            <Link2 size={14} />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-semibold text-bone-100">
              Share your launch → get a 2nd dofollow backlink
            </span>
            <span className="block text-[11px] text-bone-500">
              One post on X or LinkedIn. Free, and it stays available.
            </span>
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-bone-500 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-black/8 bg-ink-950 p-4">
          <ShareToEarn
            startupId={startupId}
            name={name}
            tagline={tagline}
            url={url}
            forSale={forSale}
            compact
          />
        </div>
      )}
    </div>
  );
}
