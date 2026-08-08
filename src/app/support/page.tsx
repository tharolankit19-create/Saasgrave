import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowRight, LifeBuoy } from "lucide-react";
import { Card, Eyebrow, LinkButton } from "@/components/ui";
import { XIcon } from "@/components/brand-icons";

export const metadata: Metadata = {
  title: "Support & contact",
  description: "Get help with Saasgrave — listing, selling, buying, payments and account questions. Contact us by email or on X.",
};

const SUPPORT_EMAIL = "ankittharol7@gmail.com";
const X_HANDLE = "SaasGrave";

const FAQ = [
  { q: "Is it free to list a startup?", a: "Yes — listing is free forever, and opening it for sale is free too. We take a flat 3% only when your startup actually sells. The only paid extras are promotion placements: Featured Launch ($9), a sidebar slot ($19), a sponsored row ($29) or a newsletter mention ($49), each running 30 days." },
  { q: "How do I sell my startup?", a: "List it, then open it for sale free from your dashboard. We take just 3% when it sells. Buyers make offers, you accept or decline from your dashboard, and you handle the transfer directly." },
  { q: "How do offers work?", a: "A buyer sends an offer on a for-sale listing. It appears under “Offers received” on your dashboard where you can Accept or Decline it. Accepting doesn't move money — you arrange the transfer with the buyer." },
  { q: "How is revenue verified?", a: "You connect a read-only key from Stripe, Paddle, Lemon Squeezy or Dodo; we compute MRR from active subscriptions, badge the listing as verified, and never store the key. Self-reported MRR is always shown as unverified." },
  { q: "What is the AI story / post-mortem?", a: "When you list, AI turns your answers into a warm, honest post-mortem others can learn from. You can edit it before publishing — nothing is invented." },
  { q: "How do I get a refund?", a: "Email us at " + SUPPORT_EMAIL + " within 7 days of a paid action if something went wrong and we'll sort it out." },
  { q: "I found a bug or have feedback.", a: "Please tell us — email " + SUPPORT_EMAIL + " or DM @" + X_HANDLE + " on X. We ship fixes fast." },
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <div className="text-center">
        <Eyebrow>Support</Eyebrow>
        <h1 className="font-serif text-4xl tracking-tight text-bone-100 sm:text-5xl">How can we help?</h1>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-bone-400">
          Real answers from a real founder. Most questions are covered below — if not, we reply fast.
        </p>
      </div>

      {/* contact cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <a href={`mailto:${SUPPORT_EMAIL}`} className="group">
          <Card className="flex h-full items-center gap-4 p-6 transition hover:shadow-lift">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-black/10 text-accent-500">
              <Mail size={18} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-bone-100">Email support</div>
              <div className="truncate text-sm text-bone-400 group-hover:text-accent-600">{SUPPORT_EMAIL}</div>
            </div>
          </Card>
        </a>
        <a href={`https://x.com/${X_HANDLE}`} target="_blank" rel="noopener noreferrer" className="group">
          <Card className="flex h-full items-center gap-4 p-6 transition hover:shadow-lift">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-black/10 text-bone-100">
              <XIcon size={16} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-medium text-bone-100">DM us on X</div>
              <div className="truncate text-sm text-bone-400 group-hover:text-accent-600">@{X_HANDLE}</div>
            </div>
          </Card>
        </a>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <div className="mb-6 flex items-center gap-2">
          <LifeBuoy size={16} className="text-accent-500" />
          <h2 className="font-serif text-2xl tracking-tight text-bone-100">Frequently asked</h2>
        </div>
        <div className="divide-y divide-black/8 rounded-2xl border border-black/8 bg-ink-900">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-bone-100">
                {f.q}
                <span className="text-bone-500 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2.5 text-sm leading-relaxed text-bone-400">{f.a}</p>
            </details>
          ))}
        </div>
      </div>

      <Card className="mt-10 p-8 text-center">
        <h2 className="font-serif text-2xl text-bone-100">Still stuck?</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-bone-400">Email us and you&apos;ll hear back from a human — usually the founder.</p>
        <div className="mt-5 flex justify-center">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex h-12 items-center gap-2 rounded-full bg-bone-100 px-7 text-[15px] font-medium text-ink-950 shadow-card transition hover:shadow-lift">
            Email support <ArrowRight size={16} />
          </a>
        </div>
      </Card>

      <div className="mt-8 text-center text-sm text-bone-400">
        Looking for guides instead?{" "}
        <Link href="/guides" className="font-medium text-accent-600 hover:underline">Read the founder guides →</Link>
      </div>
    </div>
  );
}
