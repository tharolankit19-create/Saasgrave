import { cn } from "@/lib/utils";

// Saasgrave mark — an arched headstone with an inlaid gold cross and an
// ascending ember (the "find new life" spark rising off the grave). Engraved,
// premium, and legible down to favicon size. The same silhouette is reused in
// the favicon and social cards so the brand reads as one system.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      {/* soft plinth shadow */}
      <ellipse cx="16" cy="28.4" rx="9.5" ry="1.4" className="fill-black/10" />
      {/* headstone body — arched top, subtle shoulders */}
      <path
        d="M8 28V14.2a8 8 0 0 1 16 0V28a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1Z"
        className="fill-bone-100"
      />
      {/* engraved inner bevel */}
      <path
        d="M10 27.2V14.4a6 6 0 0 1 12 0v12.8"
        className="stroke-black/10"
        strokeWidth="1"
      />
      {/* inlaid gold cross */}
      <path
        d="M16 9.6v7.6M12.9 12.9h6.2"
        className="stroke-accent-500"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* ascending ember — the spark of a second life */}
      <circle cx="16" cy="5.4" r="1.7" className="fill-accent-400" />
      <circle cx="19.4" cy="7" r="0.7" className="fill-accent-400/70" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-7 w-7" />
      <span className="text-[17px] font-semibold tracking-tight text-bone-100">
        Saas<span className="text-bone-400">grave</span>
      </span>
    </span>
  );
}
