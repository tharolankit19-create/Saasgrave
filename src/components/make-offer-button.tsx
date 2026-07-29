"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui";

export function MakeOfferButton({ startupId, className }: { startupId: string; className?: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function submit() {
    const value = Number(amount);
    if (!value || value <= 0) return toast.error("Enter a valid offer amount.");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("offers").insert({
      startup_id: startupId,
      buyer_id: user.id,
      amount: value,
      message: message.trim() || null,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Offer sent. The founder will be notified.");
    setOpen(false);
    setAmount("");
    setMessage("");
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button className={className}>Make an offer</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-ink-850 p-7 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-serif text-2xl text-bone-100">Make an offer</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-bone-500">
            Serious offers move faster. Tell the founder your plan for it.
          </Dialog.Description>
          <div className="mt-5 space-y-3">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Offer amount ($)"
              className="h-11 w-full rounded-xl border border-white/10 bg-ink-900 px-4 text-sm text-bone-100 outline-none focus:border-ember-500/50"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="What would you do with it?"
              className="w-full rounded-xl border border-white/10 bg-ink-900 p-4 text-sm text-bone-100 outline-none focus:border-ember-500/50"
            />
            <Button className="w-full" onClick={submit} disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Send offer"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
