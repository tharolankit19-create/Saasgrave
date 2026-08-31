"use client";

import { useState } from "react";
import { Tag, Rocket, Check } from "lucide-react";
import { SALE_LISTING } from "@/lib/ad-pricing";

// Sits at the top of /sell so the two outcomes are a visible choice before the
// form is filled in, rather than a checkbox buried in the last step. It only
// explains the paths — the actual sale fee is charged at the end, from the
// form's own "List for sale" button.
export function SellIntentBanner() {
  const [intent, setIntent] = useState<"record" | "sell">("sell");

  return (
    <div className="mb-8 rounded-2xl border border-black/8 bg-ink-900 p-5 shadow-card">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-600">
        What are you here to do?
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <IntentCard
          active={intent === "sell"}
          onClick={() => setIntent("sell")}
          icon={<Tag size={16} />}
          title="Sell your startup"
          price={`$${SALE_LISTING.dollars} one-off`}
          lines={["Listed on the For Sale board", "Buyers can make you offers", "Then just 3% when it sells"]}
        />
        <IntentCard
          active={intent === "record"}
          onClick={() => setIntent("record")}
          icon={<Rocket size={16} />}
          title="Just list it"
          price="Free"
          lines={["A public post-mortem page", "A dofollow link back to you", "Open it for sale anytime later"]}
        />
      </div>
      <p className="mt-3 text-xs text-bone-400">
        {intent === "sell"
          ? `Fill in the form below and finish with “List for sale · $${SALE_LISTING.dollars}”.`
          : "Fill in the form below and finish with “Publish free”."}
      </p>
    </div>
  );
}

function IntentCard({
  active,
  onClick,
  icon,
  title,
  price,
  lines,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  price: string;
  lines: string[];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border p-4 text-left transition ${
        active
          ? "border-accent-500/50 bg-accent-600/[0.07] shadow-card"
          : "border-black/8 hover:border-black/20 hover:bg-ink-850"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-bold text-bone-100">
          <span className={active ? "text-accent-600" : "text-bone-400"}>{icon}</span>
          {title}
        </span>
        <span className={`text-xs font-semibold ${active ? "text-accent-600" : "text-bone-400"}`}>
          {price}
        </span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {lines.map((l) => (
          <li key={l} className="flex items-start gap-2 text-xs text-bone-400">
            <Check size={13} className="mt-0.5 shrink-0 text-moss-500" />
            {l}
          </li>
        ))}
      </ul>
    </button>
  );
}
