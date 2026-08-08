"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Megaphone, Pencil, Plus, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { Button, LinkButton } from "@/components/ui";
import { AdCreativeForm } from "@/components/ad-creative-form";

export type OwnedSlot = {
  id: string;
  position: string;
  placement?: string | null;
  active: boolean;
  name: string | null;
  headline: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image_url: string | null;
  ends_at: string | null;
};

const PLACEMENT_LABEL: Record<string, string> = {
  sidebar: "Sidebar slot",
  sponsored: "Sponsored row",
  newsletter: "Newsletter mention",
};

// The founder-facing promotions panel: manage the placements you've bought and
// book a new one. Editing writes through /api/ad-slot (ownership-checked).
export function AdSlotManager({
  owned,
  openCount,
}: {
  owned: OwnedSlot[];
  openCount: number;
}) {
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
            <h3 className="text-sm font-medium text-bone-100">Promote your product</h3>
            <p className="mt-0.5 text-xs text-bone-500">
              {openCount > 0
                ? `${openCount} placements open · featured launch $9 a week, sidebar $19, sponsored row $29 and newsletter $49 a month`
                : "Every placement is booked right now — check back soon."}
            </p>
          </div>
        </div>
        {openCount > 0 ? (
          <LinkButton href="/promote" size="md">
            <Plus size={16} /> Book a placement
          </LinkButton>
        ) : (
          <Button size="md" disabled>
            Sold out
          </Button>
        )}
      </div>
    </div>
  );
}

function SlotCard({ slot }: { slot: OwnedSlot }) {
  const ready = !!(slot.headline && slot.cta_url);
  const live = slot.active && ready;
  const ends = slot.ends_at ? new Date(slot.ends_at) : null;
  const daysLeft = ends ? Math.max(0, Math.ceil((ends.getTime() - Date.now()) / 86_400_000)) : null;
  const label = PLACEMENT_LABEL[slot.placement || "sidebar"] || "Placement";

  return (
    <div
      className={`rounded-2xl border bg-ink-900 p-5 shadow-card ${
        ready ? "border-black/8" : "border-accent-500/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {live ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-moss-500/10 px-2.5 py-1 text-xs font-medium text-moss-400">
              <CheckCircle2 size={12} /> Live
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/15 px-2.5 py-1 text-xs font-semibold text-accent-600">
              <AlertCircle size={12} /> Add your product to go live
            </span>
          )}
          <span className="text-xs text-bone-500">
            {label} · {slot.position}
          </span>
        </div>
        {daysLeft != null && <span className="text-xs text-bone-500">{daysLeft} days left</span>}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {slot.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slot.image_url}
              alt=""
              className="h-11 w-11 shrink-0 rounded-lg border border-black/10 bg-white object-contain p-1"
            />
          )}
          <div className="min-w-0">
            {ready ? (
              <>
                {slot.name && <p className="truncate text-sm font-semibold text-bone-100">{slot.name}</p>}
                <p className="truncate text-sm text-bone-300">{slot.headline}</p>
                {slot.body && <p className="mt-0.5 line-clamp-2 text-xs text-bone-500">{slot.body}</p>}
                {slot.cta_url && (
                  <a
                    href={slot.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-xs text-accent-500 hover:text-accent-600"
                  >
                    {slot.cta_url.replace(/^https?:\/\//, "")} <ExternalLink size={11} />
                  </a>
                )}
              </>
            ) : (
              <p className="text-sm text-bone-500">
                You&apos;ve paid for this placement — add your logo, name, headline and link and it
                goes live immediately.
              </p>
            )}
          </div>
        </div>
        <EditSlotDialog slot={slot} ready={ready} />
      </div>
    </div>
  );
}

function EditSlotDialog({ slot, ready }: { slot: OwnedSlot; ready: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {ready ? (
          <button className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/12 bg-ink-900 px-3.5 py-2 text-xs font-medium text-bone-300 transition hover:border-black/25 hover:text-bone-100">
            <Pencil size={12} /> Edit
          </button>
        ) : (
          <button className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-4 text-xs font-semibold text-white shadow-glow transition hover:brightness-105">
            <Plus size={13} /> Set it up
          </button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-black/10 bg-ink-900 p-6 shadow-lift focus:outline-none">
          <Dialog.Title className="font-serif text-xl text-bone-100">Your ad</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-bone-500">
            {PLACEMENT_LABEL[slot.placement || "sidebar"] || "Placement"} · {slot.position}
          </Dialog.Description>

          <div className="mt-5">
            <AdCreativeForm slot={slot} onSaved={() => setOpen(false)} compact />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
