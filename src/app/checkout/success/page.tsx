import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Megaphone, Sparkles } from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { verifyDodoPayment } from "@/lib/dodo";
import { fulfilPurchase } from "@/lib/fulfil";
import { LinkButton, Card } from "@/components/ui";
import { AdCreativeForm } from "@/components/ad-creative-form";
import { BadgeEmbed } from "@/components/badge-embed";

export const metadata = { title: "Payment received" };
export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://saasgrave.org";

/**
 * Where Dodo returns the buyer after checkout.
 *
 * This page does the unlocking itself rather than waiting on the webhook: it
 * confirms the payment with Dodo, claims what was bought, and then puts the
 * creative form right here. Paying and landing on a dead end — "payment
 * received" with nowhere to add your product — is the one outcome it exists to
 * prevent.
 */
export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: { p?: string; kind?: string; ref?: string; payment_id?: string; status?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const dodoPaymentId = searchParams.payment_id?.trim() || null;
  let kind = searchParams.kind?.trim() || null;
  let referenceId = searchParams.ref?.trim() || null;

  // Prefer our own payment record — it proves this buyer really started this
  // checkout, and carries the authoritative kind/reference.
  let paymentRow: { id: string; kind: string; reference_id: string; status: string } | null = null;
  if (searchParams.p) {
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("payments")
        .select("id, kind, reference_id, status, user_id")
        .eq("id", searchParams.p)
        .single();
      if (data && data.user_id === user.id) {
        paymentRow = data;
        kind = data.kind;
        referenceId = data.reference_id;
      }
    } catch {
      /* fall back to the query params below */
    }
  }

  // Ask Dodo directly. `true`/`false` are definitive; `null` means we couldn't
  // tell (no API key, network trouble), which we treat as "not yet confirmed".
  const verified = dodoPaymentId ? await verifyDodoPayment(dodoPaymentId) : null;

  // Unlock when we have a payment record for this buyer and Dodo hasn't told us
  // the payment failed. The payment row is only stamped "paid" on a definitive
  // yes, so anything unlocked optimistically stays auditable (an active slot
  // whose payment is still pending) and the webhook reconciles it later.
  let unlocked = false;
  if (kind && referenceId && verified !== false && (paymentRow || verified === true)) {
    unlocked = await fulfilPurchase({
      kind,
      referenceId,
      buyerId: user.id,
      dodoPaymentId,
      markPaid: verified === true,
    });
  }

  const failed = verified === false;

  // ── Ad slot: show the creative form right here ──────────────
  if (!failed && kind === "ad_slot" && referenceId && unlocked) {
    let slot: any = null;
    try {
      const admin = createAdminClient();
      const { data } = await admin
        .from("ad_slots")
        .select("id, name, headline, body, cta_url, image_url, placement, buyer_id")
        .eq("id", referenceId)
        .single();
      if (data && data.buyer_id === user.id) slot = data;
    } catch {
      /* handled below */
    }

    if (slot) {
      return (
        <Shell
          icon={<Megaphone size={28} />}
          title="You're in. Now add your product."
          sub="Payment received. Fill this in and your ad goes live beside every listing straight away."
        >
          <Card className="p-6 sm:p-7">
            <AdCreativeForm slot={slot} />
          </Card>
          <p className="mt-4 text-center text-xs text-bone-500">
            You can edit this any time from your{" "}
            <Link href="/dashboard" className="text-accent-600 hover:underline">
              dashboard
            </Link>
            .
          </p>
        </Shell>
      );
    }
  }

  // ── Featured Launch: hand over the embeddable badge ─────────
  if (!failed && kind === "featured" && referenceId && unlocked) {
    let slug: string | null = null;
    let name: string | null = null;
    try {
      const admin = createAdminClient();
      const { data } = await admin.from("startups").select("slug, name").eq("id", referenceId).single();
      slug = data?.slug ?? null;
      name = data?.name ?? null;
    } catch {
      /* badge still works without the slug */
    }

    return (
      <Shell
        icon={<Sparkles size={28} />}
        title={name ? `${name} is featured.` : "You're featured."}
        sub="Pinned to the top of the graveyard for the next 30 days. Here's your badge — put it on your site."
      >
        <BadgeEmbed site={SITE} slug={slug} />
        <div className="mt-6 flex justify-center gap-3">
          {slug && <LinkButton href={`/startup/${slug}`}>View my listing</LinkButton>}
          <LinkButton href="/dashboard" variant="outline">
            Dashboard
          </LinkButton>
        </div>
      </Shell>
    );
  }

  // ── Payment explicitly failed ───────────────────────────────
  if (failed) {
    return (
      <Shell
        icon={<Clock size={28} />}
        title="That payment didn't go through"
        sub="Nothing was charged. You can try again — it only takes a moment."
      >
        <div className="flex justify-center gap-3">
          <LinkButton href="/promote">Try again</LinkButton>
          <LinkButton href="/support" variant="outline">
            Contact support
          </LinkButton>
        </div>
      </Shell>
    );
  }

  // ── Fallback: paid, but we couldn't unlock it here ──────────
  return (
    <Shell
      icon={<CheckCircle2 size={28} />}
      title="Payment received"
      sub="We're confirming it with the payment provider. Your purchase will appear on your dashboard within a minute — if it doesn't, email me and I'll sort it immediately."
    >
      <div className="flex justify-center gap-3">
        <LinkButton href="/dashboard">Go to dashboard</LinkButton>
        <LinkButton href="/support" variant="outline">
          Support
        </LinkButton>
      </div>
    </Shell>
  );
}

function Shell({
  icon,
  title,
  sub,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-b from-accent-400 to-accent-500 text-white shadow-glow">
          {icon}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-bone-100">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-bone-500">{sub}</p>
      </div>
      {children}
    </div>
  );
}
