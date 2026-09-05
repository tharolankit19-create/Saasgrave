"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ShieldCheck, Loader2, Rocket } from "lucide-react";
import { BadgeEmbed } from "@/components/badge-embed";
import { Button } from "@/components/ui";
import {
  PRODUCTS,
  BUNDLE_LIST_PRICE,
  BUNDLE_SAVING,
  type ProductKey,
} from "@/lib/ad-pricing";

type Startup = {
  id: string;
  slug: string;
  name: string;
  website_url: string | null;
};
export function LaunchPlans({
  startup,
  site,
  pendingPayment = false,
}: {
  startup: Startup;
  site: string;
  pendingPayment?: boolean;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [free, setFree] = useState(false);
  const [website, setWebsite] = useState(startup.website_url || "");
  const [error, setError] = useState("");

  async function checkout(product: ProductKey) {
    if (busy) return;
    setBusy(product);
    setError("");
    try {
      const res = await fetch("/api/launch/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id, product }),
      });
      const data = await res.json();
      if (!res.ok || !data.url)
        throw new Error(data.error || "Checkout couldn't start.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please retry.");
      setBusy(null);
    }
  }
  async function verify() {
    if (busy) return;
    setBusy("verify");
    setError("");
    try {
      const res = await fetch("/api/launch/verify-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startupId: startup.id, websiteUrl: website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed.");
      window.location.assign(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please retry.");
      setBusy(null);
    }
  }

  function paidCard(key: ProductKey) {
    const spec = PRODUCTS[key];
    const recommended = key === "featured";
    const bundle = key === "bundle";
    return (
      <article
        key={key}
        className={`relative flex flex-col rounded-2xl border bg-white p-5 sm:p-6 ${recommended ? "border-accent-500 shadow-lift ring-1 ring-accent-500" : bundle ? "border-accent-500/40 bg-accent-500/[0.03]" : "border-black/10"}`}
      >
        <div className="mb-4 min-h-6">
          {(recommended || bundle) && (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${recommended ? "bg-accent-500 text-white" : "bg-accent-500/10 text-accent-600"}`}
            >
              {recommended
                ? "Recommended · easy start"
                : `Save $${BUNDLE_SAVING} · best value`}
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-bone-100">{spec.name}</h2>
        <p className="mt-2 min-h-16 text-sm leading-relaxed text-bone-500">
          {spec.tagline}
        </p>
        <div className="mt-4 flex items-baseline gap-2">
          {bundle && (
            <span className="text-sm text-bone-500 line-through">
              ${BUNDLE_LIST_PRICE}
            </span>
          )}
          <span className="text-4xl font-bold tracking-tight text-bone-100">
            ${spec.dollars}
          </span>
        </div>
        <p className="mt-1 text-xs text-bone-500">
          {spec.unit} · no subscription
        </p>
        <ul className="my-6 flex-1 space-y-3">
          <li className="flex gap-2 text-sm font-semibold text-accent-600">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            No website badge required
          </li>
          {spec.perks
            .filter(
              (p) => !p.includes("badge required") && !p.includes("embeddable"),
            )
            .map((perk) => (
              <li
                key={perk}
                className="flex gap-2 text-xs leading-relaxed text-bone-300"
              >
                <Check size={14} className="mt-0.5 shrink-0 text-accent-500" />
                {perk}
              </li>
            ))}
        </ul>
        <Button
          disabled={!!busy || pendingPayment}
          onClick={() => checkout(key)}
          className="w-full"
          size="lg"
        >
          {busy === key ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              Launch with {bundle ? "the bundle" : `$${spec.dollars}`}
              <ArrowRight size={15} />
            </>
          )}
        </Button>
      </article>
    );
  }

  return (
    <div>
      {pendingPayment && (
        <div
          role="status"
          className="mb-6 rounded-xl border border-accent-500/30 bg-accent-500/5 p-5 text-sm"
        >
          <strong>Checking your payment</strong>
          <p className="mt-1 text-bone-500">
            Your draft is safe. If you paid, please refresh in a moment;
            don&apos;t pay again. If checkout was cancelled, you can still
            launch free.
          </p>
          <div className="mt-3 flex gap-4">
            <button
              onClick={() => window.location.reload()}
              className="font-semibold text-accent-600"
            >
              Check payment again
            </button>
            <Link href="/support" className="underline">
              Payment support
            </Link>
            <Link href={`/launch/${startup.id}`} className="underline">
              Cancelled checkout? Return to plans
            </Link>
          </div>
        </div>
      )}
      <div className="mb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-600">
          Final step · Choose your launch
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-bone-100 sm:text-5xl">
          Give {startup.name} its next chance.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-bone-500">
          Your listing is ready. Launch free with our badge on your landing
          page, or reach further with a paid plan and keep your website
          badge-free.
        </p>
      </div>
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
        <article className="flex flex-col rounded-2xl border border-black/10 bg-ink-900 p-5 sm:p-6">
          <div className="mb-4 min-h-6 text-xs text-bone-500">
            The free route
          </div>
          <h2 className="text-lg font-semibold text-bone-100">Free Launch</h2>
          <p className="mt-2 min-h-16 text-sm leading-relaxed text-bone-500">
            Share your story and let founders discover what you built.
          </p>
          <div className="mt-4 text-4xl font-bold tracking-tight text-bone-100">
            $0
          </div>
          <p className="mt-1 text-xs text-bone-500">forever · no card</p>
          <ul className="my-6 flex-1 space-y-3 text-xs leading-relaxed text-bone-300">
            {[
              "Public startup & post-mortem page",
              "Dofollow link to your website",
              "Open for sale at no upfront cost",
              "Add our badge to your landing page",
              "Verify the badge before launch",
            ].map((p) => (
              <li key={p} className="flex gap-2">
                <Check size={14} className="mt-0.5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            className="self-start min-h-11"
            disabled={!!busy}
            aria-expanded={free}
            aria-controls="free-launch"
            onClick={() => {
              setFree(!free);
              setError("");
            }}
          >
            Launch free <ArrowRight size={13} />
          </Button>
        </article>
        {(["featured", "directory", "bundle"] as const).map(paidCard)}
      </div>
      <p className="mt-5 text-center text-xs leading-relaxed text-bone-500">
        One payment per product. Promotion runs for the duration shown;
        badge-free launch stays included. If a placement fills during checkout,
        we&apos;ll arrange the next available slot with you. Selling carries a
        3% fee only when a sale completes.
      </p>
      {free && (
        <section
          id="free-launch"
          className="mt-8 rounded-2xl border border-black/10 bg-white p-5 sm:p-8"
        >
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-bone-100">
              Launch free in three steps
            </h2>
            <p className="mt-2 text-sm text-bone-500">
              1. Copy the badge. 2. Add it visibly to your SaaS landing page and
              deploy. 3. Verify below to launch.
            </p>
          </div>
          <BadgeEmbed site={site} slug={startup.slug} launch />
          <label
            className="mt-5 block text-sm font-medium text-bone-300"
            htmlFor="landing-url"
          >
            Your SaaS landing-page URL
          </label>
          <input
            id="landing-url"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourproduct.com"
            className="mt-2 h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-sm outline-none focus:border-accent-500"
          />
          <p className="mt-2 text-xs leading-relaxed text-bone-500">
            Use the actual public landing page. Keep the linked badge visible.
            Verification reads the page HTML, so include it in your initial HTML
            rather than adding it only with JavaScript.
          </p>
          <Button
            onClick={verify}
            disabled={!!busy || !website.trim()}
            className="mt-5"
          >
            {busy === "verify" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Rocket size={16} />
            )}
            Verify badge & launch free
          </Button>
        </section>
      )}
      <details className="mt-8 rounded-2xl border border-black/10 p-5">
        <summary className="cursor-pointer text-sm font-semibold text-bone-300">
          More ways to promote · sidebar, sponsored row & newsletter
        </summary>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {(["sidebar", "sponsored", "newsletter"] as const).map(paidCard)}
        </div>
      </details>
      <div className="mt-8 flex flex-wrap justify-center gap-5 text-xs text-bone-500">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck size={14} />
          Secure payment via Dodo
        </span>
        <Link href="/dashboard" className="underline">
          Finish later · draft saved
        </Link>
        <Link href="/pricing" className="underline">
          Full pricing
        </Link>
      </div>
    </div>
  );
}
