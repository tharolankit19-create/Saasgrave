import { createClient } from "@/lib/supabase/server";

export type GraveyardStats = {
  graves: number;
  buriedMrr: number; // combined monthly revenue laid to rest (verified where possible)
  users: number; // total users left behind across all buried products
  founders: number; // distinct founders who've buried something
  forSale: number; // graves currently open to buyers
};

export type GraveyardRow = {
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
  total_users: number | null;
  founder_id: string;
};

const EMPTY: GraveyardStats = { graves: 0, buriedMrr: 0, users: 0, founders: 0, forSale: 0 };

// Single read of every listed grave — the landing page derives its search index,
// its ledger and its stat ribbon from this one query. Everything is real: no
// seeded or placeholder listings, ever. If Supabase isn't configured or the read
// fails, we degrade to an honest zero-state rather than crashing the page.
export async function loadGraveyard(limit = 200): Promise<{ rows: GraveyardRow[]; stats: GraveyardStats }> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("startups")
      .select(
        "slug, name, logo_url, category, tagline, for_sale, outcome, asking_price, price_multiplier, verified_mrr, claimed_mrr, revenue_verified, view_count, total_users, founder_id"
      )
      .eq("status", "listed")
      .order("view_count", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return { rows: [], stats: EMPTY };

    const rows = data as GraveyardRow[];
    const founders = new Set<string>();
    let buriedMrr = 0;
    let users = 0;
    let forSale = 0;

    for (const r of rows) {
      founders.add(r.founder_id);
      // Only verified revenue counts — we never aggregate self-reported MRR.
      buriedMrr += r.revenue_verified ? r.verified_mrr ?? 0 : 0;
      users += r.total_users ?? 0;
      if (r.for_sale) forSale += 1;
    }

    return {
      rows,
      stats: {
        graves: rows.length,
        buriedMrr: Math.round(buriedMrr),
        users,
        founders: founders.size,
        forSale,
      },
    };
  } catch {
    return { rows: [], stats: EMPTY };
  }
}
