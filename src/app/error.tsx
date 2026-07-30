"use client";

import { Button } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-5 text-center">
      <h1 className="font-serif text-3xl text-ink">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-faint">An error occurred. Please try again.</p>
      <div className="mt-7">
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  );
}
