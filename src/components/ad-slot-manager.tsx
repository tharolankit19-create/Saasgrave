"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Megaphone, Pencil, Plus, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { startCheckout } from "@/lib/checkout-client";

export type OwnedSlot = {
  id: string;
  position: string;
  active: boolean;
  headline: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image_url: string | null;
  ends_at: string | null;
};

// The founder-facing promotions panel: manage the ad slots you've bought and
// book a new one. Editing writes through /api/ad-slot (ownership-checked);
// booking kicks off a Dodo checkout for a specific open slot.
export function AdSlotManager({
  owned,
  openSlotId,
  openCount,
}: {
  owned: OwnedSlot[];
  openSlotId: string | null;
  openCount: number;
}) {
  const [booking, setBooking] = useState(false);

  async function book() {
    if (!openSlotId) return;
    setBooking(true);
    const ok = await startCheckout("ad_slot", openSlotId);
    if (!ok) setBooking(false);
  }

  return (
    <div className="grid gap-4">
      {owned.map((slot) => (
        <SlotCard key={slot.id} slot={slot} />
      ))}

      {/* Book-a-slot upsell — always present so there's a path to promote. */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-accent-500/30 bg-accent-600/[0.04] p-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-black/10 bg-ink-900 text-accent-500 shadow-card">
            <Megaphone size={18} />
          </span>
          <div>
            <h3 className="text-sm font-medium text-bone-100">Promote a listing</h3>
            <p className="mt-0.5 text-xs text-bone-500">
              {openCount > 0
                ? `${openCount} of 6 premium slots open · $49 / 30 days · beside every listing`
                : "All 6 slots are booked right now — check back soon."}
            </p>
          </div>
        </div>
        <Button size="md" onClick={book} disabled={booking || openCount === 0}>
          {booking ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
          {openCount > 0 ? "Book a slot" : "Sold out"}
        </Button>
      </div>
    </div>
  );
}

function SlotCard({ slot }: { slot: OwnedSlot }) {
  const live = slot.active && slot.headline;
  const ends = slot.ends_at ? new Date(slot.ends_at) : null;
  const daysLeft = ends ? Math.max(0, Math.ceil((ends.getTime() - Date.now()) / 86_400_000)) : null;

  return (
    <div className="rounded-2xl border border-black/8 bg-ink-900 p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-moss-500/10 px-2.5 py-1 text-xs font-medium text-moss-400">
            <CheckCircle2 size={12} /> {live ? "Live" : "Ready to set up"}
          </span>
          <span className="text-xs text-bone-500">Slot {slot.position}</span>
        </div>
        {daysLeft != null && (
          <span className="text-xs text-bone-500">{daysLeft} days left</span>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {slot.headline ? (
            <>
              <p className="truncate font-medium text-bone-100">{slot.headline}</p>
              {slot.body && <p className="mt-0.5 line-clamp-2 text-sm text-bone-500">{slot.body}</p>}
              {slot.cta_url && (
                <a
                  href={slot.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs text-accent-500 hover:text-accent-600"
                >
                  {slot.cta_label || "Visit"} <ExternalLink size={11} />
                </a>
              )}
            </>
          ) : (
            <p className="text-sm text-bone-500">
              No creative yet — add a headline and link so it goes live beside every listing.
            </p>
          )}
        </div>
        <EditSlotDialog slot={slot} />
      </div>
    </div>
  );
}

function EditSlotDialog({ slot }: { slot: OwnedSlot }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    headline: slot.headline ?? "",
    body: slot.body ?? "",
    cta_label: slot.cta_label ?? "",
    cta_url: slot.cta_url ?? "",
    image_url: slot.image_url ?? "",
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    const res = await fetch("/api/ad-slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id, ...form }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Couldn't save.");
      return;
    }
    toast.success("Creative updated — it's live beside every listing.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/12 bg-ink-900 px-3.5 py-2 text-xs font-medium text-bone-300 transition hover:border-black/25 hover:text-bone-100">
          <Pencil size={12} /> Edit
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-black/10 bg-ink-900 p-6 shadow-lift focus:outline-none">
          <Dialog.Title className="font-serif text-xl text-bone-100">Edit your ad</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-bone-500">
            Slot {slot.position} · shown beside every listing on the graveyard.
          </Dialog.Description>

          <div className="mt-5 space-y-3">
            <Field label="Headline" value={form.headline} onChange={(v) => set("headline", v)} placeholder="Ship your SaaS in a weekend" max={60} />
            <Field label="One line of body" value={form.body} onChange={(v) => set("body", v)} placeholder="The boilerplate that saves you 40 hours." max={140} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Button label" value={form.cta_label} onChange={(v) => set("cta_label", v)} placeholder="Try it" max={24} />
              <Field label="Link URL" value={form.cta_url} onChange={(v) => set("cta_url", v)} placeholder="https://…" max={300} />
            </div>
            <Field label="Image URL (optional)" value={form.image_url} onChange={(v) => set("image_url", v)} placeholder="https://…/banner.png" max={500} />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="outline" size="md">Cancel</Button>
            </Dialog.Close>
            <Button size="md" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : "Save creative"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-bone-500">{label}</span>
      <input
        value={value}
        maxLength={max}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-black/10 bg-ink-950 px-3.5 text-sm text-bone-100 placeholder:text-bone-500/60 outline-none transition focus:border-accent-500/50"
      />
    </label>
  );
}
