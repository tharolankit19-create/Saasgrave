"use client";

import { Button } from "@/components/ui";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="grave-grid flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-5 text-center">
      <h1 className="font-serif text-3xl text-bone-100">Something died unexpectedly</h1>
      <p className="mt-2 text-sm text-bone-500">An error occurred. Try again.</p>
      <div className="mt-7">
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  );
}
