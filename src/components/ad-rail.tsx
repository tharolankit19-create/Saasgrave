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
// render the premium "buy this slot" upsell.
export function AdRail({ slots }: { slots: AdSlot[] }) {
  return (
    <aside className="hidden w-[200px] shrink-0 flex-col gap-4 lg:flex">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone-400">Sponsored</div>
      {slots.map((slot) =>
        slot.active && slot.headline ? (
          <a
            key={slot.id}
            href={slot.cta_url || "#"}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group block rounded-2xl border border-black/8 bg-ink-900 p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
          >
            {slot.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={slot.image_url} alt="" className="mb-3 h-24 w-full rounded-lg border border-black/8 bg-white object-contain p-2" />
            )}
            <div className="text-sm font-semibold text-bone-100">{slot.headline}</div>
            {slot.body && <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-bone-400">{slot.body}</p>}
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-600">
              {slot.cta_label || "Learn more"} →
            </div>
          </a>
        ) : (
          <div key={slot.id} className="min-h-[160px]">
            <BuyAdModal slotId={slot.id} position={slot.position} />
          </div>
        )
      )}
    </aside>
  );
}

// Mobile ad rail — a sliding marquee across the top (screens too narrow for the
// side rails). Auto-scrolls; pauses on touch/hover. Duplicated track = seamless.
export function AdStrip({ slots }: { slots: AdSlot[] }) {
  if (!slots.length) return null;
  const track = [...slots, ...slots];
  return (
    <div className="mb-6 lg:hidden">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-600">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-500" />
        </span>
        Sponsored · your product here for $9
      </div>
      <div className="marquee-mask relative overflow-hidden">
        <div
          className="flex w-max animate-marquee gap-3 pr-3 hover:[animation-play-state:paused]"
          style={{ ["--marquee-dur" as any]: "26s" }}
        >
          {track.map((slot, i) =>
            slot.active && slot.headline ? (
              <a
                key={`${slot.id}-${i}`}
                href={slot.cta_url || "#"}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex min-w-[230px] shrink-0 items-center gap-3 rounded-xl border border-black/8 bg-ink-900 p-3 shadow-card"
              >
                {slot.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slot.image_url} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-black/8 bg-white object-contain p-1" />
                )}
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-bone-100">{slot.headline}</span>
                  {slot.body && <span className="block truncate text-xs text-bone-400">{slot.body}</span>}
                </span>
              </a>
            ) : (
              <div key={`${slot.id}-${i}`} className="min-w-[170px] shrink-0">
                <BuyAdModal slotId={slot.id} position={slot.position} />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
