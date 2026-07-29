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
    <aside className="hidden w-[190px] shrink-0 flex-col gap-4 lg:flex">
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

// Horizontal ad strip for screens too narrow for the side rails.
export function AdStrip({ slots }: { slots: AdSlot[] }) {
  return (
    <div className="mb-6 lg:hidden">
      <div className="mb-2 text-[10px] uppercase tracking-widest text-bone-500">
        Sponsored · book a slot for $49
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {slots.map((slot) =>
          slot.active && slot.headline ? (
            <a
              key={slot.id}
              href={slot.cta_url || "#"}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="min-w-[220px] shrink-0 rounded-xl border border-white/8 bg-ink-900 p-4"
            >
              <div className="text-sm font-medium text-bone-100">{slot.headline}</div>
              {slot.body && <p className="mt-1 text-xs text-bone-500">{slot.body}</p>}
            </a>
          ) : (
            <div key={slot.id} className="min-w-[150px] shrink-0">
              <BuyAdModal slotId={slot.id} position={slot.position} />
            </div>
          )
        )}
      </div>
    </div>
  );
}
