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
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bone-500" />
        <input
          defaultValue={params.get("q") || ""}
          onKeyDown={(e) => {
            if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
          }}
          placeholder="Search by name…"
          className="h-11 w-full rounded-full border border-black/10 bg-ink-900 pl-10 pr-4 text-sm text-bone-100 placeholder:text-bone-500/60 outline-none transition focus:border-ember-500/50"
        />
      </div>

      <select
        defaultValue={params.get("reason") || ""}
        onChange={(e) => update("reason", e.target.value)}
        className="h-11 rounded-full border border-black/10 bg-ink-900 px-4 text-sm text-bone-300 outline-none focus:border-ember-500/50"
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
        className="h-11 rounded-full border border-black/10 bg-ink-900 px-4 text-sm text-bone-300 outline-none focus:border-ember-500/50"
      >
        <option value="">Newest</option>
        <option value="users">Most users</option>
        <option value="revenue">Highest revenue</option>
      </select>

      <button
        onClick={() => update("sale", params.get("sale") === "1" ? "" : "1")}
        className={`h-11 rounded-full border px-4 text-sm transition ${
          params.get("sale") === "1"
            ? "border-ember-500/50 bg-ember-600/15 text-ember-400"
            : "border-black/10 bg-ink-900 text-bone-300 hover:border-black/25"
        }`}
      >
        For sale only
      </button>
    </div>
  );
}
