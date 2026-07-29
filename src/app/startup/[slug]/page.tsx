import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Eye, Users, Calendar, TrendingUp, Globe, Twitter, Linkedin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, Eyebrow } from "@/components/ui";
import { money, monthsBetween } from "@/lib/utils";
import { MakeOfferButton } from "@/components/make-offer-button";
import { VerifyRevenueButton } from "@/components/verify-revenue-button";
import { ViewTracker } from "@/components/view-tracker";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from("startups").select("name, tagline").eq("slug", params.slug).single();
  if (!data) return { title: "Not found" };
  return { title: data.name, description: data.tagline || "A startup laid to rest on Graveyard." };
}

export default async function StartupPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: s } = await supabase
    .from("startups")
    .select("*, founder:profiles(id, full_name, avatar_url, x_handle, linkedin_url, bio, failed_count)")
    .eq("slug", params.slug)
    .single();

  if (!s) notFound();
  const isOwner = user?.id === s.founder_id;
  const months = monthsBetween(s.started_at, s.ended_at);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <ViewTracker slug={s.slug} />
      <Link href="/browse" className="text-sm text-bone-500 hover:text-bone-300">
        ← Back to the graveyard
      </Link>

      {/* header */}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="flex items-start gap-4">
          {s.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logo_url} alt="" className="h-16 w-16 rounded-2xl border border-white/10 object-cover" />
          ) : (
            <span className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-ink-800 font-serif text-2xl text-bone-300">
              {s.name.charAt(0)}
            </span>
          )}
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-bone-100">{s.name}</h1>
            <p className="mt-1 text-bone-500">{s.tagline}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {s.category && <Badge>{s.category}</Badge>}
              <Badge className="border-white/15">{s.outcome === "pivot" ? "Pivoted" : "Shut down"}</Badge>
              {s.revenue_verified && s.verified_mrr > 0 && (
                <Badge className="border-moss-500/30 text-moss-400">
                  <BadgeCheck size={12} /> Verified revenue
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* price / actions */}
        <Card className="w-full p-5 sm:w-64">
          {s.for_sale ? (
            <>
              <div className="text-xs text-bone-500">Asking</div>
              <div className="font-serif text-3xl text-bone-100">
                {s.asking_price
                  ? money(s.asking_price)
                  : s.price_multiplier
                    ? `${s.price_multiplier}× rev`
                    : "Open to offers"}
              </div>
              {s.price_multiplier && s.claimed_mrr > 0 && (
                <div className="mt-1 text-xs text-bone-500">
                  ≈ {money(s.price_multiplier * s.claimed_mrr)} at {money(s.claimed_mrr)}/mo
                </div>
              )}
              {!isOwner && <MakeOfferButton startupId={s.id} className="mt-4 w-full" />}
            </>
          ) : (
            <div className="text-sm text-bone-500">
              Not for sale — listed as a memorial. Learn from its autopsy below.
            </div>
          )}
          {isOwner && <VerifyRevenueButton startupId={s.id} className="mt-3 w-full" />}
        </Card>
      </div>

      {/* metrics */}
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric icon={<TrendingUp size={15} />} label="Last MRR" value={money(s.claimed_mrr)} />
        <Metric
          icon={<BadgeCheck size={15} />}
          label="Verified MRR"
          value={s.revenue_verified ? money(s.verified_mrr) : "—"}
          highlight={s.revenue_verified}
        />
        <Metric icon={<Users size={15} />} label="Users" value={(s.total_users || 0).toLocaleString()} />
        <Metric icon={<Calendar size={15} />} label="Lifespan" value={months != null ? `${months} mo` : "—"} />
      </div>

      {/* body */}
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-8 md:col-span-2">
          {s.about && (
            <Section title="What it was">
              <p className="whitespace-pre-line leading-relaxed text-bone-300">{s.about}</p>
            </Section>
          )}
          <Section title={`Why it ${s.outcome === "pivot" ? "pivoted" : "died"}`}>
            <Badge className="mb-3 border-ember-500/30 text-ember-400">{s.failure_reason}</Badge>
            {s.failure_detail && (
              <p className="whitespace-pre-line leading-relaxed text-bone-300">{s.failure_detail}</p>
            )}
          </Section>
          {s.lessons_learned && (
            <Section title="Lessons learned">
              <p className="whitespace-pre-line leading-relaxed text-bone-300">{s.lessons_learned}</p>
            </Section>
          )}
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
              <a href={s.analytics_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-ember-400 hover:underline">
                <Globe size={14} /> View traffic dashboard
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
                <img src={s.founder.avatar_url} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-full bg-ember-600 font-semibold text-ink-950">
                  {(s.founder?.full_name || "?").charAt(0)}
                </span>
              )}
              <div>
                <div className="font-medium text-bone-100">{s.founder?.full_name || "Anonymous"}</div>
                <div className="text-xs text-bone-500">{s.founder?.failed_count || 0} startups buried</div>
              </div>
            </Link>
            {s.founder?.bio && <p className="mt-3 text-sm text-bone-500">{s.founder.bio}</p>}
            <div className="mt-4 flex gap-2">
              {s.founder?.x_handle && (
                <a href={`https://x.com/${s.founder.x_handle}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/10 p-2 text-bone-300 hover:border-white/25">
                  <Twitter size={15} />
                </a>
              )}
              {s.founder?.linkedin_url && (
                <a href={s.founder.linkedin_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-white/10 p-2 text-bone-300 hover:border-white/25">
                  <Linkedin size={15} />
                </a>
              )}
            </div>
          </Card>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-bone-500">
            <Eye size={13} /> {s.view_count} visits to this grave
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <Card className="p-4">
      <div className={`mb-1.5 flex items-center gap-1.5 ${highlight ? "text-moss-400" : "text-bone-500"}`}>{icon}</div>
      <div className="font-serif text-xl text-bone-100">{value}</div>
      <div className="text-xs text-bone-500">{label}</div>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-bone-500">{title}</h2>
      {children}
    </section>
  );
}
