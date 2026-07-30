"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

const REASONS = [
  "No market need",
  "Ran out of cash",
  "Competition",
  "Wrong team",
  "Bad timing",
  "Lost focus",
  "Other",
];

export function BrowseFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/browse?${next.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
        <input
          defaultValue={params.get("q") || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
          }}
          placeholder="Search by name…"
          className="h-11 w-full rounded-full border border-line bg-card pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint outline-none transition focus:border-accent-500/50"
        />
      </div>

      <select
        defaultValue={params.get("reason") || ""}
        onChange={(e) => update("reason", e.target.value)}
        className="h-11 rounded-full border border-line bg-card px-4 text-sm text-ink-soft outline-none focus:border-accent-500/50"
      >
        <option value="">Any cause of death</option>
        {REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      <select
        defaultValue={params.get("sort") || ""}
        onChange={(e) => update("sort", e.target.value)}
        className="h-11 rounded-full border border-line bg-card px-4 text-sm text-ink-soft outline-none focus:border-accent-500/50"
      >
        <option value="">Newest</option>
        <option value="views">Most viewed</option>
        <option value="revenue">Highest revenue</option>
      </select>

      <button
        onClick={() => update("sale", params.get("sale") === "1" ? "" : "1")}
        className={`h-11 rounded-full border px-4 text-sm transition ${
          params.get("sale") === "1"
            ? "border-accent-500/50 bg-accent-600/15 text-accent-400"
            : "border-line bg-card text-ink-soft hover:border-ink/25"
        }`}
      >
        For sale only
      </button>
    </div>
  );
}
