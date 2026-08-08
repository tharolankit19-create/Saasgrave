"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Copy, Check, Loader2, Link2, PartyPopper, ArrowRight } from "lucide-react";
import { XIcon, LinkedInIcon } from "@/components/brand-icons";

const KEY_PREFIX = "sg_launched_";

/**
 * Fires once, right after a listing goes live. Hands the founder a post worth
 * publishing, then offers a concrete reason to actually publish it: paste the
 * link back and the listing joins the launch wall with a second dofollow link.
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"share" | "claim" | "done">("share");
  const [postUrl, setPostUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Written to stop the scroll, not to read like an ad: a confession first, the
  // link last. The line that earns the click is the one about not deleting it.
  const sub = tagline ? `\n\n"${tagline}"` : "";
  const caption = forSale
    ? `I'm selling ${name}. 💀

I built it. It didn't take off.

But the code still runs, the domain is still aged, and the users are still real. Deleting all of that would be the actual failure.

So I've put the whole thing up — the codebase, the domain, the users, and an honest post-mortem of exactly what went wrong.${sub}

Someone's going to buy this and make it work. Maybe it's you 👇`
    : `I killed ${name}. 💀

Months of nights and weekends. Real users. Then it quietly died.

Most founders delete the repo and never mention it again — like it never happened.

I did the opposite. I published everything: the code, the domain, the users, and the honest post-mortem of what actually went wrong.

Because a dead startup isn't worth nothing. It's worth something to whoever's willing to pick it up.${sub}

Full autopsy 👇`;

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    caption
  )}&url=${encodeURIComponent(url)}`;
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(`${caption}\n\n${url}`);
      setCopied(true);
      toast.success("Post copied — paste it anywhere.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy.");
    }
  }

  function openAnd(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
    setStep("claim");
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
    setStep("done");
    try {
      localStorage.setItem(KEY_PREFIX + startupId, "1");
    } catch {
      /* ignore */
    }
    toast.success("You're on the launch wall — second backlink is live.");
    router.refresh();
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

        {step === "done" ? (
          <div className="py-6 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-moss-500/10 text-moss-500">
              <Check size={26} />
            </span>
            <h2 className="text-xl font-bold text-bone-100">Second backlink is live.</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-bone-500">
              {name} is on the launch wall with a dofollow link to your site — on top of the one on
              your listing.
            </p>
            <button
              onClick={dismiss}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-6 text-sm font-semibold text-white shadow-glow transition hover:brightness-105"
            >
              Done <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-600">
              <PartyPopper size={11} /> {name} is live
            </span>

            <h2 className="mt-3 text-xl font-bold leading-snug tracking-tight text-bone-100">
              Now go get it seen.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-bone-500">
              Post this and you get a{" "}
              <span className="font-semibold text-moss-500">second dofollow backlink</span> — your
              listing joins the public launch wall. Takes about ten seconds.
            </p>

            {/* the post itself, so they can see it's actually good */}
            <div className="mt-4 rounded-xl border border-black/8 bg-ink-950 p-4">
              <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap font-sans text-xs leading-relaxed text-bone-300">
                {caption}
              </pre>
              <div className="mt-2 truncate font-mono text-[10px] text-accent-600">{url}</div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => openAnd(xHref)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-bone-100 px-4 text-sm font-semibold text-ink-950 transition hover:brightness-95"
              >
                <XIcon className="h-3.5 w-3.5" /> Post on X
              </button>
              <button
                onClick={async () => {
                  await copyCaption();
                  openAnd(liHref);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-black/12 px-4 text-sm font-semibold text-bone-100 transition hover:border-black/25"
              >
                <LinkedInIcon className="h-4 w-4" /> Post on LinkedIn
              </button>
            </div>
            <button
              onClick={copyCaption}
              className="mt-2 flex w-full items-center justify-center gap-1.5 text-xs text-bone-500 transition hover:text-bone-300"
            >
              {copied ? <Check size={12} className="text-moss-500" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy the post instead"}
            </button>

            {/* claim the second link */}
            <form onSubmit={claim} className="mt-5 border-t border-black/8 pt-5">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-bone-300">
                <Link2 size={12} className="text-moss-500" /> Posted it? Paste the link for your
                second backlink
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
                  {saving ? <Loader2 size={15} className="animate-spin" /> : "Claim"}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-bone-500">
                {step === "claim"
                  ? "Once your post is up, paste its link here."
                  : "X or LinkedIn. We add it to the launch wall with a dofollow link to your site."}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
