import { createClient } from "@/lib/supabase/server";
import { AdRail, AdStrip } from "@/components/ad-rail";
import { StartupRow, StartupRowHeader, isFeatured, type RowStartup } from "@/components/startup-row";
import { SponsoredRow } from "@/components/ledger-row";
import { BrowseFilters } from "@/components/browse-filters";
import { Eyebrow } from "@/components/ui";
import { loadSponsored } from "@/lib/sponsored";

export const metadata = { title: "Browse the graveyard" };
export const dynamic = "force-dynamic";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { q?: string; reason?: string; sort?: string; sale?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("startups")
    .select("*, founder:profiles(full_name, avatar_url)")
    .eq("status", "listed");

  if (searchParams.q) query = query.ilike("name", `%${searchParams.q}%`);
  if (searchParams.reason) query = query.eq("failure_reason", searchParams.reason);
  if (searchParams.sale === "1") query = query.eq("for_sale", true);

  switch (searchParams.sort) {
    case "users":
      query = query.order("total_users", { ascending: false, nullsFirst: false });
      break;
    case "revenue":
      query = query.order("verified_mrr", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const [{ data: startups }, { data: ads }, sponsored] = await Promise.all([
    query.limit(48),
    supabase.from("ad_slots").select("*").eq("placement", "sidebar").order("position"),
    loadSponsored(),
  ]);

  // Paid Featured Launches sit above everything else, in whatever order the
  // visitor's chosen sort produced.
  const rows: RowStartup[] = (startups || []) as RowStartup[];
  const ordered = [...rows.filter(isFeatured), ...rows.filter((s) => !isFeatured(s))];

  const left = (ads || []).filter((a) => a.position.startsWith("left"));
  const right = (ads || []).filter((a) => a.position.startsWith("right"));

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-12">
      <div className="mb-10">
        <Eyebrow>Browse</Eyebrow>
        <h1 className="font-serif text-4xl tracking-tight text-bone-100">Every listed startup</h1>
        <p className="mt-2 text-sm text-bone-500">
          Products founders shipped and moved on from. Some are for sale — all come with the story.
        </p>
      </div>

      <div className="flex gap-8">
        <AdRail slots={left} />

        <div className="min-w-0 flex-1">
          <AdStrip slots={[...left, ...right]} />
          <BrowseFilters />

          {ordered.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-black/8 bg-ink-900 shadow-card">
              <StartupRowHeader />
              {ordered.map((s, i) => (
                <div key={s.id}>
                  <StartupRow startup={s} rank={i + 1} />
                  {/* The paid $29 placement sits at #2 — high enough to be seen,
                      low enough that the real listing still leads. */}
                  {i === 0 && <SponsoredRow {...sponsored} />}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-black/8 p-16 text-center">
              <p className="font-serif text-2xl text-bone-300">Nothing matches — yet.</p>
              <p className="mt-2 text-sm text-bone-500">Try clearing your filters.</p>
            </div>
          )}
        </div>

        <AdRail slots={right} />
      </div>
    </div>
  );
}
