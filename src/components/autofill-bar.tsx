"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, Link2 } from "lucide-react";

export type AutofillFields = {
  name: string;
  tagline: string;
  about: string;
  category: string;
  tech_stack: string;
  website_url: string;
  logo_url: string;
};

// Paste a link, get the product half of the listing filled in. Typing out what
// your own landing page already says is the most tedious part of listing, and
// the part people abandon on.
export function AutofillBar({ onFilled }: { onFilled: (f: AutofillFields) => void }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!url.trim()) return toast.error("Paste your site's link first.");
    setLoading(true);
    try {
      const res = await fetch("/api/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't read that page.");
        return;
      }
      onFilled(data.fields as AutofillFields);
      toast.success("Filled from your site — check it over before publishing.");
    } catch {
      toast.error("Couldn't reach the page. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-accent-500/25 bg-accent-400/[0.07] p-5">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={15} className="text-accent-600" />
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600">
          Skip the typing
        </p>
      </div>
      <p className="mb-3 text-sm text-bone-400">
        Paste your product&apos;s link and we&apos;ll read the site and fill in the name, tagline,
        description and stack. You still write the part only you know — why it ended.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Link2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-400" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                run();
              }
            }}
            placeholder="yourproduct.com"
            className="h-11 w-full rounded-full border border-black/10 bg-ink-900 pl-9 pr-4 text-sm text-bone-100 placeholder:text-bone-500 outline-none transition focus:border-accent-500/50"
          />
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-5 text-sm font-medium text-white shadow-glow transition-all duration-200 hover:brightness-[1.04] hover:shadow-lift active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Reading your site…
            </>
          ) : (
            <>
              <Sparkles size={16} /> Fill it for me
            </>
          )}
        </button>
      </div>
    </div>
  );
}
