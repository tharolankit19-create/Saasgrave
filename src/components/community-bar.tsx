import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";

// Slim bar that sits above the navbar, pulling people into the community.
export function CommunityBar() {
  return (
    <Link
      href="/community"
      className="group block border-b border-black/[0.06] bg-ink-900"
    >
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-5 text-xs text-bone-400">
        <Users size={13} className="text-accent-500" />
        <span className="font-medium text-bone-300">Community</span>
        <span className="hidden sm:inline">— founders sharing wins, failures & the questions nobody posts on LinkedIn.</span>
        <span className="inline-flex items-center gap-0.5 font-medium text-accent-600 transition group-hover:gap-1.5">
          Join in <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
