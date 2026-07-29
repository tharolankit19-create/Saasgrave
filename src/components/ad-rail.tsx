import { BuyAdModal } from "@/components/buy-ad-modal";

type AdSlot = {
  id: string;
  position: string;
  active: boolean;
  headline: string | null;
  body: string | null;
  cta_label: string | null;
  cta_url: string | null;
  image_url: string | null;
};

// One vertical rail of 3 ad slots. Active slots render the ad; empty slots
// render the "buy this slot" upsell.
export function AdRail({ slots }: { slots: AdSlot[] }) {
  return (
    <aside className="hidden w-[200px] shrink-0 flex-col gap-4 xl:flex">
      {slots.map((slot) =>
        slot.active && slot.headline ? (
          <a
            key={slot.id}
            href={slot.cta_url || "#"}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block rounded-2xl border border-white/8 bg-ink-900 p-5 transition hover:border-white/20"
          >
            {slot.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slot.image_url} alt="" className="mb-3 h-24 w-full rounded-lg object-cover" />
            )}
            <div className="mb-1 text-[10px] uppercase tracking-widest text-bone-500">Sponsored</div>
            <div className="text-sm font-medium text-bone-100">{slot.headline}</div>
            {slot.body && <p className="mt-1 text-xs text-bone-500">{slot.body}</p>}
            {slot.cta_label && (
              <div className="mt-3 text-xs font-medium text-ember-400">{slot.cta_label} →</div>
            )}
          </a>
        ) : (
          <div key={slot.id} className="min-h-[150px]">
            <BuyAdModal slotId={slot.id} position={slot.position} />
          </div>
        )
      )}
    </aside>
  );
}
