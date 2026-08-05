import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Plus, Eye, Tag, FileText, TrendingUp, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, LinkButton, Badge } from "@/components/ui";
import { money } from "@/lib/utils";
import { ListingRowActions } from "@/components/listing-row-actions";
import { AdSlotManager, type OwnedSlot } from "@/components/ad-slot-manager";
import { ShareLaunch } from "@/components/share-launch";
import { OfferActions } from "@/components/offer-actions";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const { data: startups } = await supabase
    .from("startups")
    .select("*")
    .eq("founder_id", user.id)
    .order("created_at", { ascending: false });

  const { data: offers } = await supabase
    .from("offers")
    .select("*, startup:startups!inner(name, founder_id), buyer:profiles!offers_buyer_id_fkey(full_name)")
    .eq("startup.founder_id", user.id)
    .order("created_at", { ascending: false });

  // Promotions — the ad slots this founder owns, plus what's still open to book.
  const { data: allSlots } = await supabase.from("ad_slots").select("*").order("position");
  const slots = allSlots || [];
  const ownedSlots = slots.filter((s) => s.buyer_id === user.id) as OwnedSlot[];
  const openSlots = slots.filter((s) => !(s.active && s.headline) && s.buyer_id !== user.id);
  const openSlotId = openSlots[0]?.id ?? null;

  const host = headers().get("host") || "localhost:3000";
  const origin = `${host.includes("localhost") ? "http" : "https"}://${host}`;

  const list = startups || [];
  const stats = {
    total: list.length,
    listed: list.filter((s) => s.status === "listed").length,
    forSale: list.filter((s) => s.for_sale).length,
    views: list.reduce((n, s) => n + (s.view_count || 0), 0),
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-sm text-bone-500">Welcome back,</p>
          <h1 className="font-serif text-3xl tracking-tight text-bone-100">
            {profile?.full_name || "Founder"}
          </h1>
        </div>
        <LinkButton href="/sell">
          <Plus size={16} /> List a startup
        </LinkButton>
      </div>

      {/* stats */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat icon={<FileText size={16} />} label="Listings" value={stats.total} />
        <Stat icon={<TrendingUp size={16} />} label="Live" value={stats.listed} />
        <Stat icon={<Tag size={16} />} label="For sale" value={stats.forSale} />
        <Stat icon={<Eye size={16} />} label="Total views" value={stats.views} />
      </div>

      {/* listings */}
      <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-bone-500">Your listings</h2>
      {list.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="font-serif text-xl text-bone-300">No listings yet.</p>
          <p className="mt-2 text-sm text-bone-500">List your first startup to get started.</p>
          <div className="mt-6">
            <LinkButton href="/sell">List a startup</LinkButton>
          </div>
        </Card>
      ) : (
        <Card className="divide-y divide-black/8">
          {list.map((s) => (
            <div key={s.id} className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/startup/${s.slug}`} className="truncate font-medium text-bone-100 hover:text-accent-600">
                      {s.name}
                    </Link>
                    <StatusBadge status={s.status} />
                    {s.for_sale && (
                      <Badge className="border-accent-500/30 text-accent-600">
                        {s.asking_price ? money(s.asking_price) : s.price_multiplier ? `${s.price_multiplier}×` : "offers"}
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-bone-500">
                    <span className="inline-flex items-center gap-1">
                      <Eye size={12} /> {s.view_count > 0 ? `${s.view_count} views` : "New"}
                    </span>
                    {s.status === "draft" && <span className="text-accent-600">Draft — not live yet</span>}
                  </div>
                </div>
                <ListingRowActions
                  startup={{
                    id: s.id,
                    slug: s.slug,
                    status: s.status,
                    for_sale: s.for_sale,
                    sale_listing_paid: s.sale_listing_paid,
                  }}
                />
              </div>
              {s.status === "listed" && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/8 pt-3">
                  <span className="text-xs font-medium text-bone-500">Share your launch:</span>
                  <ShareLaunch name={s.name} tagline={s.tagline} url={`${origin}/startup/${s.slug}`} forSale={s.for_sale} compact />
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      {/* promotions / ad slots */}
      <h2 className="mb-4 mt-12 flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-bone-500">
        <Megaphone size={14} /> Promotions
      </h2>
      <AdSlotManager owned={ownedSlots} openSlotId={openSlotId} openCount={openSlots.length} />

      {/* offers */}
      <h2 className="mb-4 mt-12 text-sm font-medium uppercase tracking-widest text-bone-500">
        Offers received
      </h2>
      {offers && offers.length > 0 ? (
        <Card className="divide-y divide-black/8">
          {offers.map((o: any) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <span className="font-medium text-bone-100">{money(o.amount)}</span>
                <span className="text-bone-400"> for {o.startup?.name}</span>
                <div className="text-xs text-bone-400">from {o.buyer?.full_name || "a buyer"}</div>
                {o.message && <div className="mt-1 max-w-md text-xs italic text-bone-500">“{o.message}”</div>}
              </div>
              {o.status === "pending" ? (
                <OfferActions offerId={o.id} />
              ) : (
                <Badge
                  className={
                    o.status === "accepted"
                      ? "border-moss-500/40 text-moss-500"
                      : o.status === "rejected"
                        ? "border-black/15 text-bone-400"
                        : ""
                  }
                >
                  {o.status}
                </Badge>
              )}
            </div>
          ))}
        </Card>
      ) : (
        <p className="text-sm text-bone-500">No offers yet.</p>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-5">
      <div className="mb-2 flex items-center gap-2 text-bone-500">{icon}</div>
      <div className="font-serif text-2xl text-bone-100">{value}</div>
      <div className="text-xs text-bone-500">{label}</div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    listed: "border-moss-500/30 text-moss-400",
    draft: "border-black/15 text-bone-500",
    sold: "border-ember-500/30 text-ember-400",
  };
  return <Badge className={map[status] || ""}>{status}</Badge>;
}
