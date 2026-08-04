"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Skull, Tag } from "lucide-react";

export type SearchItem = {
  slug: string;
  name: string;
  category: string | null;
  tagline: string | null;
  for_sale: boolean;
  logo_url: string | null;
};

// The interactive centrepiece of the landing page. Instead of a static hero,
// visitors immediately *use* the graveyard — type a product, see if it's here.
// A live, forgiving search that makes browsing feel like a tool, not a poster.
export function GraveyardSearch({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return [];
    return items
      .filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.category ?? "").toLowerCase().includes(query) ||
          (s.tagline ?? "").toLowerCase().includes(query)
      )
      .slice(0, 6);
  }, [q, items]);

  const showPanel = open && q.trim().length > 0;

  function go(slug?: string) {
    if (slug) router.push(`/startup/${slug}`);
    else router.push(`/browse?q=${encodeURIComponent(q.trim())}`);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]?.slug);
    }
  }

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div
        className={`flex items-center gap-3 rounded-2xl border bg-ink-900/80 px-4 backdrop-blur transition-colors ${
          showPanel ? "border-accent-500/50" : "border-black/12 hover:border-black/20"
        }`}
      >
        <Search size={18} className="shrink-0 text-bone-500" />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
          placeholder="Search the graveyard — a name, a stack, a category…"
          aria-label="Search dead startups"
          autoComplete="off"
          className="h-14 w-full bg-transparent text-[15px] text-bone-100 placeholder:text-bone-500/70 outline-none"
        />
        <button
          onClick={() => go(results[active]?.slug)}
          className="hidden shrink-0 items-center gap-1.5 rounded-full bg-bone-100 px-4 py-2 text-sm font-medium text-ink-950 transition hover:bg-bone-300 sm:inline-flex"
        >
          Enter <ArrowRight size={15} />
        </button>
      </div>

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-black/10 bg-ink-850/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          {results.length > 0 ? (
            <ul className="max-h-[340px] overflow-y-auto py-1.5 text-left">
              {results.map((s, i) => (
                <li key={s.slug}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go(s.slug)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition ${
                      i === active ? "bg-black/[0.06]" : ""
                    }`}
                  >
                    {s.logo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.logo_url}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-lg border border-black/10 object-cover"
                      />
                    ) : (
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-black/10 bg-ink-800 font-serif text-sm text-bone-300">
                        {s.name.charAt(0)}
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-bone-100">{s.name}</span>
                      <span className="block truncate text-xs text-bone-500">
                        {s.tagline || s.category || "Laid to rest"}
                      </span>
                    </span>
                    {s.for_sale && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-600/15 px-2 py-0.5 text-[10px] font-medium text-accent-400">
                        <Tag size={9} /> For sale
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center gap-3 px-4 py-4 text-left">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-black/10 bg-ink-800 text-bone-500">
                <Skull size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-bone-300">
                  No grave for “<span className="text-bone-100">{q.trim()}</span>” yet.
                </p>
                <p className="text-xs text-bone-500">Was it yours? Give it a proper burial.</p>
              </div>
              <a
                href="/sell"
                className="shrink-0 rounded-full border border-accent-500/40 px-3 py-1.5 text-xs font-medium text-accent-400 transition hover:bg-accent-600/10"
              >
                List it
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
