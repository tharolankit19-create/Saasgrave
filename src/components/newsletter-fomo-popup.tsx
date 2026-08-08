"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Check, Loader2, ArrowRight, Mail } from "lucide-react";

// Shared keys — one "subscribed" flag so no surface (this popup or the sticky
// bar) ever nags a visitor who already gave us their email; one remembered
// email so a returning visitor can subscribe in a single tap.
const SUBSCRIBED = "sg_subscribed";
const DISMISS = "sg_news_pop_v1";
const EMAIL = "sg_email";

// Which section the visitor lingered on maps to a different reason to join the
// list. Honest FOMO — no invented figures beyond what the site already shows.
type Copy = { badge: string; title: string; sub: string; cta: string };
const FOMO: Record<string, Copy> = {
  hero: {
    badge: "The Sunday email",
    title: "Your dead startup is worth money — to the right buyer.",
    sub: "Every Sunday I send the week's fresh graves and who's buying. Join before your inbox misses the next deal.",
    cta: "Send me the Sunday email",
  },
  ledger: {
    badge: "New graves weekly",
    title: "The good ones get bought within days.",
    sub: "Working code, aged domains, real users — the week's new dead startups land in your inbox first. Don't hear about the deal after it's gone.",
    cta: "Get the graves first",
  },
  value: {
    badge: "Buyer's list",
    title: "Codebases, domains and users — going cheap.",
    sub: "Get the week's new acquisitions before other buyers do. One quiet email, every Sunday.",
    cta: "Get the buyer's list",
  },
  how: {
    badge: "Founder's playbook",
    title: "Thinking of listing yours?",
    sub: "Get the short playbook on turning a dead repo into a sale — plus a nudge when a buyer's hunting for something like yours.",
    cta: "Send me the playbook",
  },
  pricing: {
    badge: "Promo watch",
    title: "There are only 15 promo slots in total.",
    sub: "Featured launches, sidebar slots, sponsored rows and newsletter mentions — hear the moment one frees up, before someone else takes it.",
    cta: "Watch the slots",
  },
  faq: {
    badge: "The Weekly Obituary",
    title: "Still deciding? Don't leave empty-handed.",
    sub: "One Sunday email: the week's dead startups, honest post-mortems, and deals worth stealing.",
    cta: "Join the list",
  },
};
const DEFAULT_KEY = "hero";

