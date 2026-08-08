import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Share2, Link2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Eyebrow, LinkButton } from "@/components/ui";
import { XIcon, LinkedInIcon } from "@/components/brand-icons";
import { normalizeUrl } from "@/lib/utils";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";

export const metadata: Metadata = {
  title: "The launch wall",
  description:
    "Founders who shared their launch publicly. Every one gets a second dofollow link to their site — free.",
  alternates: { canonical: `${SITE}/wall` },
};
export const dynamic = "force-dynamic";

export default async function WallPage() {
  let rows: any[] = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("startups")
      .select("slug, name, tagline, logo_url, website_url, share_url, founder:profiles(full_name)")
      .eq("status", "listed")
      .eq("share_verified", true)
      .order("created_at", { ascending: false })
      .limit(100);
    rows = data || [];
  } catch {
    /* renders the empty state below */
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <Eyebrow>The launch wall</Eyebrow>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-bone-100 sm:text-5xl">
          Founders who told the world.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-bone-400">
          Everyone here shared their launch publicly — so everyone here gets a second dofollow link
          to their own site, on top of the one on their listing. It costs nothing.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-moss-500/30 bg-moss-500/10 px-3 py-1 text-xs font-semibold text-moss-500">
            <Link2 size={12} /> Dofollow links — Google follows every one
          </span>
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((s) => {
            const site = normalizeUrl(s.website_url);
            const isLinkedIn = /linkedin\.com/i.test(s.share_url || "");
            return (
              <Card key={s.slug} className="flex items-start gap-4 p-5">
                {s.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.logo_url}
                    alt=""
                    className="h-12 w-12 shrink-0 rounded-xl border border-black/10 object-cover"
                  />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-black/10 bg-ink-800 font-serif text-lg text-bone-300">
                    {s.name.charAt(0)}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/startup/${s.slug}`}
                    className="truncate font-semibold text-bone-100 hover:text-accent-600"
                  >
                    {s.name}
                  </Link>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-bone-500">
                    {s.tagline || "No description yet."}
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {/* The reward: a dofollow link straight to their site. */}
                    {site && (
                      <a
                        href={site}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-accent-600 hover:text-accent-500"
                      >
                        {site.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        <ArrowUpRight size={11} />
                      </a>
                    )}
                    {s.share_url && (
                      <a
                        href={s.share_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-bone-500 hover:text-bone-300"
                      >
                        {isLinkedIn ? (
                          <LinkedInIcon className="h-3 w-3" />
                        ) : (
                          <XIcon className="h-2.5 w-2.5" />
                        )}
                        their post
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-14 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl border border-black/10 text-accent-400">
            <Share2 size={20} />
          </span>
          <h2 className="font-serif text-2xl text-bone-100">Nobody&apos;s on the wall yet.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-bone-500">
            List your startup, share the launch, and be the first — with two dofollow links to show
            for it.
          </p>
          <LinkButton href="/sell" size="lg" className="mt-6">
            List my startup — free
          </LinkButton>
        </Card>
      )}
    </div>
  );
}
