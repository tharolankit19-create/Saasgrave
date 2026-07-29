import Link from "next/link";
import { TrendingUp, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Eyebrow, Badge } from "@/components/ui";
import { money } from "@/lib/utils";

export const metadata = { title: "For sale" };
export const dynamic = "force-dynamic";

// A ranked "letter board" of startups actively for sale — sorted by price so
// the biggest deals sit at the top like a leaderboard.
export default async function SalesPage() {
  const supabase = createClient();
  const { data: startups } = await supabase
    .from("startups")
    .select("*, founder:profiles(full_name)")
    .eq("status", "listed")
    .eq("for_sale", true)
    .order("asking_price", { ascending: false, nullsFirst: false })
    .limit(50);

  const rows = startups || [];

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="mb-10">
        <Eyebrow>For sale</Eyebrow>
        <h1 className="font-serif text-4xl tracking-tight text-bone-100">Startups on the market</h1>
        <p className="mt-2 text-sm text-bone-500">
          Code, domains, users and revenue — priced outright or as a multiple of what they last earned.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card className="p-16 text-center">
          <p className="font-serif text-2xl text-bone-300">Nothing on the market right now.</p>
          <p className="mt-2 text-sm text-bone-500">Check back soon — or list yours for sale.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-white/8">
          {rows.map((s: any, i: number) => (
            <Link
              key={s.id}
              href={`/startup/${s.slug}`}
              className="flex items-center gap-4 p-4 transition hover:bg-ink-850"
            >
              <div className="w-8 text-center font-serif text-lg text-bone-500">{i + 1}</div>
              {s.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logo_url} alt="" className="h-11 w-11 rounded-xl border border-white/10 object-cover" />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-ink-800 font-serif text-bone-300">
                  {s.name.charAt(0)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-bone-100">{s.name}</span>
                  {s.revenue_verified && s.verified_mrr > 0 && (
                    <Badge className="border-moss-500/30 text-moss-400">verified</Badge>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-bone-500">
                  <span className="inline-flex items-center gap-1">
                    <TrendingUp size={12} /> {money(s.claimed_mrr)}/mo
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={12} /> {(s.total_users || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-serif text-lg text-bone-100">
                  {s.asking_price
                    ? money(s.asking_price)
                    : s.price_multiplier
                      ? `${s.price_multiplier}×`
                      : "Offers"}
                </div>
                {s.price_multiplier && s.claimed_mrr > 0 && (
                  <div className="text-xs text-ember-400">
                    ≈ {money(s.price_multiplier * s.claimed_mrr)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
