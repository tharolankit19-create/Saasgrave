"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Check, Loader2 } from "lucide-react";

const KEY = "sg_newsletter_bar_v1";

// A slim sticky bar at the bottom: the weekly "obituary" newsletter capture,
// with a quiet pointer to promotion. Dismissible; hidden once subscribed.
export function NewsletterBar() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      try {
        localStorage.setItem(KEY, "1");
      } catch {
        /* ignore */
      }
      setTimeout(() => setShow(false), 1800);
    } catch {
      setState("idle");
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-ink-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-5 py-3 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-2 text-center text-sm text-bone-300 sm:text-left">
          <span className="hidden shrink-0 rounded-full bg-accent-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-600 sm:inline">
            Weekly
          </span>
          <span>
            <span className="font-semibold text-bone-100">The Weekly Obituary</span> — new dead startups &amp;
            deals, plus promo slots from{" "}
            <Link href="/promote" className="font-semibold text-accent-600 hover:underline">
              $9 (up to $49)
            </Link>
            .
          </span>
        </div>

        <div className="flex items-center gap-2">
          {state === "done" ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-moss-500">
              <Check size={15} /> You&apos;re in — see you Sunday.
            </span>
          ) : (
            <form onSubmit={subscribe} className="flex items-center gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-9 w-44 rounded-full border border-black/12 bg-ink-950 px-3.5 text-sm text-bone-100 outline-none transition focus:border-accent-500/50 sm:w-52"
              />
              <button
                type="submit"
                disabled={state === "loading"}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-4 text-sm font-semibold text-white shadow-glow transition hover:brightness-105 disabled:opacity-60"
              >
                {state === "loading" ? <Loader2 size={14} className="animate-spin" /> : "Subscribe"}
              </button>
            </form>
          )}
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-bone-400 transition hover:bg-ink-850 hover:text-bone-100"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
