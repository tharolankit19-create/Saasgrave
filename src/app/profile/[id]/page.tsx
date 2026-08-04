import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Twitter, Linkedin, Globe, MapPin, ArrowUpRight, Skull, Eye, Users, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui";
import { StartupCard } from "@/components/startup-card";
import { money } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("full_name").eq("id", params.id).single();
  return { title: data?.full_name ? `${data.full_name}` : "Founder" };
}

export const dynamic = "force-dynamic";

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

  // Real, computed aggregates — never seeded.
  const agg = list.reduce(
    (a, s: any) => {
      a.mrr += s.revenue_verified ? s.verified_mrr ?? 0 : s.claimed_mrr ?? 0;
      a.users += s.total_users ?? 0;
      a.views += s.view_count ?? 0;
      if (s.for_sale) a.forSale += 1;
      return a;
    },
    { mrr: 0, users: 0, views: 0, forSale: 0 }
  );

  // "Buried" reads from the founder's own count, but never less than what's
  // actually public here.
  const buried = Math.max(profile.failed_count || 0, list.length);
  const site = normalizeUrl(profile.website_url);

  const stats = [
    { icon: <Skull size={14} />, k: buried.toLocaleString("en-US"), v: "startups buried" },
    { icon: <TrendingUp size={14} />, k: agg.mrr > 0 ? `${money(agg.mrr)}/mo` : "—", v: "peak revenue" },
    { icon: <Users size={14} />, k: agg.users > 0 ? agg.users.toLocaleString("en-US") : "—", v: "users reached" },
    { icon: <Eye size={14} />, k: agg.views.toLocaleString("en-US"), v: "profile views" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Card className="relative overflow-hidden p-8">
        <div className="grave-grid pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative">
          <div className="flex flex-wrap items-start gap-5">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-2xl border border-black/10 object-cover shadow-card" />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-2xl bg-accent-500 font-serif text-3xl text-white shadow-card">
                {(profile.full_name || "?").charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-3xl tracking-tight text-bone-100">
                {profile.full_name || "Anonymous founder"}
              </h1>
              {profile.bio && <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-bone-500">{profile.bio}</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className="border-accent-500/30 text-accent-600">{buried} startups buried</Badge>
                {profile.location && (
                  <span className="inline-flex items-center gap-1 text-xs text-bone-500">
                    <MapPin size={12} /> {profile.location}
                  </span>
                )}
              </div>

              {/* Founder's socials + their own site — the "visit" path they asked for. */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {site && (
                  <a
                    href={site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-bone-100 px-4 py-2 text-xs font-medium text-ink-950 shadow-card transition hover:shadow-lift"
                  >
                    <Globe size={13} /> Visit site <ArrowUpRight size={12} />
                  </a>
                )}
                {profile.x_handle && (
                  <SocialLink href={`https://x.com/${profile.x_handle.replace(/^@/, "")}`} label={`@${profile.x_handle.replace(/^@/, "")}`}>
                    <Twitter size={13} />
                  </SocialLink>
                )}
                {profile.linkedin_url && (
                  <SocialLink href={normalizeUrl(profile.linkedin_url)!} label="LinkedIn">
                    <Linkedin size={13} />
                  </SocialLink>
                )}
              </div>
            </div>
          </div>

          {/* Real stat strip */}
          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-black/8 bg-black/8 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.v} className="bg-ink-900 p-4 text-center">
                <div className="mb-1 flex justify-center text-accent-500">{s.icon}</div>
                <div className="font-serif text-xl text-bone-100">{s.k}</div>
                <div className="text-[11px] text-bone-500">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mb-4 mt-10 flex items-end justify-between">
        <h2 className="text-sm font-medium uppercase tracking-widest text-bone-500">
          Their graveyard {list.length > 0 && `· ${list.length}`}
        </h2>
        {agg.forSale > 0 && (
          <span className="text-xs text-accent-600">{agg.forSale} for sale</span>
        )}
      </div>
      {list.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s: any) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-sm text-bone-500">No public listings yet.</p>
        </Card>
      )}
    </div>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-ink-900 px-3 py-2 text-xs font-medium text-bone-300 shadow-sm transition hover:text-bone-100 hover:shadow-card"
    >
      {children}
      {label}
    </a>
  );
}

// Founders paste URLs any way they like — make bare domains clickable.
function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  const t = url.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}
