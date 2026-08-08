import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/ad-pricing";

/**
 * A house row dropped into the listing table, offering the same placement the
 * paid Sponsored Row above it occupies. Sits deep enough in the list (after the
 * 5th startup) that it reads as inventory rather than an interruption, and
 * links straight to checkout for that placement.
 */
export function PromoCtaRow() {
  const spec = PRODUCTS.sponsored;

  return (
    <Link
      href="/api/checkout/start?product=sponsored"
      className="group flex items-center gap-4 border-y border-dashed border-accent-500/35 bg-accent-600/[0.04] px-4 py-4 transition-colors hover:bg-accent-600/[0.09] sm:px-6"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow transition group-hover:scale-105">
        <Plus size={18} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-bone-100">
          Your product could sit right here
        </span>
        <span className="block truncate text-xs text-bone-500">
          A highlighted row inside the list — {spec.slots} exist, and they include a dofollow link.
        </span>
      </span>

      <span className="hidden shrink-0 text-right sm:block">
        <span className="block font-mono text-lg font-bold leading-none text-bone-100">
          ${spec.dollars}
        </span>
        <span className="block text-[10px] text-bone-500">{spec.unit}</span>
      </span>

      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-500 px-3 py-1.5 text-xs font-semibold text-white shadow-glow">
        Get it <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
