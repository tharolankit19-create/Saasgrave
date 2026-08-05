"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";

// Founder-facing "write a guide" form.
export function GuideComposer({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-black/8 bg-ink-900 p-6 text-center shadow-card">
        <p className="text-sm text-bone-400">Sign in to write and publish your own guide.</p>
        <Button className="mt-4" onClick={() => router.push("/login?next=/guides/write")}>
          Sign in to write
        </Button>
      </div>
    );
  }

  async function submit() {
    if (!title.trim() || body.trim().length < 40) {
      return toast.error("Add a title and at least a paragraph.");
    }
    setBusy(true);
    const res = await fetch("/api/founder-guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, summary, body }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return toast.error(data.error || "Couldn't publish.");
    toast.success("Published 🎉");
    router.push(`/guides/f/${data.slug}`);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/8 bg-ink-900 p-6 shadow-card">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={120}
        placeholder="Guide title — e.g. How I got my first 100 users"
        className="h-12 w-full rounded-xl border border-black/10 bg-ink-950 px-4 text-[15px] font-medium text-bone-100 outline-none transition focus:border-accent-500/50"
      />
      <input
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        maxLength={200}
        placeholder="One-line summary (optional)"
        className="h-11 w-full rounded-xl border border-black/10 bg-ink-950 px-4 text-sm text-bone-200 outline-none transition focus:border-accent-500/50"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={12}
        placeholder="Write your guide. Be specific — the tactics, the numbers, what actually worked. New paragraphs on a blank line."
        className="w-full rounded-xl border border-black/10 bg-ink-950 px-4 py-3 text-[15px] leading-relaxed text-bone-200 outline-none transition focus:border-accent-500/50"
      />
      <div className="flex justify-end">
        <Button size="lg" onClick={submit} disabled={busy}>
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Publish guide
        </Button>
      </div>
    </div>
  );
}
