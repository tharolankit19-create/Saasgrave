"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";

type Defaults = {
  full_name: string;
  avatar_url: string;
  bio: string;
  location: string;
  website_url: string;
  x_handle: string;
  linkedin_url: string;
  failed_count: number;
};

export function EditProfileForm({ defaults }: { defaults: Defaults }) {
  const supabase = createClient();
  const router = useRouter();
  const [f, setF] = useState(defaults);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof Defaults>(k: K, v: Defaults[K]) {
    setF((p) => ({ ...p, [k]: v }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return toast.error("Session expired.");
    }
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: f.full_name.trim(),
        avatar_url: f.avatar_url.trim() || null,
        bio: f.bio.trim() || null,
        location: f.location.trim() || null,
        website_url: f.website_url.trim() || null,
        x_handle: f.x_handle.trim().replace(/^@/, "") || null,
        linkedin_url: f.linkedin_url.trim() || null,
        failed_count: Number(f.failed_count) || 0,
        onboarded: true,
      },
      { onConflict: "id" }
    );
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated.");
    router.push(`/profile/${user.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl border border-white/8 bg-ink-900/60 p-7">
      <Field label="Full name" value={f.full_name} onChange={(v) => set("full_name", v)} />
      <ImageUpload
        bucket="avatars"
        shape="circle"
        label="Profile picture"
        value={f.avatar_url}
        onChange={(v) => set("avatar_url", v)}
      />
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-bone-500">Bio</span>
        <textarea
          value={f.bio}
          rows={3}
          onChange={(e) => set("bio", e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-ink-900 p-4 text-sm text-bone-100 outline-none focus:border-ember-500/50"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location" value={f.location} onChange={(v) => set("location", v)} />
        <Field label="Website" value={f.website_url} onChange={(v) => set("website_url", v)} placeholder="https://…" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="X / Twitter" value={f.x_handle} onChange={(v) => set("x_handle", v)} placeholder="@handle" />
        <Field label="LinkedIn" value={f.linkedin_url} onChange={(v) => set("linkedin_url", v)} placeholder="linkedin.com/in/…" />
      </div>
      <Field label="Startups buried" type="number" value={String(f.failed_count)} onChange={(v) => set("failed_count", Number(v))} />
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}

function Field({
  label, value, onChange, placeholder, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-bone-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-white/10 bg-ink-900 px-4 text-sm text-bone-100 outline-none focus:border-ember-500/50"
      />
    </label>
  );
}
