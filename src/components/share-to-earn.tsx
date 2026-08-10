"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Check, Loader2, Link2, ArrowRight, ExternalLink } from "lucide-react";
import { XIcon, LinkedInIcon } from "@/components/brand-icons";
import { shareCopy, shareHref, type SharePlatform } from "@/lib/share-copy";

/**
 * "Post your launch, get a second dofollow backlink."
 *
 * Shared by the post-publish popup and the dashboard, so dismissing the popup
 * never costs a founder the offer. The two platforms are handled differently on
 * purpose: X takes prefilled text, so we send them straight to a written
 * composer; LinkedIn's endpoint only accepts a URL, so the text is copied first
 * and they paste it.
 */
export function ShareToEarn({
  startupId,
  name,
  tagline,
  url,
  forSale,
  onDone,
  compact = false,
}: {
  startupId: string;
  name: string;
  tagline?: string | null;
  url: string;
  forSale?: boolean;
  onDone?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [platform, setPlatform] = useState<SharePlatform | null>(null);
  const [copied, setCopied] = useState(false);
  const [postUrl, setPostUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const input = { name, tagline, url, forSale };
  const text = platform ? shareCopy(platform, input) : "";

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      return true;
    } catch {
      toast.error("Couldn't copy — select the text and copy it manually.");
      return false;
    }
  }

  function goToX() {
    setPlatform("x");
    // X accepts the whole post prefilled — straight to a written composer.
    window.open(shareHref("x", input), "_blank", "noopener,noreferrer");
  }

  async function goToLinkedIn() {
    setPlatform("linkedin");
    // LinkedIn can't prefill, so the post goes to the clipboard first.
    await copy();
    window.open(shareHref("linkedin", input), "_blank", "noopener,noreferrer");
    toast.success("Post copied — paste it into LinkedIn.", { duration: 6000 });
  }

  async function claim(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    const res = await fetch("/api/share-proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId, url: postUrl }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Couldn't save that link.");
      return;
    }
    setDone(true);
    toast.success("Backlink is live on the launch wall.", { duration: 8000 });
    router.refresh();
    onDone?.();
  }

  if (done) {
    return (
      <div className="py-6 text-center">
        <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-moss-500/10 text-moss-500">
          <Check size={22} />
        </span>
        <h3 className="text-lg font-bold text-bone-100">Second backlink is live.</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-bone-500">
          {name} is on the launch wall with a dofollow link to your site — on top of the one on your
          listing.
        </p>
        <a
          href="/wall"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 hover:underline"
        >
          See it on the wall <ExternalLink size={13} />
        </a>
      </div>
    );
  }

  return (
    <div className={compact ? "" : "mt-3"}>
      {!compact && (
        <>
          <h2 className="text-xl font-bold leading-snug tracking-tight text-bone-100">
            Post it once, get a second backlink.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-bone-500">
            Share your launch, send us the link, and {name} goes on the public launch wall with a{" "}
            <span className="font-semibold text-moss-500">dofollow link to your own site</span> — on
            top of the one already on your listing. Two links, one post, no cost.
          </p>
        </>
      )}

      {/* Step 1 — pick where, get copy written for that platform */}
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <button
          onClick={goToX}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-bone-100 px-4 text-sm font-semibold text-ink-950 transition hover:brightness-95"
        >
          <XIcon className="h-3.5 w-3.5" /> Post on X
        </button>
        <button
          onClick={goToLinkedIn}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/12 px-4 text-sm font-semibold text-bone-100 transition hover:border-black/25"
        >
          <LinkedInIcon className="h-4 w-4" /> Post on LinkedIn
        </button>
      </div>

      {/* The post itself — written for whichever they chose */}
      {platform && (
        <div className="mt-3 rounded-xl border border-black/8 bg-ink-950 p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-bone-500">
              {platform === "x" ? "Written for X" : "Written for LinkedIn — paste this"}
            </span>
            <button
              onClick={copy}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-600 hover:underline"
            >
              {copied ? <Check size={11} className="text-moss-500" /> : <Copy size={11} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="max-h-44 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-bone-300">
            {text}
          </pre>
          {platform === "linkedin" && (
            <p className="mt-2 text-[11px] text-bone-500">
              LinkedIn won&apos;t let us prefill the box — paste it in and hit post.
            </p>
          )}
        </div>
      )}

      {/* Step 2 — claim */}
      <form onSubmit={claim} className="mt-5 border-t border-black/8 pt-5">
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-bone-300">
          <Link2 size={12} className="text-moss-500" />
          Paste your post link to claim the backlink
        </label>
        <div className="flex gap-2">
          <input
            value={postUrl}
            onChange={(e) => setPostUrl(e.target.value)}
            placeholder="https://x.com/you/status/…"
            className="h-11 min-w-0 flex-1 rounded-full border border-black/12 bg-ink-950 px-4 text-sm text-bone-100 outline-none transition placeholder:text-bone-500/60 focus:border-accent-500/50"
          />
          <button
            type="submit"
            disabled={saving || !postUrl.trim()}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-5 text-sm font-semibold text-white shadow-glow transition hover:brightness-105 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                Claim <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-[11px] text-bone-500">
          X or LinkedIn. Goes live on the wall straight away — no review, no waiting.
        </p>
      </form>
    </div>
  );
}
