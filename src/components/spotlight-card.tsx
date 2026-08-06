"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// A premium card that lights a soft gold spotlight where the cursor is. Uses
// the app's own accent — no rainbow, stays on-theme. Pairs with the existing
// Card styling (white surface + shadow).
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={cn(
        "spotlight-card rounded-2xl border border-black/8 bg-ink-900 shadow-card transition-shadow duration-300 hover:shadow-lift",
        className
      )}
    >
      {children}
    </div>
  );
}
