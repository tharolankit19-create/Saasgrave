"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight } from "lucide-react";

// One-time announcement. Bump the KEY to broadcast a new announcement to
// everyone again.
const KEY = "sg_announce_postmortem_v1";

export function AnnouncementPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return;
    const t = setTimeout(() => setShow(true), 1200);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
      <button aria-label="Close" onClick={dismiss} className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-black/10 bg-ink-900 shadow-lift animate-fade-up">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-600/15 blur-3xl" />
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full text-bone-400 transition hover:bg-black/5 hover:text-bone-100"
        >
          <X size={16} />
        </button>
        <div className="relative p-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent-600">
            <Sparkles size={12} /> New
          </span>
          <h2 className="mt-4 font-serif text-2xl leading-tight tracking-tight text-bone-100">
            Startup Post-Mortems are live 💀
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-bone-400">
            Every listing now includes a proper autopsy — why users churned, CAC, the biggest
            mistake, and the lessons. Because buying code is cheap; buying wisdom is priceless.
          </p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              onClick={dismiss}
              href="/browse"
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-bone-100 text-sm font-medium text-ink-950 shadow-card transition hover:shadow-lift"
            >
              See the post-mortems <ArrowRight size={15} />
            </Link>
            <Link
              onClick={dismiss}
              href="/sell"
              className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-black/12 text-sm font-medium text-bone-100 transition hover:bg-ink-850"
            >
              Write yours
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
