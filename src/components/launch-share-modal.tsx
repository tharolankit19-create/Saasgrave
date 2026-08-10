"use client";

import { useEffect, useState } from "react";
import { X, PartyPopper } from "lucide-react";
import { ShareToEarn } from "@/components/share-to-earn";

const KEY_PREFIX = "sg_launched_";

/**
 * Fires once, right after a listing goes live. Everything inside is the shared
 * ShareToEarn flow — the same one that stays available from the dashboard, so a
 * founder who dismisses this hasn't lost the offer.
 */
export function LaunchShareModal({
  startupId,
  name,
  tagline,
  url,
  forSale,
  alreadyShared,
}: {
  startupId: string;
  name: string;
  tagline?: string | null;
  url: string;
  forSale?: boolean;
  alreadyShared?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (alreadyShared) return;
    try {
      if (localStorage.getItem(KEY_PREFIX + startupId)) return;
    } catch {
      /* ignore */
    }
    setOpen(true);
  }, [startupId, alreadyShared]);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(KEY_PREFIX + startupId, "1");
    } catch {
      /* ignore */
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-4 sm:items-center">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={dismiss} aria-hidden />

      <div className="animate-fade-up shine-border relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-black/10 bg-ink-900 p-6 shadow-lift sm:p-7">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-bone-400 transition hover:bg-ink-850 hover:text-bone-100"
        >
          <X size={16} />
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-600">
          <PartyPopper size={11} /> {name} is live
        </span>

        <ShareToEarn
          startupId={startupId}
          name={name}
          tagline={tagline}
          url={url}
          forSale={forSale}
          onDone={dismiss}
        />

        <button
          onClick={dismiss}
          className="mt-4 w-full text-center text-xs text-bone-500 transition hover:text-bone-300"
        >
          I&apos;ll do this later — it stays on my dashboard
        </button>
      </div>
    </div>
  );
}
