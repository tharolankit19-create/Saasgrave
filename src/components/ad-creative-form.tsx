"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui";
import { ImageUpload } from "@/components/image-upload";

export type CreativeSlot = {
  id: string;
  name: string | null;
  headline: string | null;
  body: string | null;
  cta_url: string | null;
  image_url: string | null;
};

/**
 * The form a buyer fills in immediately after paying: the name of their SaaS,
 * its logo, a headline and the link. Shown on the checkout success page (so the
 * purchase is never a dead end) and reused from the dashboard for edits.
 */
export function AdCreativeForm({
  slot,
  onSaved,
  compact = false,
}: {
  slot: CreativeSlot;
  onSaved?: () => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: slot.name ?? "",
    headline: slot.headline ?? "",
    body: slot.body ?? "",
    cta_url: slot.cta_url ?? "",
    image_url: slot.image_url ?? "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.headline.trim() || !form.cta_url.trim()) {
      toast.error("Name, headline and link are all needed to go live.");
      return;
    }
    // Accept "example.com" as readily as a full URL.
    const url = /^https?:\/\//i.test(form.cta_url.trim())
      ? form.cta_url.trim()
      : `https://${form.cta_url.trim()}`;

    setSaving(true);
    const res = await fetch("/api/ad-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id, ...form, cta_url: url }),
    });
    setSaving(false);

    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Couldn't save. Try again.");
      return;
    }
    setSaved(true);
    toast.success("You're live — your ad is showing beside every listing.");
    onSaved?.();
    router.refresh();
  }

  return (
    <form onSubmit={save} className={compact ? "space-y-4" : "space-y-5"}>
      <ImageUpload
        bucket="logos"
        label="Your logo"
        hint="square works best"
        value={form.image_url}
        onChange={(v) => set("image_url", v)}
      />

      <Field
        label="Name"
        value={form.name}
        onChange={(v) => set("name", v)}
        placeholder="KryxAI"
        max={40}
        required
      />
      <Field
        label="Headline"
        value={form.headline}
        onChange={(v) => set("headline", v)}
        placeholder="Grow on LinkedIn & X in your own voice"
        max={60}
        required
      />
      <Field
        label="One line of detail"
        value={form.body}
        onChange={(v) => set("body", v)}
        placeholder="Optional — a single sentence that earns the click."
        max={140}
      />
      <Field
        label="Link"
        value={form.cta_url}
        onChange={(v) => set("cta_url", v)}
        placeholder="yourproduct.com"
        max={300}
        required
      />

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" size="md" disabled={saving}>
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : saved ? (
            <>
              <Check size={16} /> Saved
            </>
          ) : (
            "Save & go live"
          )}
        </Button>
        {saved && form.cta_url && (
          <a
            href={/^https?:\/\//i.test(form.cta_url) ? form.cta_url : `https://${form.cta_url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-accent-600 hover:text-accent-500"
          >
            Preview link <ExternalLink size={13} />
          </a>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  max,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-bone-500">
        {label}
        {required && <span className="text-accent-600">*</span>}
      </span>
      <input
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-black/10 bg-ink-950 px-3.5 text-sm text-bone-100 outline-none transition placeholder:text-bone-500/60 focus:border-accent-500/50"
      />
    </label>
  );
}
