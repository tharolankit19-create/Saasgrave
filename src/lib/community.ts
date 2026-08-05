// Small shared helpers for the community feed.

export function kindBadge(kind: string) {
  switch (kind) {
    case "win":
      return { label: "Win", tone: "border-moss-500/40 text-moss-500 bg-moss-500/10" };
    case "question":
      return { label: "Question", tone: "border-accent-500/40 text-accent-600 bg-accent-600/10" };
    case "show":
      return { label: "Show", tone: "border-black/15 text-bone-300 bg-black/[0.03]" };
    default:
      return { label: "Story", tone: "border-black/12 text-bone-400 bg-black/[0.02]" };
  }
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
