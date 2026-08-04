import { notFound } from "next/navigation";
import { Twitter, Linkedin, Globe, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui";
import { StartupCard } from "@/components/startup-card";

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

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Card className="grave-grid p-8">
        <div className="flex flex-wrap items-center gap-5">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full border border-black/10 object-cover" />
          ) : (
            <span className="grid h-20 w-20 place-items-center rounded-full bg-ember-600 font-serif text-3xl text-ink-950">
              {(profile.full_name || "?").charAt(0)}
            </span>
          )}
          <div className="flex-1">
            <h1 className="font-serif text-3xl tracking-tight text-bone-100">
              {profile.full_name || "Anonymous founder"}
            </h1>
            {profile.bio && <p className="mt-1 max-w-lg text-sm text-bone-500">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge className="border-ember-500/30 text-ember-400">
                {profile.failed_count || 0} startups buried
              </Badge>
              {profile.location && (
                <span className="inline-flex items-center gap-1 text-xs text-bone-500">
                  <MapPin size={12} /> {profile.location}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {profile.x_handle && (
              <a href={`https://x.com/${profile.x_handle}`} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-black/10 p-2.5 text-bone-300 hover:border-black/25">
                <Twitter size={16} />
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-black/10 p-2.5 text-bone-300 hover:border-black/25">
                <Linkedin size={16} />
              </a>
            )}
            {profile.website_url && (
              <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-black/10 p-2.5 text-bone-300 hover:border-black/25">
                <Globe size={16} />
              </a>
            )}
          </div>
        </div>
      </Card>

      <h2 className="mb-4 mt-10 text-sm font-medium uppercase tracking-widest text-bone-500">
        Their graveyard
      </h2>
      {startups && startups.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {startups.map((s: any) => (
            <StartupCard key={s.id} startup={s} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-bone-500">No public listings yet.</p>
      )}
    </div>
  );
}
