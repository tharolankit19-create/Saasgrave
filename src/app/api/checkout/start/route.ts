import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPromotionCheckout } from "@/lib/checkout-session";
import { PRODUCTS, type ProductKey } from "@/lib/ad-pricing";

export const dynamic = "force-dynamic";

/**
 * One click on a price → the Dodo payment page.
 *
 * A plain GET so every "Buy" on the pricing page is just a link: no popup, no
 * intermediate screen that makes the buyer pick the thing they already picked.
 * Signed-out visitors log in and land straight back here, which then forwards
 * them to payment.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const site = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const product = url.searchParams.get("product") || "";

  const back = (path: string) => NextResponse.redirect(`${site}${path}`, { status: 303 });

  if (!(product in PRODUCTS)) return back("/pricing");
  const key = product as ProductKey;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Log in, then come straight back here and continue to payment.
    const next = encodeURIComponent(`/api/checkout/start?product=${key}`);
    return back(`/login?next=${next}`);
  }

  const result = await createPromotionCheckout({
    product: key,
    userId: user.id,
    email: user.email ?? undefined,
    origin: site,
  });

  if (result.ok) return NextResponse.redirect(result.url, { status: 303 });

  // Something's in the way — send them somewhere that explains it rather than
  // dumping a raw error. /sell when they have nothing to promote yet.
  if (result.code === "no_startup") return back(`/sell?promote=${key}`);
  return back(`/promote?err=${encodeURIComponent(result.error)}`);
}
