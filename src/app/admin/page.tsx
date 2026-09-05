import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Link2, Megaphone, Sparkles, ExternalLink, Check, Minus } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin";
import { Card, Eyebrow } from "@/components/ui";
import { ArticleButton } from "@/components/admin/article-button";
import { SlotAssigner, type SlotRow } from "@/components/admin/slot-assigner";
import { normalizeUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";

export default async function AdminPage() {
  // 404 rather than 403 — an admin panel shouldn't advertise that it exists.
  const user = await getAdminUser();
  if (!user) notFound();

  const admin = createAdminClient();
  const [{ data: startups }, { data: slots }] = await Promise.all([
    admin
      .from("startups")
      .select(
        "id, name, slug, status, website_url, seo_article, seo_article_at, share_url, share_verified, featured, featured_until, directory_status"
      )
      .order("created_at", { ascending: false })
      .limit(200),
    admin.from("ad_slots").select("*").order("position"),
  ]);

  const { data: queuedLaunches } = await admin.from("launch_orders").select("id, startup_id, product, queued_placements, created_at").eq("placement_status", "needs_scheduling").order("created_at");
  const list = startups || [];
  const listed = list.filter((s) => s.status === "listed");
  const hasArticle = (s: any) => !!(s.seo_article && s.seo_article.trim().length > 200);

  const stats = {
    listed: listed.length,
    articles: list.filter(hasArticle).length,
    missing: listed.filter((s) => !hasArticle(s)).length,
    shares: list.filter((s) => s.share_verified).length,
    // Every listed startup carries a dofollow link; shares and articles add more.
    backlinks:
      listed.filter((s) => s.website_url).length +
      list.filter((s) => s.share_verified).length +
      list.filter(hasArticle).length,
    directory: list.filter((s) => s.directory_status === "paid").length,
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-10">
        <Eyebrow>Admin</Eyebrow>
        <h1 className="text-3xl font-bold tracking-tight text-bone-100 sm:text-4xl">
          The back room
        </h1>
        <p className="mt-2 text-sm text-bone-500">
          Signed in as {user.email}. Nothing here is public — the page 404s for everyone else.
        </p>
      </div>

      {/* ── At a glance ─────────────────────────────────── */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <FileText size={16} />, value: stats.articles, label: "articles published" },
          { icon: <Sparkles size={16} />, value: stats.missing, label: "listings still missing one" },
          { icon: <Link2 size={16} />, value: stats.backlinks, label: "outbound dofollow links" },
          { icon: <Megaphone size={16} />, value: stats.directory, label: "directory blasts owed" },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-2xl border border-black/8 bg-ink-900 p-5 shadow-card"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-500/10 text-accent-600">
              {s.icon}
            </span>
            <div>
              <div className="font-mono text-2xl font-bold leading-none tabular-nums text-bone-100">
                {s.value}
              </div>
              <div className="mt-1.5 text-xs text-bone-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {!!queuedLaunches?.length && <Card className="mb-10 p-5"><h2 className="font-semibold">Paid launches awaiting placements</h2><p className="mt-2 text-xs text-bone-500">These launches are paid and live. Arrange the missing placements with each founder and update the order after scheduling.</p><ul className="mt-4 space-y-3">{queuedLaunches.map(order => <li key={order.id} className="text-sm"><strong>{list.find(s => s.id === order.startup_id)?.name || order.startup_id}</strong> · {order.product} · {(order.queued_placements || []).join(", ")}<div className="break-all font-mono text-xs text-bone-500">Order {order.id}</div></li>)}</ul></Card>}

      {/* ── Ad slots ────────────────────────────────────── */}
      <h2 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600">
        <Megaphone size={13} /> Ad slots
      </h2>
      <p className="mb-4 text-xs text-bone-500">
        Put any listed startup into any slot. Placed this way it&apos;s a house ad — no buyer
        attached, so the slot stays free to sell.
      </p>
      <Card className="mb-12 overflow-hidden p-0">
        {(slots || []).map((slot) => (
          <SlotAssigner
            key={slot.id}
            slot={slot as SlotRow}
            startups={listed.map((s) => ({ id: s.id, name: s.name }))}
          />
        ))}
      </Card>

      {/* ── Articles, blogs & backlinks ─────────────────── */}
      <h2 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600">
        <FileText size={13} /> Articles &amp; backlinks
      </h2>
      <p className="mb-4 text-xs text-bone-500">
        One click writes and publishes a startup&apos;s long-form write-up at{" "}
        <span className="font-mono">/read/[slug]</span> — that&apos;s the page that earns the search
        traffic and carries the dofollow link.
      </p>

      <Card className="overflow-hidden p-0">
        <div className="hidden grid-cols-[1fr_5rem_5rem_5rem_auto] gap-4 border-b border-black/8 bg-ink-850/50 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-bone-500 sm:grid">
          <span>Startup</span>
          <span className="text-center">Article</span>
          <span className="text-center">Site link</span>
          <span className="text-center">Shared</span>
          <span className="text-right">Action</span>
        </div>

        {listed.map((s) => {
          const site = normalizeUrl(s.website_url);
          const article = hasArticle(s);
          return (
            <div
              key={s.id}
              className="grid grid-cols-1 items-center gap-3 border-b border-black/[0.06] px-5 py-3.5 last:border-b-0 sm:grid-cols-[1fr_5rem_5rem_5rem_auto] sm:gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/startup/${s.slug}`}
                    className="truncate text-sm font-medium text-bone-100 hover:text-accent-600"
                  >
                    {s.name}
                  </Link>
                  {s.featured && (
                    <span className="shrink-0 rounded-full bg-accent-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase text-accent-600">
                      Featured
                    </span>
                  )}
                </div>
                {article && (
                  <Link
                    href={`/read/${s.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] text-bone-500 hover:text-accent-600"
                  >
                    /read/{s.slug} <ExternalLink size={9} />
                  </Link>
                )}
              </div>

              <Flag on={article} />
              <Flag on={!!site} href={site} />
              <Flag on={!!s.share_verified} href={s.share_url} />

              <div className="flex justify-end">
                <ArticleButton startupId={s.id} hasArticle={article} />
              </div>
            </div>
          );
        })}
      </Card>

      <p className="mt-6 text-center text-xs text-bone-500">
        Shared launches appear on the{" "}
        <Link href="/wall" className="text-accent-600 hover:underline">
          launch wall
        </Link>{" "}
        with a second dofollow link. Site: {SITE}
      </p>
    </div>
  );
}

/** A tick, a dash, or a tick that links out. */
function Flag({ on, href }: { on: boolean; href?: string | null }) {
  const mark = on ? (
    <Check size={14} className="text-moss-500" />
  ) : (
    <Minus size={14} className="text-bone-500/50" />
  );
  return (
    <span className="flex justify-start sm:justify-center">
      {on && href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" title={href}>
          {mark}
        </a>
      ) : (
        mark
      )}
    </span>
  );
}
