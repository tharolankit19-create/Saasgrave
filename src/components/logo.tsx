import { cn } from "@/lib/utils";

// Saasgrave mark — a solid headstone with a gold cross and a small flame at the
// crown (echoing the site's ember accent), resting on a ground line. Reads
// crisply at small sizes on the light theme.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      {/* tombstone body */}
      <path d="M8.5 27V14.5a7.5 7.5 0 0 1 15 0V27Z" className="fill-bone-100" />
      {/* gold cross */}
      <path
        d="M16 10v7M13 13h6"
        className="stroke-accent-400"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      {/* ember at the crown */}
      <circle cx="16" cy="6" r="1.5" className="fill-accent-500" />
      {/* ground line */}
      <path d="M5 27.5h22" className="stroke-bone-400" strokeWidth="1.7" strokeLinecap="round" />
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
