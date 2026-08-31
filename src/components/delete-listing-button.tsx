"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

// Deleting a listing is permanent and takes its offers with it (the FK
// cascades), so it always goes through a confirm step that names the startup.
export function DeleteListingButton({
  startupId,
  name,
  forSale,
}: {
  startupId: string;
  name?: string | null;
  forSale?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function remove() {
    setDeleting(true);
    // Routed through the server so one place owns the ownership check and we
    // can report a blocked delete properly instead of failing silently on RLS.
    const res = await fetch("/api/listing/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId }),
    });
    const data = await res.json().catch(() => ({}));
    setDeleting(false);
    if (!res.ok) return toast.error(data.error || "Couldn't delete that listing.");
    toast.success("Listing deleted.");
    setOpen(false);
    router.refresh();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          aria-label="Delete listing"
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-black/12 px-3 text-sm text-bone-400 transition hover:border-red-500/40 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-black/10 bg-ink-900 p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="text-lg font-bold tracking-tight text-bone-100">
            Delete {name || "this listing"}?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-bone-400">
            This permanently removes the listing, its page and any offers on it. It can&apos;t be
            undone.
            {forSale && " You will not be refunded the fee to open it for sale."}
          </Dialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="inline-flex h-10 items-center rounded-full border border-black/12 px-4 text-sm text-bone-300 transition hover:border-black/25">
                Keep it
              </button>
            </Dialog.Close>
            <button
              onClick={remove}
              disabled={deleting}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              Delete permanently
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
