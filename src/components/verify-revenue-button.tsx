"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui";
import { PROVIDERS, type RevenueProvider } from "@/lib/revenue";

// Founder-only: verify real revenue with a READ-ONLY key from a payment
// provider. The key is sent once to our server, used to compute MRR, and never
// stored. Only provider-verified MRR ever earns the green badge.
export function VerifyRevenueButton({ startupId, className }: { startupId: string; className?: string }) {
  const router = useRouter();
  const [provider, setProvider] = useState<RevenueProvider>("stripe");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const active = PROVIDERS.find((p) => p.id === provider)!;

  async function verify() {
    if (!key.trim()) return toast.error("Paste your read-only API key.");
    setLoading(true);
    const res = await fetch("/api/verify-revenue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startupId, provider, apiKey: key }),
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-black/10 bg-ink-900 p-7 shadow-lift focus:outline-none">
          <Dialog.Title className="font-serif text-2xl text-bone-100">Verify your revenue</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-bone-400">
            Connect a <span className="text-bone-200">read-only</span> key from your payment provider.
            We compute MRR and discard the key immediately — it is never stored.
          </Dialog.Description>

          <div className="mt-5 flex flex-wrap gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                  provider === p.id
                    ? "border-accent-500/40 bg-accent-600/10 text-accent-600"
                    : "border-black/12 text-bone-400 hover:text-bone-100"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={active.hint}
            className="mt-4 h-11 w-full rounded-xl border border-black/10 bg-ink-950 px-4 font-mono text-sm text-bone-100 outline-none focus:border-accent-500/50"
          />
          <p className="mt-2 text-[11px] text-bone-400">{active.name}: {active.hint}. Use a restricted / read-only key.</p>

          <Button className="mt-4 w-full" onClick={verify} disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Verify now"}
          </Button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
