import Link from "next/link";
import { Eye, ArrowUpRight } from "lucide-react";
import { money } from "@/lib/utils";

export type LedgerStartup = {
  slug: string;
  name: string;
  logo_url: string | null;
  category: string | null;
  tagline: string | null;
  for_sale: boolean;
  outcome: string | null;
  asking_price: number | null;
  price_multiplier: number | null;
  verified_mrr: number | null;
  claimed_mrr: number | null;
  revenue_verified: boolean | null;
  view_count: number | null;
};

// One honest, at-a-glance status per grave. Order matters — the first match
// wins, so a for-sale listing reads "FOR SALE" even if it also has revenue.
function status(s: LedgerStartup) {
  if (s.for_sale)
    return { label: "For sale", tone: "text-accent-400 border-accent-500/40 bg-accent-600/10" };
  if (s.revenue_verified && (s.verified_mrr ?? 0) > 0)
    return {
      label: `Verified ${money(s.verified_mrr)}/mo`,
      tone: "text-moss-400 border-moss-500/30 bg-moss-500/10",
    };
  if (s.outcome === "pivot")
    return { label: "Pivoted", tone: "text-bone-300 border-white/12 bg-white/[0.03]" };
  if ((s.verified_mrr ?? 0) === 0 && (s.claimed_mrr ?? 0) === 0)
    return { label: "Zero-revenue", tone: "text-bone-500 border-white/10 bg-white/[0.02]" };
  return { label: "Resting", tone: "text-bone-400 border-white/10 bg-white/[0.02]" };
}

export function LedgerRow({ s, rank }: { s: LedgerStartup; rank: number }) {
  const st = status(s);
  const price = s.for_sale
    ? s.asking_price
      ? money(s.asking_price)
      : s.price_multiplier
        ? `${s.price_multiplier}× rev`
        : "Open to offers"
    : null;

  return (
    <Link
      href={`/startup/${s.slug}`}
      className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-white/[0.06] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-white/[0.025] sm:grid-cols-[2.5rem_1fr_9rem_auto] sm:px-6"
    >
      <span className="font-serif text-sm tabular-nums text-bone-500 sm:text-base">
        {String(rank).padStart(2, "0")}
      </span>

      <span className="flex min-w-0 items-center gap-3">
        {s.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={s.logo_url}
            alt=""
            className="h-9 w-9 shrink-0 rounded-lg border border-white/10 object-cover"
          />
        ) : (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-ink-800 font-serif text-sm text-bone-300">
            {s.name.charAt(0)}
          </span>
        )}
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-medium text-bone-100 group-hover:text-white">
              {s.name}
            </span>
            <ArrowUpRight
              size={13}
              className="shrink-0 text-bone-500 opacity-0 transition group-hover:opacity-100"
            />
          </span>
          <span className="block truncate text-xs text-bone-500">
            {s.tagline || s.category || "A product laid to rest"}
          </span>
        </span>
      </span>

      <span className="hidden sm:block">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${st.tone}`}
        >
          {st.label}
        </span>
      </span>

      <span className="flex items-center justify-end gap-4 text-right">
        {price && <span className="hidden text-sm font-medium text-bone-100 sm:inline">{price}</span>}
        <span className="inline-flex items-center gap-1 text-xs tabular-nums text-bone-500">
          <Eye size={12} /> {s.view_count ?? 0}
        </span>
      </span>
    </Link>
  );
}
