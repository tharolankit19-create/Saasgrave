"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Scroll-reveal wrapper. Adds `is-in` when the element enters the viewport, so
// content rises and fades in on the way down the page. Children can be
// server-rendered — they're just passed through.
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  as?: any;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ ["--reveal-delay" as any]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

// An animated gold aurora blob — pure decoration behind hero / CTA sections.
export function Aurora({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`aurora animate-aurora pointer-events-none absolute rounded-full ${className}`}
    />
  );
}

// Infinite marquee tape — a slow-moving strip of items that loops seamlessly.
// The track holds two identical halves and slides -50%, so there's no seam.
export function Marquee({
  items,
  duration = 42,
}: {
  items: string[];
  duration?: number;
}) {
  if (!items.length) return null;
  const half = [...items, ...items, ...items];
  return (
    <div className="marquee-mask relative overflow-hidden">
      <div
        className="flex w-max animate-marquee gap-3 pr-3"
        style={{ ["--marquee-dur" as any]: `${duration}s` }}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-3" aria-hidden={copy === 1}>
            {half.map((label, i) => (
              <span
                key={`${copy}-${i}`}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-black/8 bg-ink-900 px-4 py-2 text-sm text-bone-300 shadow-card"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                {label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
