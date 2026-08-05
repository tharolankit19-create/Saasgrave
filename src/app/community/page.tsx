import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Eyebrow } from "@/components/ui";
import { CommunityComposer, LikeButton } from "@/components/community-ui";
import { kindBadge, timeAgo } from "@/lib/community";

export const metadata: Metadata = {
  title: "Community — founders' wins, failures & questions",
  description: "Where founders share what they built, what died, and what they learned. Post your story, ask a question, and engage.",
};
export const dynamic = "force-dynamic";

type Author = { id: string; full_name: string | null; avatar_url: string | null };

export default async function CommunityPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Note: we fetch authors in a separate query rather than an embedded
  // `author:profiles(...)` join, so the feed never breaks if PostgREST's
  // relationship cache is momentarily stale after a migration.
  const { data: posts } = await supabase
    .from("community_posts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const list = posts || [];
  const ids = list.map((p: any) => p.id);

  const authors = new Map<string, Author>();
  const counts = new Map<string, number>();
  const liked = new Set<string>();

  if (ids.length) {
    const authorIds = Array.from(new Set(list.map((p: any) => p.author_id).filter(Boolean)));
    const [profs, comments, likes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, avatar_url").in("id", authorIds),
      supabase.from("community_comments").select("post_id").in("post_id", ids),
      user
        ? supabase.from("community_likes").select("post_id").eq("user_id", user.id).in("post_id", ids)
        : Promise.resolve({ data: [] as any[] }),
    ]);
    profs.data?.forEach((a: any) => authors.set(a.id, a));
    comments.data?.forEach((c: any) => counts.set(c.post_id, (counts.get(c.post_id) || 0) + 1));
    likes.data?.forEach((l: any) => liked.add(l.post_id));
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="mb-8 text-center">
        <Eyebrow>Community</Eyebrow>
        <h1 className="font-serif text-4xl tracking-tight text-bone-100">The founders' table</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-bone-400">
          Wins, failures, pivots, and the questions nobody posts on LinkedIn. Share yours — and back
          the ones that hit home.
        </p>
      </div>

      <CommunityComposer signedIn={!!user} />

      <div className="mt-6 space-y-4">
        {list.length === 0 ? (
          <Card className="p-12 text-center">
            <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl border border-black/10 text-accent-500">
              <Users size={20} />
            </span>
            <p className="font-serif text-xl text-bone-100">Be the first to speak.</p>
            <p className="mt-1 text-sm text-bone-400">Share a story, a win, or a hard question.</p>
          </Card>
        ) : (
          list.map((p: any) => {
            const badge = kindBadge(p.kind);
            const a = authors.get(p.author_id);
            return (
              <Card key={p.id} className="p-5 transition hover:shadow-lift">
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.tone}`}>
                    {badge.label}
                  </span>
                  <Link href={`/profile/${p.author_id}`} className="flex items-center gap-1.5 text-xs text-bone-400 hover:text-bone-200">
                    {a?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-5 w-5 place-items-center rounded-full bg-bone-100 text-[10px] text-white">
                        {(a?.full_name || "?").charAt(0)}
                      </span>
                    )}
                    {a?.full_name || "A founder"}
                  </Link>
                  <span className="text-xs text-bone-400">· {timeAgo(p.created_at)}</span>
                </div>
                <Link href={`/community/${p.id}`}>
                  <h2 className="font-medium leading-snug text-bone-100 hover:text-accent-600">{p.title}</h2>
                  {p.body && <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-bone-400">{p.body}</p>}
                </Link>
                <div className="mt-4 flex items-center gap-3">
                  <LikeButton postId={p.id} initialCount={p.like_count || 0} initialLiked={liked.has(p.id)} signedIn={!!user} />
                  <Link href={`/community/${p.id}`} className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium text-bone-400 transition hover:text-bone-100">
                    <MessageCircle size={13} /> {counts.get(p.id) || 0}
                  </Link>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
