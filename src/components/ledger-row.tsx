import Link from "next/link";
import { Eye, ArrowUpRight, BadgeCheck, Sparkles } from "lucide-react";
import { money } from "@/lib/utils";

// A single sponsored placement dropped into the dead list (e.g. at rank #2).
// Bigger than a normal row, minimal details, one clear outbound click. Real ad,
// clearly labelled — not disguised as a listing.
export function SponsoredRow({
  name,
  tagline,
  href,
  logo,
}: {
  name: string;
  tagline: string;
  href: string;
  logo?: string | null;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-y border-accent-500/25 bg-accent-600/[0.05] px-4 py-4 transition-colors hover:bg-accent-600/[0.09] sm:grid-cols-[2.25rem_1fr_7rem_8rem_auto] sm:gap-4 sm:px-6"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-500/15 text-accent-600">
        <Sparkles size={13} />
      </span>

      <span className="flex min-w-0 items-center gap-3">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-11 w-11 shrink-0 rounded-lg border border-black/10 bg-white object-contain p-1" />
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-black/10 bg-ink-850 text-base font-bold text-bone-300">
            {name.charAt(0)}
          </span>
        )}
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-bold text-bone-100 group-hover:text-accent-600">{name}</span>
            <ArrowUpRight size={13} className="shrink-0 text-accent-600" />
          </span>
          <span className="block truncate text-xs text-bone-400">{tagline}</span>
        </span>
      </span>

      <span className="hidden sm:block">
        <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-bone-500">
          Sponsored
        </span>
      </span>

      <span className="hidden sm:block" />

      <span className="flex w-20 justify-end">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent-600">
          Visit <ArrowUpRight size={12} />
        </span>
      </span>
    </a>
  );
}

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

// At-a-glance status per grave. Order matters — first match wins.
function status(s: LedgerStartup) {
  if (s.for_sale) return { label: "For sale", tone: "text-accent-600 border-accent-500/40 bg-accent-600/10" };
  if (s.revenue_verified && (s.verified_mrr ?? 0) > 0)
    return { label: "Verified rev", tone: "text-moss-500 border-moss-500/30 bg-moss-500/10" };
  if (s.outcome === "pivot") return { label: "Pivoted", tone: "text-bone-300 border-black/12 bg-black/[0.03]" };
  return { label: "Resting", tone: "text-bone-400 border-black/10 bg-black/[0.02]" };
}

// Podium ranks — monochrome. The top grave is solid ink; the rest step down
// through greys. No colour, just weight.
function rankStyle(rank: number) {
  if (rank === 1) return "bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow";
  if (rank === 2) return "bg-bone-100 text-white";
  if (rank === 3) return "bg-bone-400 text-white";
  return "bg-ink-850 text-bone-400";
}

export function LedgerRow({ s, rank, maxViews = 0 }: { s: LedgerStartup; rank: number; maxViews?: number }) {
  const st = status(s);
  const views = s.view_count ?? 0;
  const barPct = maxViews > 0 ? Math.max(6, Math.round((views / maxViews) * 100)) : 6;

  const money_or_price = s.for_sale
    ? s.asking_price
      ? money(s.asking_price)
      : s.price_multiplier
        ? `${s.price_multiplier}× rev`
        : "Offers"
    : s.revenue_verified && (s.verified_mrr ?? 0) > 0
      ? `${money(s.verified_mrr)}/mo`
      : "—";

  return (
    <Link
      href={`/startup/${s.slug}`}
      style={{ animationDelay: `${Math.min(rank, 12) * 45}ms` }}
      className="ledger-row group grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-black/[0.06] px-4 py-3.5 transition-colors last:border-b-0 hover:bg-accent-600/[0.035] sm:grid-cols-[2.25rem_1fr_7rem_8rem_auto] sm:gap-4 sm:px-6"
    >
      {/* rank medal */}
      <span className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold tabular-nums ${rankStyle(rank)}`}>
        {rank}
      </span>

      {/* identity */}
      <span className="flex min-w-0 items-center gap-3">
        {s.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.logo_url} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-black/10 object-cover" />
        ) : (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-black/10 bg-ink-850 font-serif text-sm text-bone-300">
            {s.name.charAt(0)}
          </span>
        )}
        <span className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-bone-100 group-hover:text-accent-600">{s.name}</span>
            {s.revenue_verified && (s.verified_mrr ?? 0) > 0 && <BadgeCheck size={13} className="shrink-0 text-moss-500" />}
            <ArrowUpRight size={12} className="shrink-0 text-bone-400 opacity-0 transition group-hover:opacity-100" />
          </span>
          <span className="block truncate text-xs text-bone-400">{s.category || s.tagline || "Laid to rest"}</span>
        </span>
      </span>

      {/* status */}
      <span className="hidden sm:block">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${st.tone}`}>
          {st.label}
        </span>
      </span>

      {/* MRR / price */}
      <span className="hidden text-right text-sm font-semibold text-bone-100 sm:block">{money_or_price}</span>

      {/* interest */}
      <span className="flex w-20 flex-col items-end gap-1">
        <span className="inline-flex items-center gap-1 text-xs font-medium tabular-nums text-bone-400">
          <Eye size={12} /> {views > 0 ? views : "New"}
        </span>
        <span className="h-1 w-full overflow-hidden rounded-full bg-black/8">
          <span className="block h-full rounded-full bg-accent-500/70" style={{ width: `${barPct}%` }} />
        </span>
      </span>
    </Link>
  );
}
