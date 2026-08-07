import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data } = await supabase.from("founder_guides").select("title, summary").eq("slug", params.slug).single();
  if (!data) return { title: "Guide" };
  return { title: data.title, description: data.summary || undefined };
}

export const dynamic = "force-dynamic";

export default async function FounderGuidePage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: g } = await supabase.from("founder_guides").select("*").eq("slug", params.slug).single();
  if (!g) notFound();

  const { data: author } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", g.author_id)
    .single();

  return (
    <article className="mx-auto max-w-3xl px-5 py-12">
      <nav className="mb-6 flex items-center gap-2 text-sm text-bone-500">
        <Link href="/" className="hover:text-bone-300">Saasgrave</Link>
        <span>›</span>
        <Link href="/guides" className="hover:text-bone-300">Stories</Link>
      </nav>

      <header>
        <span className="text-xs font-semibold uppercase tracking-wider text-accent-600">From a founder</span>
        <h1 className="mt-3 font-serif text-[2.1rem] leading-[1.1] tracking-tight text-bone-100 sm:text-5xl">{g.title}</h1>
        {g.summary && <p className="mt-3 text-[17px] leading-relaxed text-bone-400">{g.summary}</p>}
        <Link href={`/profile/${g.author_id}`} className="mt-5 inline-flex items-center gap-2 text-sm text-bone-400 hover:text-bone-200">
          {author?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />
          ) : (
            <span className="grid h-7 w-7 place-items-center rounded-full bg-bone-100 text-xs text-white">
              {(author?.full_name || "?").charAt(0)}
            </span>
          )}
          <span className="font-medium">{author?.full_name || "A founder"}</span>
          <span className="text-bone-500">· {new Date(g.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </Link>
      </header>

      <div className="mt-9 space-y-5">
        {g.body.split(/\n{2,}/).map((para: string, i: number) => (
          <p key={i} className="whitespace-pre-line text-[16px] leading-relaxed text-bone-300">{para}</p>
        ))}
      </div>

      <Card className="mt-12 p-7 text-center">
        <p className="font-serif text-xl text-bone-100">Got a lesson worth sharing?</p>
        <p className="mt-1.5 text-sm text-bone-400">Write your own guide — it goes live with your name on it.</p>
        <Link href="/guides/write" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-bone-100 px-6 text-sm font-medium text-ink-950 shadow-card transition hover:shadow-lift">
          Write a guide
        </Link>
      </Card>

      <Link href="/guides" className="mt-10 inline-flex items-center gap-1.5 text-sm text-bone-500 hover:text-bone-300">
        <ArrowLeft size={14} /> All guides
      </Link>
    </article>
  );
}
