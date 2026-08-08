"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

/**
 * One click publishes (or regenerates) a startup's AI write-up. The article is
 * what earns the listing search traffic and its dofollow link, so this is the
 * admin panel's main lever.
 */
export function ArticleButton({
  startupId,
  hasArticle,
}: {
  startupId: string;
  hasArticle: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function run() {
    if (busy) return;
    setBusy(true);
    const res = await fetch("/api/admin/article", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId, force: hasArticle }),
    });
    setBusy(false);

    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(d.error || "Couldn't generate.");
      return;
    }
    toast.success(`Published — ${d.words} words.`);
    router.refresh();
  }

  return (
    <button
      onClick={run}
      disabled={busy}
      title={hasArticle ? "Regenerate the article" : "Generate and publish the article"}
      className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition disabled:opacity-50 ${
        hasArticle
          ? "border border-black/12 text-bone-300 hover:border-black/25 hover:text-bone-100"
          : "bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow hover:brightness-105"
      }`}
    >
      {busy ? (
        <Loader2 size={12} className="animate-spin" />
      ) : hasArticle ? (
        <RefreshCw size={12} />
      ) : (
        <Sparkles size={12} />
      )}
      {busy ? "Writing…" : hasArticle ? "Regenerate" : "Publish article"}
    </button>
  );
}
