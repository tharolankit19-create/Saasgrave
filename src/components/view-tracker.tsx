"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Fire-and-forget view-count bump. Guarded so React strict-mode double-mount
// (and re-renders) don't double count in a single page load.
//
// NOTE: supabase-js query builders are LAZY — they only send the request when
// awaited or `.then`-ed. The previous version never chained, so the RPC never
// fired and every listing sat at zero views. The `.then()` is what executes it.
export function ViewTracker({ slug }: { slug: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    createClient()
      .rpc("increment_view", { startup_slug: slug })
      .then(({ error }) => {
        if (error) console.warn("view bump failed:", error.message);
      });
  }, [slug]);
  return null;
}
