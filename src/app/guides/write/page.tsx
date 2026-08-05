import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Eyebrow } from "@/components/ui";
import { GuideComposer } from "@/components/guide-composer";

export const metadata: Metadata = { title: "Write a guide" };
export const dynamic = "force-dynamic";

export default async function WriteGuidePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <Link href="/guides" className="inline-flex items-center gap-1.5 text-sm text-bone-500 transition hover:text-bone-300">
        <ArrowLeft size={14} /> Guides
      </Link>
      <div className="mb-8 mt-5">
        <Eyebrow>Write a guide</Eyebrow>
        <h1 className="font-serif text-4xl tracking-tight text-bone-100">Share what you learned</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-bone-400">
          You&apos;ve built, shipped, and learned the hard way. Turn that into a guide other founders
          can use — it goes live on Saasgrave with your name on it.
        </p>
      </div>
      <GuideComposer signedIn={!!user} />
    </div>
  );
}
