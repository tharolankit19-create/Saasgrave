"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";

// Founder-only: verify real revenue with a READ-ONLY Stripe restricted key.
// The key is sent once to our server, used to compute MRR, and never stored.
export function VerifyRevenueButton({ startupId, className }: { startupId: string; className?: string }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function verify() {
    if (!key.startsWith("rk_") && !key.startsWith("sk_")) {
      return toast.error("Paste a Stripe restricted (rk_) key with read-only access.");
    }
    setLoading(true);
    const res = await fetch("/api/verify-revenue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId, provider: "stripe", apiKey: key }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error || "Verification failed.");
    toast.success(`Verified ${data.mrr ? `$${data.mrr}/mo` : "revenue"}. Green badge added.`);
    setOpen(false);
    setKey("");
    router.refresh();
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" className={className}>
          <ShieldCheck size={15} /> Verify revenue
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-ink-850 p-7 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-serif text-2xl text-bone-100">Verify your revenue</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-bone-500">
            Paste a Stripe <span className="text-bone-300">restricted, read-only</span> key. We compute
            your MRR and discard the key immediately — it is never stored.
          </Dialog.Description>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="rk_live_…"
            className="mt-5 h-11 w-full rounded-xl border border-white/10 bg-ink-900 px-4 font-mono text-sm text-bone-100 outline-none focus:border-ember-500/50"
          />
          <Button className="mt-4 w-full" onClick={verify} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify now"}
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
