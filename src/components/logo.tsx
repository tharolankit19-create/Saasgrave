import { cn } from "@/lib/utils";

// Saasgrave mark — a headstone that doubles as a SaaS "card": a rounded-top
// monolith with two epitaph lines. Monochrome with a single accent stroke.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M8 14a8 8 0 0 1 16 0v13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V14Z"
        className="fill-ink-800 stroke-accent-500"
        strokeWidth="1.6"
      />
      <line x1="12.5" y1="15.5" x2="19.5" y2="15.5" className="stroke-accent-500" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12.5" y1="19.5" x2="17.5" y2="19.5" className="stroke-bone-500" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-7 w-7" />
      <span className="text-[17px] font-semibold tracking-tight text-bone-100">
        Saas<span className="text-bone-500">grave</span>
      </span>
    </span>
  );
}
