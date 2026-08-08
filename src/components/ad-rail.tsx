import Link from "next/link";
import { Plus } from "lucide-react";

type AdSlot = {
  id: string;
  position: string;
  active: boolean;
  name?: string | null;
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
            {slot.name && (
              <div className="mb-0.5 font-mono text-[10px] uppercase tracking-wider text-accent-600">
                {slot.name}
              </div>
            )}
            <div className="text-sm font-semibold text-bone-100">{slot.headline}</div>
            {slot.body && <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-bone-400">{slot.body}</p>}
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-600">
              {slot.cta_label || "Learn more"} →
            </div>
          </a>
        ) : (
          <PromoteSlotCard key={slot.id} />
        )
      )}
    </aside>
  );
}

// Empty slot → a link straight to the /promote paywall (no popup checkout).
function PromoteSlotCard() {
  return (
    <Link
      href="/promote"
      className="group flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-accent-500/40 bg-accent-600/[0.06] p-5 text-center transition hover:border-accent-500/70 hover:bg-accent-600/[0.1] hover:shadow-card"
    >
      <span className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow transition group-hover:scale-105">
        <Plus size={16} />
      </span>
      <span className="text-xs font-bold text-bone-100">Put your product here</span>
      <span className="mt-0.5 text-[11px] font-semibold text-accent-600">
        <span className="font-bold">$19</span> / 30 days
      </span>
    </Link>
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
        Sponsored · your product here from $9
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
              <Link
                key={`${slot.id}-${i}`}
                href="/promote"
                className="flex min-w-[170px] shrink-0 items-center gap-2 rounded-xl border border-dashed border-accent-500/40 bg-accent-600/[0.06] p-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow">
                  <Plus size={15} />
                </span>
                <span>
                  <span className="block text-xs font-bold text-bone-100">Your product here</span>
                  <span className="block text-[11px] font-semibold text-accent-600">$19 / 30 days</span>
                </span>
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
}
