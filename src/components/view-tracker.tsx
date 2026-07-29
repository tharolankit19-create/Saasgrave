"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

// Fire-and-forget view count bump. Guarded so React strict-mode double-mount
// (and re-renders) don't double count in a single page load.
export function ViewTracker({ slug }: { slug: string }) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    createClient().rpc("increment_view", { startup_slug: slug });
  }, [slug]);
  return null;
}
