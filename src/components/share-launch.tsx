"use client";

import { useState } from "react";
import { Link2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { XIcon, LinkedInIcon } from "@/components/brand-icons";

// "I just listed this" share row. Founders launch a listing, then broadcast it
// in one tap — the loop that turns each listing into new visitors.
//
// X takes prefilled text + url. LinkedIn's share endpoint only accepts a url,
// so we copy a ready-made caption to the clipboard and open the composer, then
// tell the founder to paste. Best UX the platforms allow.
export function ShareLaunch({
  name,
  tagline,
  url,
  forSale,
  compact = false,
}: {
  name: string;
  tagline?: string | null;
  url: string;
  forSale?: boolean;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  // High-curiosity, build-in-public hooks — written to earn replies and clicks,
  // not to read like an ad. First line does the heavy lifting.
  const sub = tagline ? `\n\n(${tagline})` : "";
  const caption = forSale
    ? `I'm selling ${name}. 💀

I built it. It didn't take off. But the code, the domain and the users are all still real — so I'm not deleting it, I'm handing it to whoever can take it further.${sub}

The full story + the price 👇`
    : `I killed ${name}. 💀

Months of nights and weekends. Real users. Then it quietly died.

Most founders delete the repo and never speak of it again.

I did the opposite — published everything: the code, the domain, the users, and the honest post-mortem of what actually went wrong.${sub}

Someone's going to revive it 👇`;

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(url)}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied.");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't copy.");
    }
  }

  async function shareLinkedIn() {
    try {
      await navigator.clipboard.writeText(`${caption}\n\n${url}`);
      toast.success("Caption copied — paste it into your LinkedIn post.");
    } catch {
      /* clipboard may be blocked — the composer still opens */
    }
    window.open(liHref, "_blank", "noopener,noreferrer");
  }

  return (
    <div className={compact ? "flex items-center gap-2" : "flex flex-wrap items-center gap-2"}>
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center gap-2 rounded-full bg-bone-100 px-4 text-sm font-medium text-ink-950 shadow-card transition hover:shadow-lift"
      >
        <XIcon size={14} /> Share on X
      </a>
      <button
        onClick={shareLinkedIn}
        className="inline-flex h-9 items-center gap-2 rounded-full border border-black/12 bg-ink-900 px-4 text-sm font-medium text-bone-100 shadow-sm transition hover:border-black/25 hover:shadow-card"
      >
        <LinkedInIcon size={14} className="text-[#0A66C2]" /> LinkedIn
      </button>
      {!compact && (
        <button
          onClick={copyLink}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-black/12 bg-ink-900 px-4 text-sm font-medium text-bone-300 shadow-sm transition hover:border-black/25 hover:text-bone-100"
        >
          {copied ? <Check size={14} className="text-moss-500" /> : <Link2 size={14} />}
          {copied ? "Copied" : "Copy link"}
        </button>
      )}
    </div>
  );
}

// A tiny "Share profile" button (X + copy) for founder profiles.
export function ShareProfile({ url, name }: { url: string; name: string }) {
  const [busy, setBusy] = useState(false);
  async function share() {
    setBusy(true);
    const text = `Check out ${name}'s startup graveyard on @saasgrave`;
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title: name, text, url });
      } catch {
        /* user dismissed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied.");
      } catch {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank");
      }
    }
    setBusy(false);
  }
  return (
    <button
      onClick={share}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-black/12 bg-ink-900 px-4 text-sm font-medium text-bone-100 shadow-sm transition hover:border-black/25 hover:shadow-card"
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : <Link2 size={15} />} Share
    </button>
  );
}
