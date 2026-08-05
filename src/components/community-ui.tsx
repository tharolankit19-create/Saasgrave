"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

// Like button — optimistic toggle backed by the toggle_post_like RPC.
export function LikeButton({
  postId,
  initialCount,
  initialLiked,
  signedIn,
}: {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(initialLiked);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (!signedIn) {
      router.push("/login?next=/community");
      return;
    }
    setBusy(true);
    const prev = { count, liked };
    setLiked(!liked);
    setCount((c) => c + (liked ? -1 : 1));
    const res = await fetch("/api/community/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    setBusy(false);
    if (!res.ok) {
      setCount(prev.count);
      setLiked(prev.liked);
      return;
    }
    const data = await res.json();
    if (typeof data.likeCount === "number") setCount(data.likeCount);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        liked
          ? "border-accent-500/40 bg-accent-600/10 text-accent-600"
          : "border-black/10 text-bone-500 hover:text-bone-100"
      }`}
    >
      <Heart size={13} className={liked ? "fill-accent-500 text-accent-500" : ""} /> {count}
    </button>
  );
}

const KINDS = [
  { key: "story", label: "Story" },
  { key: "win", label: "Win" },
  { key: "question", label: "Question" },
  { key: "show", label: "Show" },
];

// Create-post composer.
export function CommunityComposer({ signedIn }: { signedIn: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("story");
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/8 bg-ink-900 p-6 text-center shadow-card sm:flex-row sm:justify-between sm:text-left">
        <div>
          <div className="text-sm font-medium text-bone-100">Share your story with the community</div>
          <div className="text-xs text-bone-500">Founders swap wins, failures and questions here.</div>
        </div>
        <button
          onClick={() => router.push("/login?next=/community")}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-bone-100 px-5 text-sm font-medium text-ink-950 shadow-card transition hover:shadow-lift"
        >
          <Sparkles size={14} /> Sign in to post
        </button>
      </div>
    );
  }

  async function submit() {
    if (!title.trim()) return toast.error("Add a title.");
    setBusy(true);
    const res = await fetch("/api/community/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, kind }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Couldn't post.");
    setTitle("");
    setBody("");
    setOpen(false);
    toast.success("Posted 🎉");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-black/8 bg-ink-900 p-5 shadow-card">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full rounded-xl border border-black/10 bg-ink-950 px-4 py-3 text-left text-sm text-bone-500 transition hover:border-black/20"
        >
          Share a win, a failure, or a question…
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k.key}
                onClick={() => setKind(k.key)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  kind === k.key ? "border-accent-500/40 bg-accent-600/10 text-accent-600" : "border-black/10 text-bone-500 hover:text-bone-100"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder="Title — say it in one line"
            className="h-11 w-full rounded-xl border border-black/10 bg-ink-950 px-4 text-sm text-bone-100 outline-none transition focus:border-accent-500/50"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Tell the story… (optional)"
            className="w-full rounded-xl border border-black/10 bg-ink-950 px-4 py-3 text-sm leading-relaxed text-bone-200 outline-none transition focus:border-accent-500/50"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="rounded-full px-4 py-2 text-sm text-bone-500 hover:text-bone-100">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={busy}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-bone-100 px-5 text-sm font-medium text-ink-950 shadow-card transition hover:shadow-lift disabled:opacity-50"
            >
              {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Add-comment form on a post.
export function CommentForm({ postId, signedIn }: { postId: string; signedIn: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <button
        onClick={() => router.push("/login?next=/community")}
        className="w-full rounded-xl border border-black/10 bg-ink-950 px-4 py-3 text-left text-sm text-bone-500 transition hover:border-black/20"
      >
        Sign in to join the conversation…
      </button>
    );
  }

  async function submit() {
    if (!body.trim()) return;
    setBusy(true);
    const res = await fetch("/api/community/comment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, body }),
    });
    setBusy(false);
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Couldn't comment.");
    setBody("");
    router.refresh();
  }

  return (
    <div className="flex items-end gap-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        placeholder="Add a reply…"
        className="flex-1 rounded-xl border border-black/10 bg-ink-950 px-4 py-2.5 text-sm text-bone-200 outline-none transition focus:border-accent-500/50"
      />
      <button
        onClick={submit}
        disabled={busy}
        className="inline-flex h-10 items-center gap-1.5 rounded-full bg-bone-100 px-4 text-sm font-medium text-ink-950 shadow-card transition hover:shadow-lift disabled:opacity-50"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
      </button>
    </div>
  );
}
