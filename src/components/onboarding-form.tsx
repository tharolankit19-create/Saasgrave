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
  x_handle: string;
  linkedin_url: string;
  failed_count: number;
  fail_reasons: string;
};

export function OnboardingForm({ defaults }: { defaults: Defaults }) {
  const supabase = createClient();
  const router = useRouter();
  const [form, setForm] = useState(defaults);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof Defaults>(key: K, value: Defaults[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim()) return toast.error("Your name is required.");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return toast.error("Session expired. Please sign in again.");
    }

    // upsert (not update): creates the row if the trigger never ran for this
    // user — e.g. they signed up before the schema was applied.
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: form.full_name.trim(),
        avatar_url: form.avatar_url.trim() || null,
        x_handle: form.x_handle.trim().replace(/^@/, "") || null,
        linkedin_url: form.linkedin_url.trim() || null,
        failed_count: Number(form.failed_count) || 0,
        fail_reasons: form.fail_reasons.trim() || null,
        onboarded: true,
      },
      { onConflict: "id" }
    );

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    toast.success("Profile saved.");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/8 bg-ink-900/60 p-7">
      <Field
        label="Full name"
        required
        value={form.full_name}
        onChange={(v) => set("full_name", v)}
        placeholder="Jane Founder"
      />
      <ImageUpload
        bucket="avatars"
        shape="circle"
        label="Profile picture"
        hint="optional"
        value={form.avatar_url}
        onChange={(v) => set("avatar_url", v)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="X / Twitter"
          optional
          value={form.x_handle}
          onChange={(v) => set("x_handle", v)}
          placeholder="@handle"
        />
        <Field
          label="LinkedIn"
          optional
          value={form.linkedin_url}
          onChange={(v) => set("linkedin_url", v)}
          placeholder="linkedin.com/in/…"
        />
      </div>
      <Field
        label="How many startups have you shut down?"
        type="number"
        value={String(form.failed_count)}
        onChange={(v) => set("failed_count", Number(v))}
      />
      <label className="block">
        <span className="mb-1.5 flex text-xs font-medium text-bone-500">
          What usually went wrong? <span className="ml-auto text-bone-500/60">optional</span>
        </span>
        <textarea
          value={form.fail_reasons}
          onChange={(e) => set("fail_reasons", e.target.value)}
          rows={3}
          placeholder="No market need, ran out of runway, co-founder split…"
          className="w-full rounded-xl border border-white/10 bg-ink-900 p-4 text-sm text-bone-100 placeholder:text-bone-500/60 outline-none transition focus:border-accent-500/50"
        />
      </label>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Saving…" : "Save & continue"}
      </Button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex text-xs font-medium text-bone-500">
        {label}
        {optional && <span className="ml-auto text-bone-500/60">optional</span>}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-white/10 bg-ink-900 px-4 text-sm text-bone-100 placeholder:text-bone-500/60 outline-none transition focus:border-ember-500/50"
      />
    </label>
  );
}
