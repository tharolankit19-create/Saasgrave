import { CountUp } from "@/components/count-up";
import { getLiveStats } from "@/lib/live";

// A live activity strip for the hero — real, current momentum to create urgency
// without a single invented number. A pulsing dot signals it's live; figures
// count up as they scroll in.
export async function LiveFomoBar() {
  const s = await getLiveStats();

  const pills: { value: number; label: string; suffix?: string }[] = [];
  if (s.visitors7d && s.visitors7d > 0) pills.push({ value: s.visitors7d, label: "visitors this week" });
  if (s.buried7d > 0) pills.push({ value: s.buried7d, label: "buried in 7 days" });
  if (s.founders7d > 0) pills.push({ value: s.founders7d, label: "founders joined" });
  pills.push({ value: s.slotsLeft, label: `of ${s.slotsTotal} promo slots left` });

  return (
    <div className="mx-auto flex w-max max-w-full items-center gap-1 overflow-x-auto rounded-full border border-black/8 bg-ink-900 px-2 py-1.5 shadow-card">
      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-moss-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-moss-500">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-moss-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-moss-500" />
        </span>
        Live
      </span>
      {pills.map((p, i) => (
        <span key={p.label} className="flex shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 text-xs text-bone-500">
          <CountUp value={p.value} className="font-semibold text-bone-100" />
          {p.label}
          {i < pills.length - 1 && <span className="ml-1 h-3 w-px bg-black/10" />}
        </span>
      ))}
    </div>
  );
}
