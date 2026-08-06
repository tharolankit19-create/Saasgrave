import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import {
  BadgeCheck,
  Eye,
  Users,
  Calendar,
  TrendingUp,
  Globe,
  Skull,
  GitBranch,
  Lightbulb,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, Eyebrow } from "@/components/ui";
import { Reveal, Aurora } from "@/components/motion";
import { XIcon, LinkedInIcon } from "@/components/brand-icons";
import { ShareLaunch } from "@/components/share-launch";
import { money, monthsBetween } from "@/lib/utils";
import { MakeOfferButton } from "@/components/make-offer-button";
import { VerifyRevenueButton } from "@/components/verify-revenue-button";
import { ViewTracker } from "@/components/view-tracker";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from("startups").select("name, tagline").eq("slug", params.slug).single();
  if (!data) return { title: "Not found" };
  return { title: data.name, description: data.tagline || "A startup laid to rest on Saasgrave." };
}

export const dynamic = "force-dynamic";

function normalizeUrl(url?: string | null): string | null {
  if (!url) return null;
  const t = url.trim();
  if (!t) return null;
  return /^https?:\/\//i.test(t) ? t : `https://${t}`;
}

export default async function StartupPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: s } = await supabase
    .from("startups")
    .select("*, founder:profiles(id, full_name, avatar_url, x_handle, linkedin_url, website_url, bio, failed_count)")
    .eq("slug", params.slug)
    .single();

  if (!s) notFound();
  const isOwner = user?.id === s.founder_id;
  const months = monthsBetween(s.started_at, s.ended_at);
  const pivoted = s.outcome === "pivot";
  const site = normalizeUrl(s.website_url);
  const founderX = s.founder?.x_handle ? s.founder.x_handle.replace(/^@/, "") : null;

  const h = headers();
  const host = h.get("host") || "localhost:3000";
  const proto = host.includes("localhost") ? "http" : "https";
  const listingUrl = `${proto}://${host}/startup/${s.slug}`;

  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <ViewTracker slug={s.slug} />
      <Link href="/browse" className="text-sm text-bone-500 transition hover:text-bone-300">
        ← Back to listings
      </Link>

      {/* header */}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          {s.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logo_url} alt="" className="h-16 w-16 rounded-2xl border border-black/8 object-cover shadow-card" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-2xl border border-black/8 bg-ink-850 font-serif text-2xl text-bone-300">
              {s.name.charAt(0)}
            </span>
          )}
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-bone-100">{s.name}</h1>
            <p className="mt-1 text-[15px] text-bone-400">{s.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {s.category && <Badge>{s.category}</Badge>}
              <Badge className={pivoted ? "border-accent-500/30 text-accent-600" : "border-black/12 text-bone-400"}>
                {pivoted ? <GitBranch size={12} /> : <Skull size={12} />} {pivoted ? "Pivoted" : "Shut down"}
              </Badge>
              {s.revenue_verified && s.verified_mrr > 0 && (
                <Badge className="border-moss-500/40 text-moss-500">
                  <BadgeCheck size={12} /> Verified revenue
                </Badge>
              )}
            </div>
            {site && (
              <a
                href={site}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-bone-100 px-5 text-sm font-medium text-ink-950 shadow-card transition hover:shadow-lift"
              >
                <Globe size={15} /> Visit site <ArrowUpRight size={14} />
              </a>
            )}
          </div>
        </div>

        {/* price / actions */}
        <Card className="w-full p-5 sm:w-64">
          {s.for_sale ? (
            <>
              <div className="text-xs font-medium uppercase tracking-wider text-bone-400">Asking price</div>
              <div className="mt-1 font-serif text-3xl text-bone-100">
                {s.asking_price
                  ? money(s.asking_price)
                  : s.price_multiplier
                    ? `${s.price_multiplier}× rev`
                    : "Open to offers"}
              </div>
              {s.price_multiplier && s.claimed_mrr > 0 && (
                <div className="mt-1 text-xs text-bone-400">
                  ≈ {money(s.price_multiplier * s.claimed_mrr)} at {money(s.claimed_mrr)}/mo
                </div>
              )}
              {!isOwner && <MakeOfferButton startupId={s.id} className="mt-4 w-full" />}
            </>
          ) : (
            <div className="text-sm text-bone-400">
              Not for sale — listed as a public record. Read the story below.
            </div>
          )}
          {isOwner && <VerifyRevenueButton startupId={s.id} className="mt-3 w-full" />}
        </Card>
      </div>

      {/* owner: share your launch */}
      {isOwner && (
        <Card className="mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium text-bone-100">Your listing is live 🎉</div>
            <div className="text-xs text-bone-500">Share it — every post brings buyers back to the graveyard.</div>
          </div>
          <ShareLaunch name={s.name} tagline={s.tagline} url={listingUrl} forSale={s.for_sale} />
        </Card>
      )}

      {/* metrics — MRR only ever shows as verified; self-reported never masquerades as real */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {s.revenue_verified && (s.verified_mrr || 0) > 0 ? (
          <Metric icon={<BadgeCheck size={15} />} label="Verified MRR" value={`${money(s.verified_mrr)}/mo`} highlight />
        ) : (
          <Metric icon={<TrendingUp size={15} />} label="MRR" value="Unverified" />
        )}
        <Metric icon={<Users size={15} />} label="Users" value={(s.total_users || 0).toLocaleString()} />
        <Metric icon={<Globe size={15} />} label="Monthly visitors" value={(s.monthly_visitors || 0).toLocaleString()} />
        <Metric icon={<Calendar size={15} />} label="Lifespan" value={months != null ? `${months} mo` : "—"} />
      </div>
      {!s.revenue_verified && (s.claimed_mrr || 0) > 0 && (
        <p className="mt-3 text-xs text-bone-400">
          Founder self-reports ≈{money(s.claimed_mrr)}/mo — <span className="text-bone-500">unverified</span>. Only provider-verified revenue gets the green badge.
        </p>
      )}

      {/* AI story mode — the narrative other founders read */}
      {s.ai_story && (
        <Reveal className="mt-10">
          <Card className="relative overflow-hidden border-accent-500/25 p-8 sm:p-10">
            <div className="grave-grid pointer-events-none absolute inset-0 opacity-40" />
            <Aurora className="right-[-80px] top-[-80px] h-64 w-64" />
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-accent-500/30 bg-accent-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
                <Sparkles size={12} /> The story
              </div>
              <div className="space-y-4">
                {s.ai_story.split(/\n{2,}/).map((para: string, i: number) => (
                  <p
                    key={i}
                    className="font-serif text-lg leading-relaxed text-bone-200 sm:text-xl sm:leading-relaxed"
                  >
                    {para}
                  </p>
                ))}
              </div>
              <p className="mt-5 text-xs text-bone-500">Told with a little help from AI, from {s.name}&apos;s own account.</p>
            </div>
          </Card>
        </Reveal>
      )}

      {/* body */}
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          {s.screenshot_urls?.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {s.screenshot_urls.map((url: string) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="w-full rounded-xl border border-black/8 object-cover shadow-sm" />
              ))}
            </div>
          )}

          {s.about && (
            <Section title="What it was">
              <p className="whitespace-pre-line text-[15px] leading-relaxed text-bone-300">{s.about}</p>
            </Section>
          )}

          {/* STARTUP AUTOPSY — the structured post-mortem buyers value most */}
          <Card className="overflow-hidden border-accent-500/20 p-0">
            <div className="border-b border-black/8 bg-accent-600/[0.05] px-6 py-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent-600">
                {pivoted ? <GitBranch size={14} /> : <Skull size={14} />}
                Startup autopsy · {pivoted ? "why it pivoted" : "cause of death"}
              </div>
              {s.failure_reason && (
                <div className="mt-1.5 font-serif text-2xl tracking-tight text-bone-100">{s.failure_reason}</div>
              )}
            </div>

            {/* the numbers a buyer wants at a glance */}
            {(Number(s.cac) > 0 || s.retention || (s.total_users || 0) > 0 || (s.revenue_verified && (s.verified_mrr || 0) > 0)) && (
              <div className="grid grid-cols-2 gap-px border-b border-black/8 bg-black/8 sm:grid-cols-4">
                {s.revenue_verified && (s.verified_mrr || 0) > 0 && <AutopsyStat label="Verified MRR" value={`${money(s.verified_mrr)}/mo`} />}
                {(s.total_users || 0) > 0 && <AutopsyStat label="Users" value={s.total_users.toLocaleString()} />}
                {Number(s.cac) > 0 && <AutopsyStat label="CAC" value={money(s.cac)} />}
                {s.monthly_visitors > 0 && <AutopsyStat label="Monthly visitors" value={s.monthly_visitors.toLocaleString()} />}
              </div>
            )}

            <div className="space-y-5 px-6 py-5">
              {s.failure_detail ? (
                <AutopsyBlock label="What actually happened">
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-bone-300">{s.failure_detail}</p>
                </AutopsyBlock>
              ) : (
                <p className="text-sm text-bone-400">The founder hasn&apos;t written the full story yet.</p>
              )}

              {s.retention && (
                <AutopsyBlock label="Why users churned / experiments tried">
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-bone-300">{s.retention}</p>
                </AutopsyBlock>
              )}

              {s.biggest_mistake && (
                <div className="rounded-xl border border-accent-500/25 bg-accent-600/[0.05] p-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-600">
                    <AlertTriangle size={13} /> Biggest mistake
                  </div>
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-bone-200">{s.biggest_mistake}</p>
                </div>
              )}

              {s.lessons_learned && (
                <div className="rounded-xl border border-moss-500/25 bg-moss-500/[0.06] p-4">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-moss-500">
                    <Lightbulb size={13} /> Lessons for the next founder
                  </div>
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-bone-200">{s.lessons_learned}</p>
                </div>
              )}
            </div>
          </Card>

          {s.tech_stack?.length > 0 && (
            <Section title="Built with">
              <div className="flex flex-wrap gap-2">
                {s.tech_stack.map((t: string) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </Section>
          )}
          {s.marketing_channels?.length > 0 && (
            <Section title="Marketing channels tried">
              <div className="flex flex-wrap gap-2">
                {s.marketing_channels.map((t: string) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </Section>
          )}
          {s.analytics_url && (
            <Section title="Analytics">
              <a href={s.analytics_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 hover:underline">
                <Globe size={14} /> View traffic dashboard <ArrowUpRight size={12} />
              </a>
            </Section>
          )}
        </div>

        {/* founder */}
        <div>
          <Eyebrow>The founder</Eyebrow>
          <Card className="p-5">
            <Link href={`/profile/${s.founder?.id}`} className="flex items-center gap-3">
              {s.founder?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.founder.avatar_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-bone-100 font-semibold text-white">
                  {(s.founder?.full_name || "?").charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <div className="truncate font-medium text-bone-100">{s.founder?.full_name || "Anonymous"}</div>
                <div className="text-xs text-bone-500">{s.founder?.failed_count || 0} startups buried</div>
              </div>
            </Link>
            {s.founder?.bio && <p className="mt-3 text-sm leading-relaxed text-bone-400">{s.founder.bio}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {founderX && (
                <a href={`https://x.com/${founderX}`} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-bone-300 transition hover:border-black/25 hover:text-bone-100">
                  <XIcon size={14} />
                </a>
              )}
              {s.founder?.linkedin_url && (
                <a href={normalizeUrl(s.founder.linkedin_url)!} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-[#0A66C2] transition hover:border-black/25">
                  <LinkedInIcon size={14} />
                </a>
              )}
              {s.founder?.website_url && (
                <a href={normalizeUrl(s.founder.website_url)!} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-lg border border-black/10 text-bone-300 transition hover:border-black/25 hover:text-bone-100">
                  <Globe size={14} />
                </a>
              )}
            </div>
            <Link href={`/profile/${s.founder?.id}`} className="mt-4 flex items-center justify-center gap-1 rounded-lg border border-black/10 py-2 text-xs font-medium text-bone-300 transition hover:border-black/25 hover:text-bone-100">
              View full profile →
            </Link>
          </Card>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-bone-500">
            <Eye size={13} /> {s.view_count > 0 ? `${s.view_count} views` : "Just listed"}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <Card className="p-4">
      <div className={`mb-1.5 flex items-center gap-1.5 ${highlight ? "text-moss-500" : "text-accent-500"}`}>{icon}</div>
      <div className="font-serif text-xl text-bone-100">{value}</div>
      <div className="text-xs font-medium text-bone-400">{label}</div>
    </Card>
  );
}

function AutopsyStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-900 px-4 py-3.5 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-bone-400">{label}</div>
      <div className="mt-1 font-serif text-lg text-bone-100">{value}</div>
    </div>
  );
}

function AutopsyBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-bone-400">{label}</div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-bone-400">{title}</h2>
      {children}
    </section>
  );
}
