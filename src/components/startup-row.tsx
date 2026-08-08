import Link from "next/link";
import { BadgeCheck, Users, Tag, Sparkles, ArrowUpRight } from "lucide-react";
import { money } from "@/lib/utils";

function compact(n: number) {
  return Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

export type RowStartup = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  logo_url: string | null;
  category: string | null;
  failure_reason: string | null;
  for_sale: boolean;
  asking_price: number | null;
  price_multiplier: number | null;
  verified_mrr: number;
  revenue_verified: boolean;
  total_users: number | null;
  featured?: boolean | null;
  featured_until?: string | null;
};

export function isFeatured(s: RowStartup) {
  return !!s.featured && (!s.featured_until || new Date(s.featured_until) > new Date());
}

/**
 * One startup as a single scannable line — the directory layout people expect
 * from a marketplace, rather than a wall of cards. Rank, identity, metrics and
 * price all sit on shared columns so the eye can run straight down them.
 */
export function StartupRow({ startup: s, rank }: { startup: RowStartup; rank?: number }) {
  const featured = isFeatured(s);

  const price = s.for_sale
    ? s.asking_price
      ? money(s.asking_price)
      : s.price_multiplier
        ? `${s.price_multiplier}× rev`
        : "Open to offers"
    : "Not for sale";

  return (
    <Link
      href={`/startup/${s.slug}`}
      className={`group relative flex items-center gap-4 border-b border-black/[0.06] px-4 py-4 transition-colors last:border-b-0 sm:px-6 ${
        featured ? "bg-accent-600/[0.05] hover:bg-accent-600/[0.09]" : "hover:bg-ink-850"
      }`}
    >
      {featured && <span className="absolute inset-y-0 left-0 w-[3px] bg-accent-500" />}

      {rank != null && (
        <span className="hidden w-6 shrink-0 text-center font-mono text-xs tabular-nums text-bone-500 sm:block">
          {rank}
        </span>
      )}

      {/* logo */}
      {s.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={s.logo_url}
          alt=""
          className="h-11 w-11 shrink-0 rounded-xl border border-black/10 object-cover"
        />
      ) : (
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-black/10 bg-ink-800 font-serif text-lg text-bone-300">
          {s.name.charAt(0)}
        </span>
      )}

      {/* name + tagline */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="truncate font-semibold text-bone-100 group-hover:text-accent-600">{s.name}</h3>
          {featured && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent-600">
              <Sparkles size={9} /> Featured
            </span>
          )}
          {s.revenue_verified && s.verified_mrr > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium text-moss-500">
              <BadgeCheck size={12} /> Verified
            </span>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-bone-500">{s.tagline || "No description yet."}</p>
      </div>

      {/* metrics — shared columns so they scan vertically */}
      <div className="hidden w-24 shrink-0 text-right font-mono text-xs tabular-nums text-bone-400 md:block">
        {s.verified_mrr > 0 ? (
          <>
            {money(s.verified_mrr)}
            <span className="text-bone-500">/mo</span>
          </>
        ) : (
          <span className="text-bone-500">—</span>
        )}
      </div>
      <div className="hidden w-20 shrink-0 items-center justify-end gap-1.5 font-mono text-xs tabular-nums text-bone-400 lg:flex">
        {(s.total_users ?? 0) > 0 ? (
          <>
            <Users size={12} className="text-bone-500" />
            {compact(s.total_users as number)}
          </>
        ) : (
          <span className="text-bone-500">—</span>
        )}
      </div>

      {/* price / status */}
      <div className="hidden w-32 shrink-0 justify-end sm:flex">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${
            s.for_sale
              ? "bg-ember-600/15 text-ember-400"
              : "border border-black/10 bg-ink-850 text-bone-400"
          }`}
        >
          {s.for_sale && <Tag size={10} />}
          {price}
        </span>
      </div>
      <ArrowUpRight
        size={16}
        className="w-4 shrink-0 text-bone-500 transition group-hover:text-accent-600"
      />
    </Link>
  );
}

/** Column headings that line up with the row layout above. */
export function StartupRowHeader() {
  return (
    <div className="hidden items-center gap-4 border-b border-black/8 bg-ink-850/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-500 sm:flex sm:px-6">
      <span className="w-6 text-center">#</span>
      <span className="w-11" />
      <span className="flex-1">Startup</span>
      <span className="hidden w-24 text-right md:block">MRR</span>
      <span className="hidden w-20 text-right lg:block">Users</span>
      <span className="w-32 text-right">Price</span>
      <span className="w-4" />
    </div>
  );
}
