import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";

// The wordmark's mark is the shared BrandMark, so the navbar, the favicon, the
// social cards and the embeddable badge are all literally the same drawing.
export function LogoMark({ className }: { className?: string }) {
  return <BrandMark size={28} className={className} />;
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <BrandMark size={28} className="h-7 w-7 shrink-0" />
      <span className="text-[17px] font-semibold tracking-tight text-bone-100">
        Saas<span className="text-bone-400">grave</span>
      </span>
    </span>
  );
}