// Fires for visitors who spent real time on the landing page but never signed
// up — on dwell (~22s) or exit-intent, whichever comes first. Reads which
// section held their attention longest and leads with that section's FOMO, then
// collects an email in one tap (remembered) or one field (autofilled).
export function NewsletterFomoPopup() {
  const [open, setOpen] = useState(false);
  const [copy, setCopy] = useState<Copy>(FOMO[DEFAULT_KEY]);
  const [topKey, setTopKey] = useState<string>(DEFAULT_KEY);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [editing, setEditing] = useState(false);

  // Per-section dwell time, accumulated while the popup is armed.
  const dwellRef = useRef<Record<string, number>>({});
  const firedRef = useRef(false);
  const cleanupRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    // Landing page only — the section tracking and copy are built for it.
    if (typeof window === "undefined" || window.location.pathname !== "/") return;

    let cancelled = false;

    (async () => {
      // Guards: already subscribed, already dismissed, or signed in (they've
      // already given us far more than an email).
      try {
        if (localStorage.getItem(SUBSCRIBED) || localStorage.getItem(DISMISS)) return;
        const saved = localStorage.getItem(EMAIL);
        if (saved) setEmail(saved);
      } catch {
        /* ignore */
      }
      try {
        const { data } = await createClient().auth.getSession();
        if (data.session) return; // signed-in visitor — never nag
      } catch {
        /* if auth check fails, still allow — worst case a guest sees it */
      }
      if (cancelled) return;

      // ── Section dwell tracking ──────────────────────────────
      const visible = new Map<string, number>(); // key -> current ratio
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-fomo]")
      );
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const key = (e.target as HTMLElement).dataset.fomo || DEFAULT_KEY;
            if (e.isIntersecting && e.intersectionRatio > 0.15) {
              visible.set(key, e.intersectionRatio);
            } else {
              visible.delete(key);
            }
          }
        },
        { threshold: [0, 0.15, 0.35, 0.6, 0.85] }
      );
      sections.forEach((s) => io.observe(s));

      // Every 500ms, credit the most-visible section with the time.
      const tick = window.setInterval(() => {
        let bestKey = "";
        let bestRatio = 0;
        visible.forEach((r, k) => {
          if (r > bestRatio) {
            bestRatio = r;
            bestKey = k;
          }
        });
        if (bestKey) dwellRef.current[bestKey] = (dwellRef.current[bestKey] || 0) + 500;
      }, 500);

      function fire() {
        if (firedRef.current || cancelled) return;
        firedRef.current = true;
        // Pick the section that held attention longest.
        const entries = Object.entries(dwellRef.current);
        const winner = entries.sort((a, b) => b[1] - a[1])[0];
        const key = winner && FOMO[winner[0]] ? winner[0] : DEFAULT_KEY;
        setTopKey(key);
        setCopy(FOMO[key]);
        setOpen(true);
        cleanup();
      }

      // Trigger 1 — dwell: they spent real time here without acting.
      const dwellTimer = window.setTimeout(fire, 22000);

      // Trigger 2 — exit intent (desktop): cursor leaves toward the tab bar.
      // Held back for the first 8s so it can't fire on an accidental flick.
      const armedAt = Date.now();
      function onExit(e: MouseEvent) {
        if (e.clientY <= 0 && !e.relatedTarget && Date.now() - armedAt > 8000) fire();
      }
      document.addEventListener("mouseout", onExit);

      function cleanup() {
        io.disconnect();
        window.clearInterval(tick);
        window.clearTimeout(dwellTimer);
        document.removeEventListener("mouseout", onExit);
      }

      // Expose cleanup for unmount.
      cleanupRef.current = cleanup;
    })();

    return () => {
      cancelled = true;
      cleanupRef.current?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS, "1");
    } catch {
      /* ignore */
    }
  }

  async function subscribe(value: string) {
    const clean = value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setEditing(true);
      return;
    }
    if (state === "loading") return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, source: `popup:${topKey}` }),
      });
      if (!res.ok) throw new Error();
      setState("done");
      try {
        localStorage.setItem(SUBSCRIBED, "1");
        localStorage.setItem(EMAIL, clean);
      } catch {
        /* ignore */
      }
      setTimeout(() => setOpen(false), 1900);
    } catch {
      setState("idle");
    }
  }

  if (!open) return null;

  // One-click when we already remember the email (returning visitor); one field
  // when we don't (browser autofill still makes it close to one tap).
  const remembered = !editing && !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
      {/* soft scrim */}
      <div
        className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden
      />
      <div className="animate-fade-up shine-border relative w-full max-w-md overflow-hidden rounded-2xl border border-black/10 bg-ink-900 p-6 shadow-lift sm:p-7">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full text-bone-400 transition hover:bg-ink-850 hover:text-bone-100"
        >
          <X size={16} />
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent-600">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-500" />
          </span>
          {copy.badge}
        </span>

        {state === "done" ? (
          <div className="py-6 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-moss-500/10 text-moss-500">
              <Check size={22} />
            </span>
            <h3 className="text-lg font-bold text-bone-100">You&apos;re in.</h3>
            <p className="mt-1 text-sm text-bone-500">First Sunday email lands this weekend.</p>
          </div>
        ) : (
          <>
            <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight text-bone-100">
              {copy.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-bone-500">{copy.sub}</p>

            {remembered ? (
              // ── True one-click: we already know their email ──
              <div className="mt-5">
                <button
                  onClick={() => subscribe(email)}
                  disabled={state === "loading"}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-5 text-sm font-semibold text-white shadow-glow transition hover:brightness-105 disabled:opacity-60"
                >
                  {state === "loading" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {copy.cta} <ArrowRight size={15} />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-2.5 flex w-full items-center justify-center gap-1.5 text-xs text-bone-500 transition hover:text-bone-300"
                >
                  <Mail size={12} /> Subscribe as <span className="text-bone-300">{email}</span> · use another
                </button>
              </div>
            ) : (
              // ── One field, autofilled ──
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  subscribe(email);
                }}
                className="mt-5"
              >
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="h-11 w-full rounded-full border border-black/12 bg-ink-950 px-4 text-sm text-bone-100 outline-none transition focus:border-accent-500/50"
                />
                <button
                  type="submit"
                  disabled={state === "loading"}
                  className="mt-2.5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-5 text-sm font-semibold text-white shadow-glow transition hover:brightness-105 disabled:opacity-60"
                >
                  {state === "loading" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {copy.cta} <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>
            )}

            <p className="mt-3 text-center text-[11px] text-bone-500">
              No spam. One email a week. Unsubscribe any time.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
