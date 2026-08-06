import { createClient } from "@/lib/supabase/server";
import { AdRail, AdStrip } from "@/components/ad-rail";
import { StartupCard } from "@/components/startup-card";
import { BrowseFilters } from "@/components/browse-filters";
import { Eyebrow } from "@/components/ui";

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

  const { data: startups } = await query.limit(48);
  const { data: ads } = await supabase.from("ad_slots").select("*").order("position");

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
          {startups && startups.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {startups.map((s: any) => (
                <StartupCard key={s.id} startup={s} />
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
