import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LinkButton } from "@/components/ui";

export const metadata = { title: "Payment received" };

// Dodo redirects here after checkout. The webhook does the real unlocking —
// this page just reassures the buyer. It can take a moment to reflect.
export default function CheckoutSuccess() {
  return (
    <div className="grave-grid flex min-h-[calc(100vh-4rem)] items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full border border-moss-500/30 bg-moss-500/10 text-moss-400">
          <CheckCircle2 size={30} />
        </div>
        <h1 className="font-serif text-3xl text-ink">Payment received</h1>
        <p className="mt-3 text-sm text-ink-faint">
          Thank you. We&apos;re confirming it with the payment provider now — your purchase will
          appear on your dashboard within a minute.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href="/dashboard">Go to dashboard</LinkButton>
          <LinkButton href="/browse" variant="outline">
            Browse
          </LinkButton>
        </div>
      </div>
    </div>
  );
}
