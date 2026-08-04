import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Globe, MapPin, ArrowUpRight, Skull, Eye, Users, BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { XIcon, LinkedInIcon } from "@/components/brand-icons";
import { ShareProfile } from "@/components/share-launch";
import { money } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("full_name").eq("id", params.id).single();
  return { title: data?.full_name || "Founder" };
}

export const dynamic = "force-dynamic";

function absoluteUrl(path: string) {
  const h = headers();
  const host = h.get("host") || "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  return `${proto}://${host}${path}`;
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", params.id).single();
  if (!profile) notFound();

  const { data: startups } = await supabase
    .from("startups")
    .select("*, founder:profiles(full_name, avatar_url)")
    .eq("founder_id", params.id)
    .eq("status", "listed")
    .order("created_at", { ascending: false });

  const list = startups || [];
  const agg = list.reduce(
    (a, s: any) => {
      a.mrr += s.revenue_verified ? s.verified_mrr ?? 0 : s.claimed_mrr ?? 0;
      a.users += s.total_users ?? 0;
      a.views += s.view_count ?? 0;
      if (s.for_sale) a.forSale += 1;
      if (s.revenue_verified && (s.verified_mrr ?? 0) > 0) a.verified += 1;
      return a;
    },
    { mrr: 0, users: 0, views: 0, forSale: 0, verified: 0 }
  );

  const buried = Math.max(profile.failed_count || 0, list.length);
  const handle = profile.x_handle ? profile.x_handle.replace(/^@/, "") : null;
  const site = normalizeUrl(profile.website_url);
  const linkedin = normalizeUrl(profile.linkedin_url);
  const shareUrl = absoluteUrl(`/profile/${params.id}`);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      {/* breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-bone-500">
        <Link href="/" className="hover:text-bone-300">Saasgrave</Link>
        <span>›</span>
        <Link href="/browse" className="hover:text-bone-300">Founders</Link>
        <span>›</span>
        <span className="text-bone-300">{profile.full_name || "Founder"}</span>
      </nav>

      {/* header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-5">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-2xl border border-black/8 object-cover shadow-card" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-2xl bg-bone-100 font-serif text-3xl text-white shadow-card">
              {(profile.full_name || "?").charAt(0)}
            </span>
          )}
          <div>
            <h1 className="flex flex-wrap items-center gap-x-2.5 font-serif text-3xl tracking-tight text-bone-100">
              {profile.full_name || "Anonymous founder"}
              {handle && <span className="font-sans text-sm font-medium text-bone-500">@{handle}</span>}
            </h1>
            <p className="mt-1.5 text-sm text-bone-400">
              {list.length} {list.length === 1 ? "startup" : "startups"}
              {agg.verified > 0 && ` · ${agg.verified} with verified revenue`}
              {profile.location && (
                <span className="ml-2 inline-flex items-center gap-1 text-bone-500">
                  <MapPin size={12} /> {profile.location}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {handle && (
            <a
              href={`https://x.com/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-bone-100 px-4 text-sm font-medium text-ink-950 shadow-card transition hover:shadow-lift"
            >
              <XIcon size={14} /> Visit X profile <ArrowUpRight size={13} />
            </a>
          )}
          <ShareProfile url={shareUrl} name={profile.full_name || "this founder"} />
        </div>
      </div>

      {profile.bio && <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-bone-300">{profile.bio}</p>}

      {/* secondary links */}
      {(site || linkedin) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {site && (
            <a href={site} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-ink-900 px-3.5 py-1.5 text-xs font-medium text-bone-300 shadow-sm transition hover:text-bone-100 hover:shadow-card">
              <Globe size={13} /> Website <ArrowUpRight size={11} />
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-ink-900 px-3.5 py-1.5 text-xs font-medium text-bone-300 shadow-sm transition hover:text-bone-100 hover:shadow-card">
              <LinkedInIcon size={13} className="text-[#0A66C2]" /> LinkedIn <ArrowUpRight size={11} />
            </a>
          )}
        </div>
      )}

      {/* stat cards — TrustMRR-style */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Peak revenue" value={agg.mrr > 0 ? `${money(agg.mrr)}/mo` : "—"} sub="across all startups" />
        <StatCard label="Users reached" value={agg.users > 0 ? agg.users.toLocaleString("en-US") : "—"} sub="all-time" />
        <StatCard label="Startups buried" value={buried.toLocaleString("en-US")} sub={`${agg.forSale} for sale`} />
        <StatCard label="Profile views" value={agg.views.toLocaleString("en-US")} sub="on their listings" />
      </div>

      {/* startups */}
      <h2 className="mb-4 mt-12 font-serif text-2xl tracking-tight text-bone-100">
        Startups by {profile.full_name?.split(" ")[0] || "this founder"}
      </h2>
      {list.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((s: any) => (
            <FounderStartupCard key={s.id} s={s} />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center text-sm text-bone-500">No public listings yet.</Card>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wide text-bone-500">{label}</div>
      <div className="mt-3 font-serif text-2xl text-bone-100">{value}</div>
      <div className="mt-1 text-xs text-bone-400">{sub}</div>
    </Card>
  );
}

function FounderStartupCard({ s }: { s: any }) {
  const mrr = s.revenue_verified ? s.verified_mrr : s.claimed_mrr;
  return (
    <Card className="flex flex-col p-5 transition hover:shadow-lift">
      <Link href={`/startup/${s.slug}`} className="flex items-center gap-3">
        {s.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.logo_url} alt="" className="h-11 w-11 rounded-xl border border-black/8 object-cover" />
        ) : (
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-black/8 bg-ink-850 font-serif text-lg text-bone-300">
            {s.name.charAt(0)}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium text-bone-100">{s.name}</span>
            {s.revenue_verified && (s.verified_mrr ?? 0) > 0 && <BadgeCheck size={14} className="shrink-0 text-moss-500" />}
          </div>
          <div className="truncate text-xs text-bone-500">{s.tagline || s.category || "Laid to rest"}</div>
        </div>
      </Link>

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/8 pt-4 text-center">
        <MiniStat label="MRR" value={mrr > 0 ? money(mrr) : "$0"} />
        <MiniStat label="Users" value={(s.total_users || 0).toLocaleString("en-US")} />
        <MiniStat label={s.for_sale ? "Price" : "Views"} value={s.for_sale ? (s.asking_price ? money(s.asking_price) : s.price_multiplier ? `${s.price_multiplier}×` : "Offers") : (s.view_count || 0).toString()} />
      </div>
    </Card>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium uppercase tracking-wide text-bone-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-bone-100">{value}</div>
    </div>
  );
}

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  const t = url.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
