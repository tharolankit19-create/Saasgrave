"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";

export type SlotRow = {
  id: string;
  position: string;
  placement: string | null;
  active: boolean;
  name: string | null;
  headline: string | null;
  cta_url: string | null;
  buyer_id: string | null;
  ends_at: string | null;
};

/**
 * Drops any listed startup into any slot — used to fill unsold inventory with
 * real listings instead of leaving empty "your product here" boxes, and to
 * place a slot for someone who paid outside the normal checkout.
 */
export function SlotAssigner({
  slot,
  startups,
}: {
  slot: SlotRow;
  startups: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [pick, setPick] = useState("");
  const [busy, setBusy] = useState<"assign" | "clear" | null>(null);

  const filled = slot.active && !!slot.headline;
  const paid = !!slot.buyer_id;

  async function call(payload: object, kind: "assign" | "clear") {
    setBusy(kind);
    const res = await fetch("/api/admin/slot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slotId: slot.id, ...payload }),
    });
    setBusy(null);
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      toast.error(d.error || "Didn't work.");
      return;
    }
    toast.success(kind === "clear" ? "Slot cleared." : "Slot filled.");
    setPick("");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-black/[0.06] px-5 py-3.5 last:border-b-0">
      <div className="min-w-[9rem]">
        <div className="font-mono text-xs text-bone-300">{slot.position}</div>
        <div className="text-[10px] uppercase tracking-wider text-bone-500">
          {slot.placement || "sidebar"}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {filled ? (
          <>
            <div className="flex items-center gap-1.5">
              <Check size={12} className="shrink-0 text-moss-500" />
              <span className="truncate text-sm font-medium text-bone-100">
                {slot.name || slot.headline}
              </span>
              {paid ? (
                <span className="shrink-0 rounded-full bg-moss-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-moss-500">
                  Paid
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-ink-800 px-1.5 py-0.5 text-[9px] font-bold uppercase text-bone-500">
                  House
                </span>
              )}
            </div>
            {slot.cta_url && (
              <div className="truncate text-[11px] text-bone-500">
                {slot.cta_url.replace(/^https?:\/\//, "")}
              </div>
            )}
          </>
        ) : (
          <span className="text-sm text-bone-500">Empty</span>
        )}
      </div>

      <select
        value={pick}
        onChange={(e) => setPick(e.target.value)}
        className="h-9 max-w-[13rem] rounded-full border border-black/12 bg-ink-950 px-3 text-xs text-bone-100 outline-none focus:border-accent-500/50"
      >
        <option value="">Put a startup here…</option>
        {startups.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button
        onClick={() => call({ startupId: pick }, "assign")}
        disabled={!pick || busy !== null}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-b from-accent-400 to-accent-500 px-4 text-xs font-semibold text-white shadow-glow transition hover:brightness-105 disabled:opacity-40"
      >
        {busy === "assign" ? <Loader2 size={12} className="animate-spin" /> : "Place"}
      </button>

      {filled && (
        <button
          onClick={() => call({ clear: true }, "clear")}
          disabled={busy !== null}
          title={paid ? "This slot was paid for — clearing it removes a live ad" : "Clear this slot"}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-black/12 px-3 text-xs text-bone-400 transition hover:border-ember-600/40 hover:text-ember-400 disabled:opacity-40"
        >
          {busy === "clear" ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />}
        </button>
      )}
    </div>
  );
}
