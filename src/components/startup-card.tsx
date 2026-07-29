import Link from "next/link";
import { BadgeCheck, Eye, Tag } from "lucide-react";
import { Card } from "@/components/ui";
import { money } from "@/lib/utils";

type Startup = {
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
  view_count: number;
  founder?: { full_name: string | null; avatar_url: string | null } | null;
};

export function StartupCard({ startup: s }: { startup: Startup }) {
  return (
    <Link href={`/startup/${s.slug}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-ink-850">
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {s.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.logo_url}
                  alt=""
                  className="h-11 w-11 rounded-xl border border-white/10 object-cover"
                />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-ink-800 font-serif text-lg text-bone-300">
                  {s.name.charAt(0)}
                </span>
              )}
              <div>
                <h3 className="font-medium leading-tight text-bone-100 group-hover:text-white">
                  {s.name}
                </h3>
                {s.category && <span className="text-xs text-bone-500">{s.category}</span>}
              </div>
            </div>
            {s.for_sale && (
              <span className="inline-flex items-center gap-1 rounded-full bg-ember-600/15 px-2.5 py-1 text-xs font-medium text-ember-400">
                <Tag size={11} /> For sale
              </span>
            )}
          </div>

          <p className="mb-5 line-clamp-2 min-h-[2.5rem] text-sm text-bone-500">
            {s.tagline || "No description yet."}
          </p>

          <div className="flex items-center justify-between border-t border-white/8 pt-4">
            <div className="flex items-center gap-3 text-xs text-bone-500">
              {s.revenue_verified && s.verified_mrr > 0 && (
                <span className="inline-flex items-center gap-1 text-moss-400">
                  <BadgeCheck size={13} /> {money(s.verified_mrr)}/mo
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Eye size={13} /> {s.view_count}
              </span>
            </div>
            <div className="text-sm font-medium text-bone-100">
              {s.for_sale
                ? s.asking_price
                  ? money(s.asking_price)
                  : s.price_multiplier
                    ? `${s.price_multiplier}× rev`
                    : "Open to offers"
                : "Not for sale"}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
