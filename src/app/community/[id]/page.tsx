import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";
import { LikeButton, CommentForm } from "@/components/community-ui";
import { kindBadge, timeAgo } from "@/lib/community";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from("community_posts").select("title").eq("id", params.id).single();
  return { title: data?.title || "Community" };
}

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("community_posts")
    .select("*, author:profiles(id, full_name, avatar_url)")
    .eq("id", params.id)
    .single();
  if (!post) notFound();

  const { data: comments } = await supabase
    .from("community_comments")
    .select("*, author:profiles(id, full_name, avatar_url)")
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  let liked = false;
  if (user) {
    const { data } = await supabase
      .from("community_likes")
      .select("post_id")
      .eq("user_id", user.id)
      .eq("post_id", params.id)
      .maybeSingle();
    liked = !!data;
  }

  const badge = kindBadge(post.kind);
  const list = comments || [];

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-bone-500 transition hover:text-bone-300">
        <ArrowLeft size={14} /> Community
      </Link>

      <Card className="mt-5 p-7">
        <div className="mb-3 flex items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${badge.tone}`}>
            {badge.label}
          </span>
          <Link href={`/profile/${post.author?.id}`} className="flex items-center gap-1.5 text-xs text-bone-500 hover:text-bone-300">
            {post.author?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
            ) : (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-bone-100 text-[10px] text-white">
                {(post.author?.full_name || "?").charAt(0)}
              </span>
            )}
            {post.author?.full_name || "A founder"}
          </Link>
          <span className="text-xs text-bone-500">· {timeAgo(post.created_at)}</span>
        </div>
        <h1 className="font-serif text-2xl leading-snug tracking-tight text-bone-100">{post.title}</h1>
        {post.body && <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-bone-300">{post.body}</p>}
        <div className="mt-5">
          <LikeButton postId={post.id} initialCount={post.like_count || 0} initialLiked={liked} signedIn={!!user} />
        </div>
      </Card>

      <h2 className="mb-4 mt-8 text-sm font-semibold uppercase tracking-wide text-bone-500">
        {list.length} {list.length === 1 ? "reply" : "replies"}
      </h2>

      <div className="mb-6">
        <CommentForm postId={post.id} signedIn={!!user} />
      </div>

      <div className="space-y-3">
        {list.map((c: any) => (
          <div key={c.id} className="rounded-xl border border-black/8 bg-ink-900 p-4 shadow-sm">
            <div className="mb-1.5 flex items-center gap-1.5 text-xs text-bone-500">
              <Link href={`/profile/${c.author?.id}`} className="flex items-center gap-1.5 hover:text-bone-300">
                {c.author?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.author.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                ) : (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-bone-100 text-[10px] text-white">
                    {(c.author?.full_name || "?").charAt(0)}
                  </span>
                )}
                {c.author?.full_name || "A founder"}
              </Link>
              <span>· {timeAgo(c.created_at)}</span>
            </div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-bone-300">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
