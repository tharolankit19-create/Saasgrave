"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Megaphone, ArrowRight } from "lucide-react";

const KEY = "sg_promote_popup_v2";

// A one-time, scroll-triggered nudge to promote. Fires after the visitor has
// scrolled past ~55% of the page (real intent), then never again. Sends them to
// the browse rail where the $9 slot opens.
export function PromotePopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY)) return;
    } catch {
      /* ignore */
    }
    function onScroll() {
      const scrolled = window.scrollY + window.innerHeight;
      const pct = scrolled / document.documentElement.scrollHeight;
      if (pct > 0.55) {
        setOpen(true);
        try {
          localStorage.setItem(KEY, "1");
        } catch {
          /* ignore */
        }
        window.removeEventListener("scroll", onScroll);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[92vw] max-w-sm animate-fade-up">
      <div className="shine-border relative overflow-hidden rounded-2xl border border-black/10 bg-ink-900 p-5 shadow-lift">
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full text-bone-400 transition hover:bg-ink-850 hover:text-bone-100"
        >
          <X size={15} />
        </button>
        <div className="flex items-start gap-3 pr-6">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow">
            <Megaphone size={18} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-moss-500/30 bg-moss-500/10 px-2 py-0.5 text-[10px] font-semibold text-moss-500">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-moss-500" />
                </span>
                1,500+ buyers this week
              </span>
            </div>
            <h3 className="mt-2 text-[15px] font-bold leading-snug text-bone-100">
              Want your product in front of them?
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-bone-500">
              Book a premium slot beside every listing. <span className="text-bone-400 line-through">$49</span>{" "}
              <span className="font-semibold text-accent-600">$9 / 30 days</span> — launch price, 6 slots only.
            </p>
            <Link
              href="/promote"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-4 text-sm font-semibold text-white shadow-glow transition hover:brightness-105"
            >
              Promote for $9 <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
